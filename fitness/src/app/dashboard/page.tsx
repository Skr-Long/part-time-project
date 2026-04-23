'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Loader2,
  Check,
  ChevronRight,
  Utensils,
  Calendar,
  Settings,
  Flame,
  FlameIcon as Protein,
  Droplets,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/layout/navbar'
import { CarbDayType } from '@/types/enums'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface DashboardData {
  today: {
    type: CarbDayType
    typeLabel: string
    macros: {
      calories: number
      carbs: number
      protein: number
      fat: number
    }
    checkIn: {
      completed: boolean
    } | null
  }
  weekStatus: {
    day: string
    type: CarbDayType
    typeLabel: string
    completed: boolean
    isToday: boolean
  }[]
}

const typeColors: Record<CarbDayType, string> = {
  [CarbDayType.HIGH]: 'bg-carb-high/10 text-carb-high',
  [CarbDayType.MEDIUM]: 'bg-carb-medium/10 text-carb-medium',
  [CarbDayType.LOW]: 'bg-carb-low/10 text-carb-low',
}

const typeBgColors: Record<CarbDayType, string> = {
  [CarbDayType.HIGH]: 'bg-carb-high',
  [CarbDayType.MEDIUM]: 'bg-carb-medium',
  [CarbDayType.LOW]: 'bg-carb-low',
}

export default function DashboardPage() {
  const router = useRouter()
  const { status } = useSession()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    fetchData()
  }, [status, router])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/user/dashboard')
      const result = await response.json()

      if (!response.ok) {
        if (result.error === '用户资料不完整') {
          router.push('/setup')
          return
        }
        setError(result.error || '获取数据失败')
        return
      }

      setData(result)
    } catch {
      setError('获取数据时发生错误')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">仪表盘</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="md:col-span-2 lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>今日状态</span>
                <Link
                  href="/checkin"
                  className="text-primary-600 text-sm font-medium hover:text-primary-700 flex items-center"
                >
                  去打卡 <ChevronRight size={16} />
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">今日类型</span>
                    <span
                      className={cn(
                        'px-3 py-1 rounded-full text-sm font-medium',
                        typeColors[data.today.type]
                      )}
                    >
                      {data.today.typeLabel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">打卡状态</span>
                    {data.today.checkIn?.completed ? (
                      <span className="flex items-center text-green-600">
                        <Check size={18} className="mr-1" />
                        已完成
                      </span>
                    ) : (
                      <span className="text-orange-500">未打卡</span>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                    <div className="flex items-center">
                      <Flame size={18} className="text-orange-500 mr-2" />
                      <span className="text-gray-600">热量</span>
                    </div>
                    <span className="font-semibold text-orange-600">
                      {data.today.macros.calories} kcal
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-amber-50 rounded-lg">
                    <div className="flex items-center">
                      <Protein size={18} className="text-amber-600 mr-2" />
                      <span className="text-gray-600">蛋白质</span>
                    </div>
                    <span className="font-semibold text-amber-700">
                      {data.today.macros.protein} g
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <Droplets size={18} className="text-blue-500 mr-2" />
                      <span className="text-gray-600">碳水</span>
                    </div>
                    <span className="font-semibold text-blue-600">
                      {data.today.macros.carbs} g
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <Droplets size={18} className="text-green-500 mr-2" />
                      <span className="text-gray-600">脂肪</span>
                    </div>
                    <span className="font-semibold text-green-600">
                      {data.today.macros.fat} g
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">快捷操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => router.push('/checkin')}
              >
                <Utensils className="mr-3 h-5 w-5 text-primary-600" />
                今日打卡
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => router.push('/cycle-plan')}
              >
                <Calendar className="mr-3 h-5 w-5 text-primary-600" />
                循环计划
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => router.push('/nutrition-plan')}
              >
                <Settings className="mr-3 h-5 w-5 text-primary-600" />
                营养设置
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">本周概览</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {data.weekStatus.map((day, index) => (
                <div
                  key={index}
                  className={cn(
                    'text-center p-3 rounded-lg border-2 transition-colors',
                    day.isToday
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 bg-white'
                  )}
                >
                  <p className="text-xs text-gray-500 mb-2">{day.day}</p>
                  <div
                    className={cn(
                      'w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2',
                      typeBgColors[day.type]
                    )}
                  >
                    {day.completed && (
                      <Check size={18} className="text-white" />
                    )}
                  </div>
                  <p className="text-xs font-medium">{day.typeLabel}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-4 gap-6 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-carb-high mr-2"></div>
                <span className="text-gray-600">高碳日</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-carb-medium mr-2"></div>
                <span className="text-gray-600">中碳日</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-carb-low mr-2"></div>
                <span className="text-gray-600">低碳日</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
