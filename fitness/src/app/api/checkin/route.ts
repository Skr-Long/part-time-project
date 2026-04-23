import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const body = await request.json()
    const { date, completed, actualCarbs, actualProtein, actualFat, notes } = body

    const checkInDate = date ? new Date(date) : new Date()
    checkInDate.setHours(0, 0, 0, 0)

    const checkIn = await prisma.checkIn.upsert({
      where: {
        userId_date: {
          userId: session.user.id,
          date: checkInDate,
        },
      },
      update: {
        completed,
        actualCarbs: actualCarbs !== undefined ? parseFloat(actualCarbs) : null,
        actualProtein: actualProtein !== undefined ? parseFloat(actualProtein) : null,
        actualFat: actualFat !== undefined ? parseFloat(actualFat) : null,
        notes: notes || null,
      },
      create: {
        userId: session.user.id,
        date: checkInDate,
        completed,
        actualCarbs: actualCarbs !== undefined ? parseFloat(actualCarbs) : null,
        actualProtein: actualProtein !== undefined ? parseFloat(actualProtein) : null,
        actualFat: actualFat !== undefined ? parseFloat(actualFat) : null,
        notes: notes || null,
      },
    })

    return NextResponse.json({
      message: completed ? '打卡成功' : '保存成功',
      checkIn,
    })
  } catch (error) {
    console.error('打卡错误:', error)
    return NextResponse.json(
      { error: '保存时发生错误' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const todayParam = searchParams.get('today')

    if (todayParam === 'true') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const checkIn = await prisma.checkIn.findUnique({
        where: {
          userId_date: {
            userId: session.user.id,
            date: today,
          },
        },
      })

      return NextResponse.json({ checkIn: checkIn || null })
    }

    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)

      const checkIns = await prisma.checkIn.findMany({
        where: {
          userId: session.user.id,
          date: {
            gte: start,
            lte: end,
          },
        },
        orderBy: { date: 'asc' },
      })

      return NextResponse.json({ checkIns })
    }

    return NextResponse.json({ error: '缺少参数' }, { status: 400 })
  } catch (error) {
    console.error('获取打卡记录错误:', error)
    return NextResponse.json(
      { error: '获取数据时发生错误' },
      { status: 500 }
    )
  }
}
