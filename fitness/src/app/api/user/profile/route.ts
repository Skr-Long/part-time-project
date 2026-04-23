import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { Gender, Goal, ActivityLevel } from '@prisma/client'
import { calculateBMR, calculateTDEE, calculateTargetCalories } from '@/lib/calculator'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const body = await request.json()
    const { weight, height, age, gender, goal, activityLevel } = body

    if (!weight || !height || !age || !gender || !goal || !activityLevel) {
      return NextResponse.json(
        { error: '请填写所有必填字段' },
        { status: 400 }
      )
    }

    const profileData = {
      weight: parseFloat(weight),
      height: parseFloat(height),
      age: parseInt(age),
      gender: gender as Gender,
      goal: goal as Goal,
      activityLevel: activityLevel as ActivityLevel,
    }

    const profile = await prisma.userProfile.upsert({
      where: { userId: session.user.id },
      update: profileData,
      create: {
        ...profileData,
        userId: session.user.id,
      },
    })

    const existingNutritionPlan = await prisma.nutritionPlan.findUnique({
      where: { userId: session.user.id },
    })

    if (!existingNutritionPlan) {
      await prisma.nutritionPlan.create({
        data: { userId: session.user.id },
      })
    }

    const existingCyclePlan = await prisma.cyclePlan.findUnique({
      where: { userId: session.user.id },
    })

    if (!existingCyclePlan) {
      await prisma.cyclePlan.create({
        data: { userId: session.user.id },
      })
    }

    const bmr = calculateBMR(profile.weight, profile.height, profile.age, profile.gender)
    const tdee = calculateTDEE(bmr, profile.activityLevel)
    const targetCalories = calculateTargetCalories(tdee, profile.goal)

    return NextResponse.json({
      message: '保存成功',
      profile,
      calculations: {
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        targetCalories,
      },
    })
  } catch (error) {
    console.error('保存用户资料错误:', error)
    return NextResponse.json(
      { error: '保存时发生错误' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    })

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('获取用户资料错误:', error)
    return NextResponse.json(
      { error: '获取数据时发生错误' },
      { status: 500 }
    )
  }
}
