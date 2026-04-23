import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { NutritionMode } from '@prisma/client'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const nutritionPlan = await prisma.nutritionPlan.findUnique({
      where: { userId: session.user.id },
    })

    return NextResponse.json({ nutritionPlan })
  } catch (error) {
    console.error('获取营养计划错误:', error)
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
      mode,
      highCarbsCarbs,
      highCarbsProtein,
      highCarbsFat,
      mediumCarbsCarbs,
      mediumCarbsProtein,
      mediumCarbsFat,
      lowCarbsCarbs,
      lowCarbsProtein,
      lowCarbsFat,
      highCarbsCarbsPerKg,
      highCarbsProteinPerKg,
      highCarbsFatPerKg,
      mediumCarbsCarbsPerKg,
      mediumCarbsProteinPerKg,
      mediumCarbsFatPerKg,
      lowCarbsCarbsPerKg,
      lowCarbsProteinPerKg,
      lowCarbsFatPerKg,
    } = body

    if (mode === NutritionMode.PERCENTAGE) {
      const days = [
        { carbs: highCarbsCarbs, protein: highCarbsProtein, fat: highCarbsFat },
        { carbs: mediumCarbsCarbs, protein: mediumCarbsProtein, fat: mediumCarbsFat },
        { carbs: lowCarbsCarbs, protein: lowCarbsProtein, fat: lowCarbsFat },
      ]

      for (const day of days) {
        const total = (day.carbs || 0) + (day.protein || 0) + (day.fat || 0)
        if (total !== 100) {
          return NextResponse.json(
            { error: '各营养成分百分比之和必须等于 100%' },
            { status: 400 }
          )
        }
      }
    } else if (mode === NutritionMode.WEIGHT) {
      const values = [
        highCarbsCarbsPerKg,
        highCarbsProteinPerKg,
        highCarbsFatPerKg,
        mediumCarbsCarbsPerKg,
        mediumCarbsProteinPerKg,
        mediumCarbsFatPerKg,
        lowCarbsCarbsPerKg,
        lowCarbsProteinPerKg,
        lowCarbsFatPerKg,
      ]

      for (const value of values) {
        if (value === undefined || value === null || value < 0) {
          return NextResponse.json(
            { error: '数值必须大于等于 0' },
            { status: 400 }
          )
        }
      }
    }

    const nutritionPlan = await prisma.nutritionPlan.update({
      where: { userId: session.user.id },
      data: {
        mode,
        highCarbsCarbs,
        highCarbsProtein,
        highCarbsFat,
        mediumCarbsCarbs,
        mediumCarbsProtein,
        mediumCarbsFat,
        lowCarbsCarbs,
        lowCarbsProtein,
        lowCarbsFat,
        highCarbsCarbsPerKg,
        highCarbsProteinPerKg,
        highCarbsFatPerKg,
        mediumCarbsCarbsPerKg,
        mediumCarbsProteinPerKg,
        mediumCarbsFatPerKg,
        lowCarbsCarbsPerKg,
        lowCarbsProteinPerKg,
        lowCarbsFatPerKg,
      },
    })

    return NextResponse.json({
      message: '保存成功',
      nutritionPlan,
    })
  } catch (error) {
    console.error('保存营养计划错误:', error)
    return NextResponse.json(
      { error: '保存时发生错误' },
      { status: 500 }
    )
  }
}
