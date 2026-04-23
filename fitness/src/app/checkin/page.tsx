'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2, Check, ChevronDown, ChevronUp, Flame, Droplets, Utensils } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/layout/navbar'
import { CarbDayType } from '@/types/enums'
import { formatCarbDayType } from '@/lib/calculator'
import { cn, formatDate } from '@/lib/utils'

interface TodayData {
  type: CarbDayType
  typeLabel: string
  macros: {
    calories: number
    carbs: number
    protein: number
    fat: number
  }
}

interface CheckInData {
  completed: boolean
  actualCarbs?: number
  actualProtein?: number
  actualFat?: number
  notes?: string
}

const typeColors: Record<CarbDayType, string> = {
  [CarbDayType.HIGH]: 'bg-carb-high/10 text-carb-high border-carb-high/30',
  [CarbDayType.MEDIUM]: 'bg-carb-medium/10 text-carb-medium border-carb-medium/30',
  [CarbDayType.LOW]: 'bg-carb-low/10 text-carb-low border-carb-low/30',
}

export default function CheckinPage() {
  const router = useRouter()
  const { status } = useSession()
  const [todayData, setTodayData] = useState<TodayData | null>(null)
  const [checkIn, setCheckIn] = useState<CheckInData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showDetails, setShowDetails] = useState(false)
  const [actualCarbs, setActualCarbs] = useState('')
  const [actualProtein, setActualProtein] = useState('')
  const [actualFat, setActualFat] = useState('')
  const [notes, setNotes] = useState('')

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
      const [dashboardResponse, checkInResponse] = await Promise.all([
        fetch('/api/user/dashboard'),
        fetch('/api/checkin?today=true'),
      ])

      const dashboardResult = await dashboardResponse.json()
      const checkInResult = await checkInResponse.json()

      if (!dashboardResponse.ok) {
        if (dashboardResult.error === '用户资料不完整') {
          router.push('/setup')
          return
        }
        setError(dashboardResult.error || '获取数据失败')
        return
      }

      setTodayData(dashboardResult.today)

      if (checkInResult.checkIn) {
        setCheckIn(checkInResult.checkIn)
        setActualCarbs(checkInResult.checkIn.actualCarbs?.toString() || '')
        setActualProtein(checkInResult.checkIn.actualProtein?.toString() || '')
        setActualFat(checkInResult.checkIn.actualFat?.toString() || '')
        setNotes(checkInResult.checkIn.notes || '')
      }
    } catch {
      setError('获取数据时发生错误')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickCheckin = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completed: true,
          actualCarbs: actualCarbs || undefined,
          actualProtein: actualProtein || undefined,
          actualFat: actualFat || undefined,
          notes: notes || undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || '打卡失败')
        return
      }

      setCheckIn({
        completed: true,
        actualCarbs: actualCarbs ? parseFloat(actualCarbs) : undefined,
        actualProtein: actualProtein ? parseFloat(actualProtein) : undefined,
        actualFat: actualFat ? parseFloat(actualFat) : undefined,
        notes: notes || undefined,
      })
      setSuccess('打卡成功！')
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('打卡时发生错误')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveDetails = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completed: checkIn?.completed || false,
          actualCarbs: actualCarbs || undefined,
          actualProtein: actualProtein || undefined,
          actualFat: actualFat || undefined,
          notes: notes || undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || '保存失败')
        return
      }

      setSuccess('保存成功！')
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

  if (error && !todayData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  if (!todayData) return null

  const today = new Date()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">今日打卡</h1>

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
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="text-gray-600 text-base">{formatDate(today)}</span>
              <span
                className={cn(
                  'px-3 py-1 rounded-full text-sm font-medium border',
                  typeColors[todayData.type]
                )}
              >
                {todayData.typeLabel}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center">
                  <Flame size={20} className="text-orange-500 mr-3" />
                  <span className="text-gray-600">目标热量</span>
                </div>
                <span className="font-semibold text-orange-600">
                  {todayData.macros.calories} kcal
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Droplets size={18} className="text-blue-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-500 mb-1">碳水</p>
                  <p className="font-semibold text-blue-600">{todayData.macros.carbs}g</p>
                </div>
                <div className="text-center p-3 bg-amber-50 rounded-lg">
                  <Utensils size={18} className="text-amber-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-500 mb-1">蛋白质</p>
                  <p className="font-semibold text-amber-700">{todayData.macros.protein}g</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <Droplets size={18} className="text-green-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-500 mb-1">脂肪</p>
                  <p className="font-semibold text-green-600">{todayData.macros.fat}g</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                {checkIn?.completed ? (
                  <div className="flex items-center justify-center sm:justify-start">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <Check size={24} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-600">今日已打卡</p>
                      <p className="text-sm text-gray-500">继续保持！</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold text-gray-900">今日未打卡</p>
                    <p className="text-sm text-gray-500">点击按钮完成打卡</p>
                  </div>
                )}
              </div>
              <Button
                onClick={handleQuickCheckin}
                className={cn(
                  'w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-lg h-12',
                  saving && 'cursor-not-allowed opacity-50'
                )}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    处理中...
                  </>
                ) : (
                  '完成打卡'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between text-left"
            >
              <CardTitle className="text-lg">详细记录（可选）</CardTitle>
              {showDetails ? (
                <ChevronUp size={20} className="text-gray-500" />
              ) : (
                <ChevronDown size={20} className="text-gray-500" />
              )}
            </button>
          </CardHeader>
          {showDetails && (
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="actualCarbs">实际碳水 (g)</Label>
                  <Input
                    id="actualCarbs"
                    type="number"
                    min="0"
                    step="1"
                    value={actualCarbs}
                    onChange={(e) => setActualCarbs(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="actualProtein">实际蛋白质 (g)</Label>
                  <Input
                    id="actualProtein"
                    type="number"
                    min="0"
                    step="1"
                    value={actualProtein}
                    onChange={(e) => setActualProtein(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="actualFat">实际脂肪 (g)</Label>
                  <Input
                    id="actualFat"
                    type="number"
                    min="0"
                    step="1"
                    value={actualFat}
                    onChange={(e) => setActualFat(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">备注</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="记录今天的饮食感受或其他备注..."
                  rows={3}
                />
              </div>

              <Button
                onClick={handleSaveDetails}
                variant="outline"
                className={cn(
                  'w-full',
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
                  '保存详细记录'
                )}
              </Button>
            </CardContent>
          )}
        </Card>
      </main>
    </div>
  )
}
