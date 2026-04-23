'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Navbar } from '@/components/layout/navbar'
import { CyclePlan } from '@prisma/client'
import { CarbDayType } from '@/types/enums'
import { formatCarbDayType } from '@/lib/calculator'
import { cn } from '@/lib/utils'

const dayNames = [
  { key: 'monday', label: '周一' },
  { key: 'tuesday', label: '周二' },
  { key: 'wednesday', label: '周三' },
  { key: 'thursday', label: '周四' },
  { key: 'friday', label: '周五' },
  { key: 'saturday', label: '周六' },
  { key: 'sunday', label: '周日' },
]

const dayTypes = [
  { type: CarbDayType.HIGH, label: '高碳日' },
  { type: CarbDayType.MEDIUM, label: '中碳日' },
  { type: CarbDayType.LOW, label: '低碳日' },
]

const presets = [
  {
    name: '经典 7 天',
    value: {
      monday: CarbDayType.HIGH,
      tuesday: CarbDayType.LOW,
      wednesday: CarbDayType.MEDIUM,
      thursday: CarbDayType.LOW,
      friday: CarbDayType.MEDIUM,
      saturday: CarbDayType.LOW,
      sunday: CarbDayType.LOW,
    },
  },
  {
    name: '交替模式',
    value: {
      monday: CarbDayType.HIGH,
      tuesday: CarbDayType.LOW,
      wednesday: CarbDayType.HIGH,
      thursday: CarbDayType.LOW,
      friday: CarbDayType.HIGH,
      saturday: CarbDayType.LOW,
      sunday: CarbDayType.LOW,
    },
  },
  {
    name: '周末高碳',
    value: {
      monday: CarbDayType.LOW,
      tuesday: CarbDayType.MEDIUM,
      wednesday: CarbDayType.LOW,
      thursday: CarbDayType.MEDIUM,
      friday: CarbDayType.LOW,
      saturday: CarbDayType.HIGH,
      sunday: CarbDayType.MEDIUM,
    },
  },
]

const typeColors: Record<CarbDayType, string> = {
  [CarbDayType.HIGH]: 'bg-carb-high/10 text-carb-high border-carb-high/30',
  [CarbDayType.MEDIUM]: 'bg-carb-medium/10 text-carb-medium border-carb-medium/30',
  [CarbDayType.LOW]: 'bg-carb-low/10 text-carb-low border-carb-low/30',
}

const typeBgColors: Record<CarbDayType, string> = {
  [CarbDayType.HIGH]: 'bg-carb-high',
  [CarbDayType.MEDIUM]: 'bg-carb-medium',
  [CarbDayType.LOW]: 'bg-carb-low',
}

export default function CyclePlanPage() {
  const router = useRouter()
  const { status } = useSession()
  const [plan, setPlan] = useState<CyclePlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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
      const response = await fetch('/api/user/cycle-plan')
      const result = await response.json()

      if (!response.ok) {
        setError(result.error || '获取数据失败')
        return
      }

      setPlan(result.cyclePlan)
    } catch {
      setError('获取数据时发生错误')
    } finally {
      setLoading(false)
    }
  }

  const toggleDayType = (day: keyof CyclePlan) => {
    if (!plan) return

    const currentType = plan[day] as CarbDayType
    const typeOrder = [CarbDayType.HIGH, CarbDayType.MEDIUM, CarbDayType.LOW]
    const currentIndex = typeOrder.indexOf(currentType)
    const nextIndex = (currentIndex + 1) % typeOrder.length

    setPlan({ ...plan, [day]: typeOrder[nextIndex] })
  }

  const applyPreset = (preset: typeof presets[0]) => {
    if (!plan) return
    setPlan({ ...plan, ...preset.value })
  }

  const handleSave = async () => {
    if (!plan) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/user/cycle-plan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monday: plan.monday,
          tuesday: plan.tuesday,
          wednesday: plan.wednesday,
          thursday: plan.thursday,
          friday: plan.friday,
          saturday: plan.saturday,
          sunday: plan.sunday,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || '保存失败')
        return
      }

      setSuccess('保存成功')
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('保存时发生错误')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (error && !plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  if (!plan) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">一周循环计划</h1>

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center">
            <Check size={18} className="mr-2" />
            {success}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            {error}
          </div>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>预设方案</CardTitle>
            <CardDescription>
              选择一个预设方案快速设置您的一周计划
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <Button
                  key={preset.name}
                  variant="outline"
                  onClick={() => applyPreset(preset)}
                >
                  {preset.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>自定义计划</CardTitle>
            <CardDescription>
              点击每一天切换碳日类型（高碳日 → 中碳日 → 低碳日 → 循环）
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
              {dayNames.map(({ key, label }) => {
                const dayKey = key as keyof CyclePlan
                const dayType = plan[dayKey] as CarbDayType

                return (
                  <button
                    key={key}
                    onClick={() => toggleDayType(dayKey)}
                    className={cn(
                      'p-4 rounded-xl border-2 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                      typeColors[dayType]
                    )}
                  >
                    <p className="text-sm font-medium mb-2">{label}</p>
                    <div
                      className={cn(
                        'w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2',
                        typeBgColors[dayType]
                      )}
                    >
                      <Check size={20} className="text-white opacity-0" />
                    </div>
                    <p className="text-sm font-semibold">{formatCarbDayType(dayType)}</p>
                  </button>
                )
              })}
            </div>

            <div className="flex justify-center mt-6 gap-6 text-sm">
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

        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleSave}
            className={cn(
              'bg-primary-600 hover:bg-primary-700',
              saving && 'cursor-not-allowed opacity-50'
            )}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              '保存计划'
            )}
          </Button>
        </div>
      </main>
    </div>
  )
}
