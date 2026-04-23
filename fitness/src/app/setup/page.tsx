'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { Gender, Goal, ActivityLevel } from '@prisma/client'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface SetupFormData {
  weight: string
  height: string
  age: string
  gender: Gender
  goal: Goal
  activityLevel: ActivityLevel
}

interface Calculations {
  bmr: number
  tdee: number
  targetCalories: number
}

export default function SetupPage() {
  const router = useRouter()
  const { status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [calculations, setCalculations] = useState<Calculations | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SetupFormData>()

  const gender = watch('gender')
  const goal = watch('goal')
  const activityLevel = watch('activityLevel')

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  const onSubmit = async (data: SetupFormData) => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || '保存失败')
        return
      }

      setCalculations(result.calculations)
      setShowResults(true)
    } catch {
      setError('保存时发生错误')
    } finally {
      setIsLoading(false)
    }
  }

  const handleContinue = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 px-4 py-8">
      <div className="max-w-xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-primary-700">
              设置您的个人资料
            </CardTitle>
            <CardDescription>
              填写以下信息，我们将为您计算个性化的营养目标
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showResults && calculations ? (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                    <svg
                      className="w-8 h-8 text-primary-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">设置完成！</h3>
                  <p className="text-gray-600">以下是您的基础代谢和目标热量</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">基础代谢</p>
                    <p className="text-2xl font-bold text-primary-600">{calculations.bmr}</p>
                    <p className="text-xs text-gray-400">kcal</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">总消耗</p>
                    <p className="text-2xl font-bold text-primary-600">{calculations.tdee}</p>
                    <p className="text-xs text-gray-400">kcal</p>
                  </div>
                  <div className="text-center p-4 bg-primary-50 rounded-lg">
                    <p className="text-sm text-gray-500">目标热量</p>
                    <p className="text-2xl font-bold text-primary-600">
                      {calculations.targetCalories}
                    </p>
                    <p className="text-xs text-gray-400">kcal</p>
                  </div>
                </div>

                <Button
                  onClick={handleContinue}
                  className="w-full bg-primary-600 hover:bg-primary-700"
                >
                  进入仪表盘
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">体重 (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="70"
                      disabled={isLoading}
                      {...register('weight', {
                        required: '请输入体重',
                        min: { value: 20, message: '体重不能小于 20kg' },
                        max: { value: 300, message: '体重不能大于 300kg' },
                      })}
                    />
                    {errors.weight && (
                      <p className="text-sm text-destructive">{errors.weight.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="height">身高 (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      step="0.1"
                      placeholder="170"
                      disabled={isLoading}
                      {...register('height', {
                        required: '请输入身高',
                        min: { value: 100, message: '身高不能小于 100cm' },
                        max: { value: 250, message: '身高不能大于 250cm' },
                      })}
                    />
                    {errors.height && (
                      <p className="text-sm text-destructive">{errors.height.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">年龄</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="25"
                      disabled={isLoading}
                      {...register('age', {
                        required: '请输入年龄',
                        min: { value: 10, message: '年龄不能小于 10 岁' },
                        max: { value: 120, message: '年龄不能大于 120 岁' },
                      })}
                    />
                    {errors.age && (
                      <p className="text-sm text-destructive">{errors.age.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>性别</Label>
                    <Select
                      value={gender}
                      onValueChange={(value) => setValue('gender', value as Gender)}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择性别" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={Gender.MALE}>男</SelectItem>
                        <SelectItem value={Gender.FEMALE}>女</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>目标</Label>
                  <Select
                    value={goal}
                    onValueChange={(value) => setValue('goal', value as Goal)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择您的目标" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Goal.WEIGHT_LOSS}>减脂</SelectItem>
                      <SelectItem value={Goal.MAINTENANCE}>维持体重</SelectItem>
                      <SelectItem value={Goal.MUSCLE_GAIN}>增肌</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>活动水平</Label>
                  <Select
                    value={activityLevel}
                    onValueChange={(value) =>
                      setValue('activityLevel', value as ActivityLevel)
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择您的活动水平" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ActivityLevel.SEDENTARY}>
                        久坐（几乎不运动）
                      </SelectItem>
                      <SelectItem value={ActivityLevel.LIGHTLY_ACTIVE}>
                        轻度活动（每周 1-3 天）
                      </SelectItem>
                      <SelectItem value={ActivityLevel.MODERATELY_ACTIVE}>
                        中度活动（每周 3-5 天）
                      </SelectItem>
                      <SelectItem value={ActivityLevel.VERY_ACTIVE}>
                        高度活动（每周 6-7 天）
                      </SelectItem>
                      <SelectItem value={ActivityLevel.EXTRA_ACTIVE}>
                        极高活动（体力劳动或专业训练）
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className={cn(
                    'w-full bg-primary-600 hover:bg-primary-700',
                    isLoading && 'cursor-not-allowed opacity-50'
                  )}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    '保存并计算'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
