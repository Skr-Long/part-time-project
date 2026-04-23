import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, confirmPassword } = body

    if (!email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: '请填写所有必填字段' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: '两次输入的密码不一致' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码至少需要 6 个字符' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    })

    return NextResponse.json(
      { message: '注册成功', userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('注册错误:', error)
    return NextResponse.json(
      { error: '注册时发生错误' },
      { status: 500 }
    )
  }
}
