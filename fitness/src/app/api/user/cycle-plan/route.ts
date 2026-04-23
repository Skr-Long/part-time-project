import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { CarbDayType } from '@prisma/client'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const cyclePlan = await prisma.cyclePlan.findUnique({
      where: { userId: session.user.id },
    })

    return NextResponse.json({ cyclePlan })
  } catch (error) {
    console.error('获取循环计划错误:', error)
    return NextResponse.json(
      { error: '获取数据时发生错误' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const body = await request.json()
    const {
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
      saturday,
      sunday,
    } = body

    const cyclePlan = await prisma.cyclePlan.update({
      where: { userId: session.user.id },
      data: {
        monday,
        tuesday,
        wednesday,
        thursday,
        friday,
        saturday,
        sunday,
      },
    })

    return NextResponse.json({
      message: '保存成功',
      cyclePlan,
    })
  } catch (error) {
    console.error('保存循环计划错误:', error)
    return NextResponse.json(
      { error: '保存时发生错误' },
      { status: 500 }
    )
  }
}

export const PRESETS = {
  CLASSIC: {
    monday: CarbDayType.HIGH,
    tuesday: CarbDayType.LOW,
    wednesday: CarbDayType.MEDIUM,
    thursday: CarbDayType.LOW,
    friday: CarbDayType.MEDIUM,
    saturday: CarbDayType.LOW,
    sunday: CarbDayType.LOW,
  },
  ALTERNATING: {
    monday: CarbDayType.HIGH,
    tuesday: CarbDayType.LOW,
    wednesday: CarbDayType.HIGH,
    thursday: CarbDayType.LOW,
    friday: CarbDayType.HIGH,
    saturday: CarbDayType.LOW,
    sunday: CarbDayType.LOW,
  },
  WEEKEND_HIGH: {
    monday: CarbDayType.LOW,
    tuesday: CarbDayType.MEDIUM,
    wednesday: CarbDayType.LOW,
    thursday: CarbDayType.MEDIUM,
    friday: CarbDayType.LOW,
    saturday: CarbDayType.HIGH,
    sunday: CarbDayType.MEDIUM,
  },
}
