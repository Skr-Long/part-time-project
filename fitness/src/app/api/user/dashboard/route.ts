import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import {
  calculateAllMacros,
  getMacrosForDayType,
  formatCarbDayType,
  CarbDayType,
} from '@/lib/calculator'
import { getWeekDates, isSameDay } from '@/lib/utils'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true,
        nutritionPlan: true,
        cyclePlan: true,
        checkIns: {
          orderBy: { date: 'desc' },
          take: 14,
        },
      },
    })

    if (!user?.profile || !user?.nutritionPlan || !user?.cyclePlan) {
      return NextResponse.json(
        { error: '用户资料不完整' },
        { status: 400 }
      )
    }

    const weekDates = getWeekDates()
    const today = new Date()
    const todayDayOfWeek = today.getDay()

    const dayTypeMap: Record<number, keyof typeof user.cyclePlan> = {
      1: 'monday',
      2: 'tuesday',
      3: 'wednesday',
      4: 'thursday',
      5: 'friday',
      6: 'saturday',
      0: 'sunday',
    }

    const todayType = user.cyclePlan[dayTypeMap[todayDayOfWeek]] as CarbDayType

    const macros = calculateAllMacros(user.profile, user.nutritionPlan)
    const todayMacros = getMacrosForDayType(macros, todayType)

    const weekPlan = [
      { day: '周一', date: weekDates[0], type: user.cyclePlan.monday },
      { day: '周二', date: weekDates[1], type: user.cyclePlan.tuesday },
      { day: '周三', date: weekDates[2], type: user.cyclePlan.wednesday },
      { day: '周四', date: weekDates[3], type: user.cyclePlan.thursday },
      { day: '周五', date: weekDates[4], type: user.cyclePlan.friday },
      { day: '周六', date: weekDates[5], type: user.cyclePlan.saturday },
      { day: '周日', date: weekDates[6], type: user.cyclePlan.sunday },
    ]

    const weekStatus = weekPlan.map((item) => {
      const checkIn = user.checkIns.find((ci) =>
        isSameDay(ci.date, item.date)
      )
      return {
        ...item,
        completed: checkIn?.completed || false,
        isToday: isSameDay(item.date, today),
        typeLabel: formatCarbDayType(item.type),
      }
    })

    const todayCheckIn = user.checkIns.find((ci) => isSameDay(ci.date, today))

    return NextResponse.json({
      profile: user.profile,
      nutritionPlan: user.nutritionPlan,
      cyclePlan: user.cyclePlan,
      today: {
        type: todayType,
        typeLabel: formatCarbDayType(todayType),
        macros: todayMacros,
        checkIn: todayCheckIn || null,
      },
      weekStatus,
    })
  } catch (error) {
    console.error('获取仪表盘数据错误:', error)
    return NextResponse.json(
      { error: '获取数据时发生错误' },
      { status: 500 }
    )
  }
}
