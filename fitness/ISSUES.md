# 碳循环记录系统 - 问题记录

> 记录时间：2026-04-23
> 测试人员：系统测试
> 最后更新：2026-04-23

---

## 项目功能模块概览

### 1. 认证模块 (Authentication)
- 注册功能 (`/register`)
- 登录功能 (`/login`)
- Session 管理

### 2. 用户资料模块 (User Profile)
- 个人资料设置页面 (`/setup`)
- 个人资料 API (`POST/GET /api/user/profile`)
- 计算引擎：BMR、TDEE、目标热量计算

### 3. 营养计划模块 (Nutrition Plan)
- 营养计划页面 (`/nutrition-plan`)
- 营养计划 API (`PUT/GET /api/user/nutrition-plan`)
- 两种模式：百分比模式 (PERCENTAGE)、体重模式 (WEIGHT)

### 4. 循环计划模块 (Cycle Plan)
- 循环计划页面 (`/cycle-plan`)
- 循环计划 API (`PUT/GET /api/user/cycle-plan`)
- 预设模板：CLASSIC、ALTERNATING、WEEKEND_HIGH

### 5. 仪表盘模块 (Dashboard)
- 仪表盘页面 (`/dashboard`)
- 仪表盘 API (`GET /api/user/dashboard`)

### 6. 打卡模块 (Check-In)
- 打卡页面 (`/checkin`)
- 打卡 API (`/api/checkin`)

---

## 问题列表 (按优先级排序)

### 🔴 高优先级问题

#### 问题 1: 循环计划 API 枚举运行时错误
**严重程度**: 🔴 阻塞性
**状态**: ✅ 已修复
**测试结果**: ✅ 修复后测试通过

**描述**: `src/app/api/user/cycle-plan/route.ts` 中 `PRESETS` 常量使用 `CarbDayType.HIGH`、`CarbDayType.LOW` 等枚举值作为运行时值。由于 SQLite 不支持原生枚举，`CarbDayType` 从 `@prisma/client` 导入时为 `undefined`，导致运行时错误。

**错误信息**:
```
TypeError: Cannot read properties of undefined (reading 'HIGH')
    at Object.PRESETS (src/app/api/user/cycle-plan/route.ts:76:25)
```

**受影响文件**:
- `src/app/api/user/cycle-plan/route.ts:5` - `import { CarbDayType } from '@prisma/client'`
- `src/app/api/user/cycle-plan/route.ts:74-102` - `PRESETS` 常量使用 `CarbDayType.HIGH` 等

**修复内容**: 将 `import { CarbDayType } from '@prisma/client'` 改为 `import { CarbDayType } from '@/types/enums'`

**修复验证**:
- 循环计划页面正常加载
- 预设方案（经典 7 天、交替模式、周末高碳）正常显示
- 自定义计划（周一到周日）正常显示
- API 返回 200 状态码

---

#### 问题 2: 营养计划 API 枚举运行时错误
**严重程度**: 🔴 高
**状态**: ✅ 已修复
**测试结果**: ✅ 修复后测试通过

**描述**: `src/app/api/user/nutrition-plan/route.ts` 中使用 `NutritionMode.PERCENTAGE` 和 `NutritionMode.WEIGHT` 作为运行时值进行比较。同样会导致运行时错误。

**受影响代码**:
```typescript
if (mode === NutritionMode.PERCENTAGE) { ... }
else if (mode === NutritionMode.WEIGHT) { ... }
```

**受影响文件**:
- `src/app/api/user/nutrition-plan/route.ts:5` - `import { NutritionMode } from '@prisma/client'`

**修复内容**: 将 `import { NutritionMode } from '@prisma/client'` 改为 `import { NutritionMode } from '@/types/enums'`

**修复验证**:
- 营养计划页面正常加载
- 百分比模式和体重模式切换正常
- 高碳日/中碳日/低碳日设置正常显示
- API 返回 200 状态码

---

#### 问题 3: 用户资料 API 枚举类型导入不规范
**严重程度**: 🟡 中
**状态**: ✅ 已修复
**测试结果**: ✅ 修复后测试通过

**描述**: `src/app/api/user/profile/route.ts` 从 `@prisma/client` 导入枚举类型 `Gender, Goal, ActivityLevel`，但这些枚举仅用作类型注解（`as Gender`），不是运行时值，所以暂时没有报错。但为了代码一致性和避免将来问题，应该统一使用本地枚举文件。

**受影响文件**:
- `src/app/api/user/profile/route.ts:5` - `import { Gender, Goal, ActivityLevel } from '@prisma/client'`

**修复内容**: 将 `import { Gender, Goal, ActivityLevel } from '@prisma/client'` 改为 `import { Gender, Goal, ActivityLevel } from '@/types/enums'`

**修复验证**:
- 代码一致性：所有枚举导入统一使用 `@/types/enums`
- 设置页面保存功能正常
- BMR/TDEE 计算功能正常

---

### 🟡 中优先级问题

#### 问题 4: 注册页面表单验证不一致
**严重程度**: 🟡 中
**状态**: 待确认
**测试结果**: ⚠️ 观察

**描述**: 注册页面前端使用正则验证邮箱格式，但注册 API 后端没有邮箱格式验证。可能导致前后端验证不一致。

**前端验证** (`src/app/register/page.tsx:96-99`):
```typescript
pattern: {
  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  message: '请输入有效的邮箱地址',
}
```

**后端验证** (`src/app/api/auth/register/route.ts`):
- 仅检查 `!email`（非空）
- 没有正则格式验证

**解决方案**: 在注册 API 中添加邮箱格式正则验证

---

### 🟢 低优先级问题

#### 问题 5: 登录页面错误提示优化
**严重程度**: 🟢 低
**状态**: 待确认
**测试结果**: ⚠️ 待测试

**描述**: 登录页面错误提示可能不够友好。当密码错误或用户不存在时，NextAuth 返回的错误信息可能不够明确。

**建议**: 优化错误提示，区分"用户不存在"和"密码错误"（安全考虑可以统一提示"邮箱或密码错误"）

---

## 测试结果记录

### ✅ 测试通过的功能

#### 测试 1.1: 注册新用户 - 成功场景
**测试时间**: 2026-04-23
**测试账号**: `test_user_002@example.com`
**测试步骤**:
1. 打开注册页面 `/register`
2. 输入新邮箱 `test_user_002@example.com`
3. 输入密码 `Test123456`
4. 输入确认密码 `Test123456`
5. 点击"创建账户"
**预期结果**: 注册成功，自动登录，跳转到 `/setup` 页面
**实际结果**: ✅ 注册成功，跳转到 `/setup` 页面
**状态**: ✅ 通过

---

#### 测试 1.5: 登录 - 正确凭证
**测试时间**: 2026-04-23
**测试账号**: `newuser@example.com` / `password123`
**测试步骤**:
1. 打开登录页面 `/login`
2. 输入已注册的邮箱和正确密码
3. 点击登录
**预期结果**: 登录成功，跳转到 `/dashboard`
**实际结果**: ✅ 登录成功，跳转到 `/dashboard`
**状态**: ✅ 通过

---

#### 测试 2.1 & 2.2: 填写完整个人资料 + 验证计算结果
**测试时间**: 2026-04-23
**测试数据**:
- 体重: 70 kg
- 身高: 175 cm
- 年龄: 28
- 性别: 男 (MALE)
- 目标: 减脂 (WEIGHT_LOSS)
- 活动水平: 中度活动 (MODERATELY_ACTIVE)

**计算结果验证**:
- **BMR 计算**: 
  - 男性公式: 88.362 + (13.397 × 70) + (4.799 × 175) - (5.677 × 28)
  - = 88.362 + 937.79 + 839.825 - 158.956
  - = **1707** kcal ✅
- **TDEE 计算**: 
  - 中度活动系数: 1.55
  - 1707 × 1.55 = **2646** kcal ✅
- **目标热量**: 
  - 减脂系数: 0.8
  - 2646 × 0.8 = **2117** kcal ✅

**实际结果**: 
- 页面显示: 基础代谢 1707 kcal, 总消耗 2646 kcal, 目标热量 2117 kcal
- 全部计算正确 ✅
**状态**: ✅ 通过

---

#### 测试 4.2: 循环计划页面 - 修复后验证
**测试时间**: 2026-04-23
**测试步骤**:
1. 登录后访问 `/cycle-plan` 页面
2. 验证预设方案显示
3. 验证自定义计划显示
**预期结果**: 显示循环计划页面，预设方案和自定义计划正常显示
**实际结果**: ✅ 页面正常加载，所有功能正常
**状态**: ✅ 通过

---

#### 测试 3.1: 营养计划页面 - 修复后验证
**测试时间**: 2026-04-23
**测试步骤**:
1. 登录后访问 `/nutrition-plan` 页面
2. 验证百分比模式显示
3. 切换到体重模式验证
**预期结果**: 营养计划页面正常加载，两种模式切换正常
**实际结果**: ✅ 页面正常加载，百分比模式和体重模式切换正常
**状态**: ✅ 通过

---

### ❌ 测试失败的功能 (已修复)

#### 测试 4.1: 查看默认循环计划 (修复前)
**测试时间**: 2026-04-23 (修复前)
**测试步骤**:
1. 登录后访问 `/cycle-plan` 页面
**预期结果**: 显示循环计划页面，加载默认计划
**实际结果**: ❌ 页面显示"获取数据时发生错误"
**服务器错误**:
```
TypeError: Cannot read properties of undefined (reading 'HIGH')
    at Object.PRESETS (src/app/api/user/cycle-plan/route.ts:76:25)
```
**状态**: ✅ 已修复

---

## 修复计划

### 阶段 1: 修复阻塞性和高优先级问题 ✅ 已完成

| 序号 | 问题 | 文件 | 修复内容 | 优先级 | 状态 |
|------|------|------|----------|--------|------|
| 1 | 循环计划 API 枚举错误 | `src/app/api/user/cycle-plan/route.ts` | 将 `import { CarbDayType } from '@prisma/client'` 改为 `import { CarbDayType } from '@/types/enums'` | 🔴 阻塞 | ✅ 已完成 |
| 2 | 营养计划 API 枚举错误 | `src/app/api/user/nutrition-plan/route.ts` | 将 `import { NutritionMode } from '@prisma/client'` 改为 `import { NutritionMode } from '@/types/enums'` | 🔴 高 | ✅ 已完成 |
| 3 | 用户资料 API 枚举导入 | `src/app/api/user/profile/route.ts` | 将 `import { Gender, Goal, ActivityLevel } from '@prisma/client'` 改为 `import { Gender, Goal, ActivityLevel } from '@/types/enums'` | 🟡 中 | ✅ 已完成 |

### 阶段 2: 测试验证修复 ✅ 已完成

1. ✅ 重新测试循环计划页面
2. ✅ 重新测试营养计划页面
3. ✅ 重新测试设置页面
4. ✅ 完整测试注册-设置-仪表盘流程

### 阶段 3: 优化和增强 (可选)

| 序号 | 问题 | 描述 | 优先级 | 状态 |
|------|------|------|--------|------|
| 1 | 邮箱格式验证 | 注册 API 添加邮箱正则验证 | 🟡 中 | 待处理 |
| 2 | 错误提示优化 | 登录页面错误提示优化 | 🟢 低 | 待处理 |

---

## 已修复的问题 (历史记录)

以下问题已在修复中解决：

### 本轮修复 (2026-04-23)

1. ✅ **循环计划 API 枚举运行时错误**
   - 文件: `src/app/api/user/cycle-plan/route.ts`
   - 修复: `CarbDayType` 导入路径改为 `@/types/enums`

2. ✅ **营养计划 API 枚举运行时错误**
   - 文件: `src/app/api/user/nutrition-plan/route.ts`
   - 修复: `NutritionMode` 导入路径改为 `@/types/enums`

3. ✅ **用户资料 API 枚举类型导入不规范**
   - 文件: `src/app/api/user/profile/route.ts`
   - 修复: `Gender, Goal, ActivityLevel` 导入路径改为 `@/types/enums`

### 之前修复

1. ✅ **页面组件枚举导入错误** (5 个页面)
   - `src/app/setup/page.tsx` - 已修复
   - `src/app/dashboard/page.tsx` - 已修复
   - `src/app/checkin/page.tsx` - 已修复
   - `src/app/cycle-plan/page.tsx` - 已修复
   - `src/app/nutrition-plan/page.tsx` - 已修复

2. ✅ **数据库迁移** - PostgreSQL → SQLite
   - Schema 中所有 Enum 类型改为 String
   - 创建独立枚举文件 `src/types/enums.ts`

---

## 待测试功能清单

以下功能尚未完整测试，建议在后续测试中验证：

- [x] 营养计划页面 (`/nutrition-plan`) - ✅ 已测试通过
- [x] 循环计划页面 (`/cycle-plan`) - ✅ 已测试通过
- [ ] 打卡页面 (`/checkin`)
- [x] 仪表盘完整功能 (`/dashboard`) - ✅ 已测试通过
- [ ] 注册边界值测试（密码长度、邮箱格式等）
- [ ] 登录错误场景测试（错误密码、不存在用户）

---

## 当前系统状态

### ✅ 所有高优先级问题已修复

**功能状态**:
- ✅ 注册功能 - 正常
- ✅ 登录功能 - 正常
- ✅ 个人资料设置 - 正常
- ✅ BMR/TDEE 计算 - 正常
- ✅ 循环计划 - 正常 (已修复)
- ✅ 营养计划 - 正常 (已修复)
- ✅ 仪表盘 - 正常
- ⚠️ 打卡功能 - 待测试

**API 状态**:
- `POST /api/auth/register` - ✅ 201
- `POST /api/auth/callback/credentials` - ✅ 200
- `GET/POST /api/user/profile` - ✅ 200
- `GET/PUT /api/user/cycle-plan` - ✅ 200 (已修复)
- `GET/PUT /api/user/nutrition-plan` - ✅ 200 (已修复)
- `GET /api/user/dashboard` - ✅ 200
