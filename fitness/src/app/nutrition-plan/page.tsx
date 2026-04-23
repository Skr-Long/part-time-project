'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Navbar } from '@/components/layout/navbar'
import { NutritionMode, NutritionPlan as NutritionPlanType } from '@prisma/client'
import { cn } from '@/lib/utils'

export default function NutritionPlanPage() {
  const router = useRouter()
  const { status } = useSession()
  const [plan, setPlan] = useState<NutritionPlanType | null>(null)
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
      const response = await fetch('/api/user/nutrition-plan')
      const result = await response.json()

      if (!response.ok) {
        setError(result.error || '获取数据失败')
        return
      }

      setPlan(result.nutritionPlan)
    } catch {
      setError('获取数据时发生错误')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!plan) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/user/nutrition-plan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan),
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

  const updateField = (field: keyof NutritionPlanType, value: number) => {
    if (!plan) return
    setPlan({ ...plan, [field]: value })
  }

  const updateMode = (mode: NutritionMode) => {
    if (!plan) return
    setPlan({ ...plan, mode })
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">营养计划设置</h1>

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
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
            <CardTitle>计算模式</CardTitle>
            <CardDescription>
              选择您偏好的宏量营养素计算方式
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={plan.mode}
              onValueChange={(value) => updateMode(value as NutritionMode)}
            >
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NutritionMode.PERCENTAGE}>
                  百分比模式（按热量比例计算）
                </SelectItem>
                <SelectItem value={NutritionMode.WEIGHT}>
                  体重模式（按每公斤体重克数计算）
                </SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {plan.mode === NutritionMode.PERCENTAGE ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-carb-high mr-2"></span>
                  高碳日设置（百分比）
                </CardTitle>
                <CardDescription>
                  各营养成分百分比之和必须等于 100%
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="highCarbsCarbs">碳水 (%)</Label>
                    <Input
                      id="highCarbsCarbs"
                      type="number"
                      min="0"
                      max="100"
                      value={plan.highCarbsCarbs}
                      onChange={(e) => updateField('highCarbsCarbs', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="highCarbsProtein">蛋白质 (%)</Label>
                    <Input
                      id="highCarbsProtein"
                      type="number"
                      min="0"
                      max="100"
                      value={plan.highCarbsProtein}
                      onChange={(e) => updateField('highCarbsProtein', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="highCarbsFat">脂肪 (%)</Label>
                    <Input
                      id="highCarbsFat"
                      type="number"
                      min="0"
                      max="100"
                      value={plan.highCarbsFat}
                      onChange={(e) => updateField('highCarbsFat', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  合计: {plan.highCarbsCarbs + plan.highCarbsProtein + plan.highCarbsFat}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-carb-medium mr-2"></span>
                  中碳日设置（百分比）
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="mediumCarbsCarbs">碳水 (%)</Label>
                    <Input
                      id="mediumCarbsCarbs"
                      type="number"
                      min="0"
                      max="100"
                      value={plan.mediumCarbsCarbs}
                      onChange={(e) => updateField('mediumCarbsCarbs', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mediumCarbsProtein">蛋白质 (%)</Label>
                    <Input
                      id="mediumCarbsProtein"
                      type="number"
                      min="0"
                      max="100"
                      value={plan.mediumCarbsProtein}
                      onChange={(e) => updateField('mediumCarbsProtein', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mediumCarbsFat">脂肪 (%)</Label>
                    <Input
                      id="mediumCarbsFat"
                      type="number"
                      min="0"
                      max="100"
                      value={plan.mediumCarbsFat}
                      onChange={(e) => updateField('mediumCarbsFat', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  合计: {plan.mediumCarbsCarbs + plan.mediumCarbsProtein + plan.mediumCarbsFat}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-carb-low mr-2"></span>
                  低碳日设置（百分比）
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="lowCarbsCarbs">碳水 (%)</Label>
                    <Input
                      id="lowCarbsCarbs"
                      type="number"
                      min="0"
                      max="100"
                      value={plan.lowCarbsCarbs}
                      onChange={(e) => updateField('lowCarbsCarbs', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lowCarbsProtein">蛋白质 (%)</Label>
                    <Input
                      id="lowCarbsProtein"
                      type="number"
                      min="0"
                      max="100"
                      value={plan.lowCarbsProtein}
                      onChange={(e) => updateField('lowCarbsProtein', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lowCarbsFat">脂肪 (%)</Label>
                    <Input
                      id="lowCarbsFat"
                      type="number"
                      min="0"
                      max="100"
                      value={plan.lowCarbsFat}
                      onChange={(e) => updateField('lowCarbsFat', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  合计: {plan.lowCarbsCarbs + plan.lowCarbsProtein + plan.lowCarbsFat}%
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-carb-high mr-2"></span>
                  高碳日设置（克/公斤体重）
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="highCarbsCarbsPerKg">碳水 (g/kg)</Label>
                    <Input
                      id="highCarbsCarbsPerKg"
                      type="number"
                      min="0"
                      step="0.1"
                      value={plan.highCarbsCarbsPerKg}
                      onChange={(e) => updateField('highCarbsCarbsPerKg', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="highCarbsProteinPerKg">蛋白质 (g/kg)</Label>
                    <Input
                      id="highCarbsProteinPerKg"
                      type="number"
                      min="0"
                      step="0.1"
                      value={plan.highCarbsProteinPerKg}
                      onChange={(e) => updateField('highCarbsProteinPerKg', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="highCarbsFatPerKg">脂肪 (g/kg)</Label>
                    <Input
                      id="highCarbsFatPerKg"
                      type="number"
                      min="0"
                      step="0.1"
                      value={plan.highCarbsFatPerKg}
                      onChange={(e) => updateField('highCarbsFatPerKg', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-carb-medium mr-2"></span>
                  中碳日设置（克/公斤体重）
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="mediumCarbsCarbsPerKg">碳水 (g/kg)</Label>
                    <Input
                      id="mediumCarbsCarbsPerKg"
                      type="number"
                      min="0"
                      step="0.1"
                      value={plan.mediumCarbsCarbsPerKg}
                      onChange={(e) => updateField('mediumCarbsCarbsPerKg', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mediumCarbsProteinPerKg">蛋白质 (g/kg)</Label>
                    <Input
                      id="mediumCarbsProteinPerKg"
                      type="number"
                      min="0"
                      step="0.1"
                      value={plan.mediumCarbsProteinPerKg}
                      onChange={(e) => updateField('mediumCarbsProteinPerKg', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mediumCarbsFatPerKg">脂肪 (g/kg)</Label>
                    <Input
                      id="mediumCarbsFatPerKg"
                      type="number"
                      min="0"
                      step="0.1"
                      value={plan.mediumCarbsFatPerKg}
                      onChange={(e) => updateField('mediumCarbsFatPerKg', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-carb-low mr-2"></span>
                  低碳日设置（克/公斤体重）
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="lowCarbsCarbsPerKg">碳水 (g/kg)</Label>
                    <Input
                      id="lowCarbsCarbsPerKg"
                      type="number"
                      min="0"
                      step="0.1"
                      value={plan.lowCarbsCarbsPerKg}
                      onChange={(e) => updateField('lowCarbsCarbsPerKg', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lowCarbsProteinPerKg">蛋白质 (g/kg)</Label>
                    <Input
                      id="lowCarbsProteinPerKg"
                      type="number"
                      min="0"
                      step="0.1"
                      value={plan.lowCarbsProteinPerKg}
                      onChange={(e) => updateField('lowCarbsProteinPerKg', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lowCarbsFatPerKg">脂肪 (g/kg)</Label>
                    <Input
                      id="lowCarbsFatPerKg"
                      type="number"
                      min="0"
                      step="0.1"
                      value={plan.lowCarbsFatPerKg}
                      onChange={(e) => updateField('lowCarbsFatPerKg', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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
              '保存设置'
            )}
          </Button>
        </div>
      </main>
    </div>
  )
}
