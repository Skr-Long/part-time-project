import { Gender, Goal, ActivityLevel, NutritionMode, CarbDayType, NutritionPlan } from '@prisma/client'

export interface UserProfileData {
  weight: number
  height: number
  age: number
  gender: Gender
  goal: Goal
  activityLevel: ActivityLevel
}

export interface MacrosResult {
  calories: number
  carbs: number
  protein: number
  fat: number
}

export interface DailyMacros {
  high: MacrosResult
  medium: MacrosResult
  low: MacrosResult
}

export function calculateBMR(weight: number, height: number, age: number, gender: Gender): number {
  if (gender === Gender.MALE) {
    return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
  } else {
    return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
  }
}

export function getActivityMultiplier(activityLevel: ActivityLevel): number {
  switch (activityLevel) {
    case ActivityLevel.SEDENTARY:
      return 1.2
    case ActivityLevel.LIGHTLY_ACTIVE:
      return 1.375
    case ActivityLevel.MODERATELY_ACTIVE:
      return 1.55
    case ActivityLevel.VERY_ACTIVE:
      return 1.725
    case ActivityLevel.EXTRA_ACTIVE:
      return 1.9
  }
}

export function getGoalMultiplier(goal: Goal): number {
  switch (goal) {
    case Goal.WEIGHT_LOSS:
      return 0.8
    case Goal.MAINTENANCE:
      return 1.0
    case Goal.MUSCLE_GAIN:
      return 1.15
  }
}

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return bmr * getActivityMultiplier(activityLevel)
}

export function calculateTargetCalories(tdee: number, goal: Goal): number {
  return Math.round(tdee * getGoalMultiplier(goal))
}

export function calculatePercentageMode(
  calories: number,
  carbsPercent: number,
  proteinPercent: number,
  fatPercent: number
): MacrosResult {
  return {
    calories,
    carbs: Math.round((calories * carbsPercent / 100) / 4),
    protein: Math.round((calories * proteinPercent / 100) / 4),
    fat: Math.round((calories * fatPercent / 100) / 9),
  }
}

export function calculateWeightMode(
  weight: number,
  carbsPerKg: number,
  proteinPerKg: number,
  fatPerKg: number
): MacrosResult {
  const carbs = Math.round(weight * carbsPerKg)
  const protein = Math.round(weight * proteinPerKg)
  const fat = Math.round(weight * fatPerKg)
  const calories = carbs * 4 + protein * 4 + fat * 9
  
  return { calories, carbs, protein, fat }
}

export function calculateAllMacros(
  profile: UserProfileData,
  nutritionPlan: NutritionPlan
): DailyMacros {
  const bmr = calculateBMR(profile.weight, profile.height, profile.age, profile.gender)
  const tdee = calculateTDEE(bmr, profile.activityLevel)
  const targetCalories = calculateTargetCalories(tdee, profile.goal)

  if (nutritionPlan.mode === NutritionMode.PERCENTAGE) {
    return {
      high: calculatePercentageMode(
        targetCalories,
        nutritionPlan.highCarbsCarbs,
        nutritionPlan.highCarbsProtein,
        nutritionPlan.highCarbsFat
      ),
      medium: calculatePercentageMode(
        targetCalories,
        nutritionPlan.mediumCarbsCarbs,
        nutritionPlan.mediumCarbsProtein,
        nutritionPlan.mediumCarbsFat
      ),
      low: calculatePercentageMode(
        targetCalories,
        nutritionPlan.lowCarbsCarbs,
        nutritionPlan.lowCarbsProtein,
        nutritionPlan.lowCarbsFat
      ),
    }
  } else {
    return {
      high: calculateWeightMode(
        profile.weight,
        nutritionPlan.highCarbsCarbsPerKg,
        nutritionPlan.highCarbsProteinPerKg,
        nutritionPlan.highCarbsFatPerKg
      ),
      medium: calculateWeightMode(
        profile.weight,
        nutritionPlan.mediumCarbsCarbsPerKg,
        nutritionPlan.mediumCarbsProteinPerKg,
        nutritionPlan.mediumCarbsFatPerKg
      ),
      low: calculateWeightMode(
        profile.weight,
        nutritionPlan.lowCarbsCarbsPerKg,
        nutritionPlan.lowCarbsProteinPerKg,
        nutritionPlan.lowCarbsFatPerKg
      ),
    }
  }
}

export function getMacrosForDayType(
  macros: DailyMacros,
  dayType: CarbDayType
): MacrosResult {
  switch (dayType) {
    case CarbDayType.HIGH:
      return macros.high
    case CarbDayType.MEDIUM:
      return macros.medium
    case CarbDayType.LOW:
      return macros.low
  }
}

export function getDayOfWeekName(day: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[day]
}

export function formatCarbDayType(type: CarbDayType): string {
  switch (type) {
    case CarbDayType.HIGH:
      return '高碳日'
    case CarbDayType.MEDIUM:
      return '中碳日'
    case CarbDayType.LOW:
      return '低碳日'
  }
}
