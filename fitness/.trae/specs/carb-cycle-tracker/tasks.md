# 碳循环记录系统 - The Implementation Plan (Decomposed and Prioritized Task List)

## [ ] Task 1: 项目初始化与基础配置
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 创建 Next.js 14 项目（TypeScript + App Router）
  - 配置 Tailwind CSS
  - 初始化 Prisma 并配置 PostgreSQL 连接
  - 安装核心依赖（next-auth, bcryptjs, zod 等）
  - 配置 shadcn/ui 组件库
- **Acceptance Criteria Addressed**: 为所有 AC 提供基础架构
- **Test Requirements**:
  - `programmatic` TR-1.1: `npx create-next-app` 成功执行
  - `programmatic` TR-1.2: `npx prisma init` 成功，schema.prisma 创建
  - `programmatic` TR-1.3: `npx shadcn-ui@latest init` 成功执行
  - `human-judgement` TR-1.4: 项目可以正常启动运行
- **Notes**: 使用 `create-next-app@latest` 创建项目，确保是 Next.js 14

## [ ] Task 2: 数据库模型设计与迁移
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 编写 Prisma Schema，定义所有数据模型（User, UserProfile, NutritionPlan, CyclePlan, CheckIn）
  - 配置模型关系和索引
  - 执行数据库迁移
  - 生成 Prisma Client
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-6, AC-7, AC-8 的数据层
- **Test Requirements**:
  - `programmatic` TR-2.1: `npx prisma migrate dev` 执行成功
  - `programmatic` TR-2.2: 数据库表正确创建
  - `programmatic` TR-2.3: Prisma Client 可以正常查询和写入数据
- **Notes**: 参考 spec.md 中的数据模型设计

## [ ] Task 3: NextAuth.js 认证系统集成
- **Priority**: P0
- **Depends On**: Task 1, Task 2
- **Description**: 
  - 配置 NextAuth.js，设置 Credentials Provider
  - 实现登录 API 路由（验证邮箱密码）
  - 实现注册 API 路由（创建用户，密码 bcrypt 加密）
  - 配置 Session 策略和 JWT
  - 创建 AuthContext 或使用 NextAuth hooks
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `programmatic` TR-3.1: POST /api/auth/register 成功创建用户
  - `programmatic` TR-3.2: POST /api/auth/signin 成功验证并创建 Session
  - `programmatic` TR-3.3: 密码存储为 bcrypt 哈希，无法从数据库反向解密
  - `programmatic` TR-3.4: 使用错误密码登录返回失败
  - `human-judgement` TR-3.5: 使用 useSession() 可以获取当前登录用户
- **Notes**: 使用 bcryptjs 进行密码加密和验证

## [ ] Task 4: 宏量营养素计算引擎
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 实现 BMR 计算函数（男性/女性公式）
  - 实现 TDEE 计算函数（基于活动水平）
  - 实现目标热量计算（基于目标：减脂/增肌/维持）
  - 实现百分比模式宏量计算
  - 实现体重模式宏量计算
  - 编写默认预设值配置
- **Acceptance Criteria Addressed**: AC-4, AC-5
- **Test Requirements**:
  - `programmatic` TR-4.1: 男性 BMR 计算验证（给定已知输入验证输出）
  - `programmatic` TR-4.2: 女性 BMR 计算验证
  - `programmatic` TR-4.3: TDEE 计算验证（基于 BMR × 活动系数）
  - `programmatic` TR-4.4: 百分比模式宏量计算验证
  - `programmatic` TR-4.5: 体重模式宏量计算验证
  - `programmatic` TR-4.6: 边界值测试（体重=0，极端数值）
- **Notes**: 建议将计算逻辑放在 `lib/calculator.ts` 中，便于单元测试

## [ ] Task 5: 共享 UI 组件和布局
- **Priority**: P1
- **Depends On**: Task 1
- **Description**: 
  - 创建主布局（Header, Navigation, Sidebar/移动端底部导航）
  - 创建认证页面布局（无导航，居中卡片）
  - 创建卡片组件、按钮组件、表单输入组件等基础组件
  - 配置主题色（绿色主色调）
  - 实现响应式布局断点
- **Acceptance Criteria Addressed**: AC-9, AC-10
- **Test Requirements**:
  - `human-judgement` TR-5.1: 导航在桌面端和移动端正确显示
  - `human-judgement` TR-5.2: 卡片和按钮样式统一美观
  - `human-judgement` TR-5.3: 颜色主题符合设计规范（绿色主色）
- **Notes**: 基于 shadcn/ui 组件进行定制

## [ ] Task 6: 注册和登录页面
- **Priority**: P0
- **Depends On**: Task 3, Task 5
- **Description**: 
  - 创建注册页面（邮箱、密码、确认密码表单）
  - 创建登录页面（邮箱、密码表单）
  - 实现表单验证（zod）
  - 实现错误提示和加载状态
  - 登录成功后的路由跳转逻辑（根据用户状态）
- **Acceptance Criteria Addressed**: AC-1, AC-2
- **Test Requirements**:
  - `programmatic` TR-6.1: 注册表单验证：空邮箱、无效邮箱、密码<6位、密码不匹配
  - `programmatic` TR-6.2: 登录表单验证：空字段
  - `human-judgement` TR-6.3: 错误提示清晰可见
  - `human-judgement` TR-6.4: 提交时显示加载状态
- **Notes**: 使用 react-hook-form + zod 进行表单管理

## [ ] Task 7: 初始数据设置页面
- **Priority**: P0
- **Depends On**: Task 2, Task 3, Task 4, Task 5, Task 6
- **Description**: 
  - 创建初始数据设置页面（步骤式或单页表单）
  - 表单字段：体重、身高、年龄、性别、目标、活动水平
  - 实现数据保存 API
  - 提交后显示计算结果预览（BMR, TDEE, 目标热量）
  - 创建用户营养计划默认值
  - 创建用户循环计划默认值（经典 7 天）
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `programmatic` TR-7.1: POST /api/user/profile 成功保存用户数据
  - `programmatic` TR-7.2: 保存后自动创建默认 NutritionPlan
  - `programmatic` TR-7.3: 保存后自动创建默认 CyclePlan（经典 7 天）
  - `human-judgement` TR-7.4: 计算结果预览正确显示
- **Notes**: 首次登录后判断 UserProfile 是否存在，不存在则跳转此页面

## [ ] Task 8: 仪表盘主页
- **Priority**: P1
- **Depends On**: Task 4, Task 5, Task 7
- **Description**: 
  - 创建仪表盘页面
  - 显示今日状态卡片（今日类型、是否已打卡）
  - 显示今日目标宏量营养素预览
  - 显示本周打卡日历概览
  - 提供快捷入口（设置数据、调整计划、计算工具）
  - 实现获取用户数据的 API
- **Acceptance Criteria Addressed**: AC-9, AC-10（布局展示）
- **Test Requirements**:
  - `programmatic` TR-8.1: GET /api/user/dashboard 返回用户完整数据
  - `human-judgement` TR-8.2: 卡片布局清晰美观
  - `human-judgement` TR-8.3: 本周日历正确显示已完成/未完成状态
- **Notes**: 仪表盘是用户登录后的主页面

## [ ] Task 9: 营养计划设置页面
- **Priority**: P1
- **Depends On**: Task 4, Task 5, Task 7
- **Description**: 
  - 创建营养计划设置页面
  - 实现模式切换：百分比模式 / 体重模式
  - 百分比模式表单：高/中/低三天的碳水、蛋白质、脂肪百分比
  - 体重模式表单：高/中/低的碳水克数/kg，蛋白质克数/kg，脂肪克数/kg
  - 实时预览计算结果
  - 实现保存 API
- **Acceptance Criteria Addressed**: AC-3, AC-4, AC-5
- **Test Requirements**:
  - `programmatic` TR-9.1: PUT /api/user/nutrition-plan 成功更新计划
  - `programmatic` TR-9.2: 百分比模式验证：三天各比例之和 = 100%
  - `programmatic` TR-9.3: 体重模式验证：数值 > 0
  - `human-judgement` TR-9.4: 模式切换时表单正确切换
- **Notes**: 默认百分比模式，用户可以切换

## [ ] Task 10: 一周循环安排页面
- **Priority**: P1
- **Depends On**: Task 2, Task 5, Task 7
- **Description**: 
  - 创建循环安排页面
  - 展示一周七天的卡片（周一到周日）
  - 每卡显示当前类型（高/中/低），点击切换
  - 预设方案按钮：经典 7 天、交替模式、周末高碳
  - 实现保存 API
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `programmatic` TR-10.1: PUT /api/user/cycle-plan 成功更新
  - `programmatic` TR-10.2: 经典 7 天预设应用正确
  - `programmatic` TR-10.3: 交替模式预设应用正确
  - `human-judgement` TR-10.4: 点击某天卡片可以切换类型
- **Notes**: 默认经典 7 天，用户可自定义

## [ ] Task 11: 打卡页面和打卡 API
- **Priority**: P1
- **Depends On**: Task 2, Task 4, Task 5, Task 10
- **Description**: 
  - 创建打卡页面
  - 显示今日日期、今日碳日类型
  - 显示今日目标宏量营养素
  - "完成打卡"按钮（极简打卡）
  - 展开/收起"详细记录"
  - 详细记录表单：实际碳水、蛋白质、脂肪、备注
  - 实现打卡 API（创建/更新 CheckIn）
  - 实现获取今日打卡状态 API
- **Acceptance Criteria Addressed**: AC-7, AC-8
- **Test Requirements**:
  - `programmatic` TR-11.1: POST /api/checkin 创建或更新打卡记录
  - `programmatic` TR-11.2: 同一用户同一天只能有一条 CheckIn 记录
  - `programmatic` TR-11.3: GET /api/checkin/today 返回今日状态
  - `human-judgement` TR-11.4: 已打卡状态和未打卡状态显示不同
- **Notes**: 使用 userId + date 唯一约束

## [ ] Task 12: 打卡历史和日历视图
- **Priority**: P2
- **Depends On**: Task 11
- **Description**: 
  - 扩展仪表盘或创建历史页面
  - 实现周/月日历视图
  - 已完成日期显示标记
  - 点击某一天可以查看或修改当天记录
  - 实现获取历史打卡记录 API
- **Acceptance Criteria Addressed**: AC-8
- **Test Requirements**:
  - `programmatic` TR-12.1: GET /api/checkin/history?startDate=&endDate= 返回区间数据
  - `human-judgement` TR-12.2: 日历视图清晰标记已完成日期
- **Notes**: 可先在仪表盘实现简单的周视图，后续扩展

## [ ] Task 13: 认证中间件和路由保护
- **Priority**: P1
- **Depends On**: Task 3
- **Description**: 
  - 配置 NextAuth middleware
  - 保护需要登录的路由（/dashboard, /setup 等）
  - 保护 API 路由（需要认证的端点）
  - 未登录用户访问受保护路由时重定向到登录页
  - 已登录用户访问登录/注册页时重定向到仪表盘
- **Acceptance Criteria Addressed**: 安全相关
- **Test Requirements**:
  - `programmatic` TR-13.1: 未登录访问 /dashboard 重定向到 /login
  - `programmatic` TR-13.2: 已登录访问 /login 重定向到 /dashboard
  - `programmatic` TR-13.3: 未登录调用受保护 API 返回 401
- **Notes**: 使用 NextAuth 的 middleware 配置

## [ ] Task 14: 错误处理和用户反馈
- **Priority**: P1
- **Depends On**: Task 5
- **Description**: 
  - 创建统一的 API 响应格式
  - 创建全局错误处理组件
  - 实现 Toast 提示组件（成功/错误/信息）
  - 表单错误显示优化
  - 加载状态指示器
- **Acceptance Criteria Addressed**: AC-9, 用户体验
- **Test Requirements**:
  - `human-judgement` TR-14.1: API 错误时显示友好的 Toast 提示
  - `human-judgement` TR-14.2: 表单字段错误在字段下方显示
  - `human-judgement` TR-14.3: 提交时按钮显示加载状态
- **Notes**: 使用 shadcn/ui 的 toast 组件

## [ ] Task 15: 响应式优化和移动端适配
- **Priority**: P2
- **Depends On**: Task 5, Task 6, Task 8, Task 9, Task 10, Task 11
- **Description**: 
  - 移动端导航（底部导航栏或汉堡菜单）
  - 表单在手机端的适配
  - 卡片布局在小屏幕的调整
  - 字体大小和间距的响应式调整
  - 触摸区域优化
- **Acceptance Criteria Addressed**: AC-10
- **Test Requirements**:
  - `human-judgement` TR-15.1: 375px 宽度（手机）下所有元素正确显示
  - `human-judgement` TR-15.2: 768px 宽度（平板）下布局合理
  - `human-judgement` TR-15.3: 触摸按钮足够大，易于点击
- **Notes**: 使用 Tailwind 的 responsive 前缀

## [ ] Task 16: 最终测试和 polish
- **Priority**: P2
- **Depends On**: 所有其他任务
- **Description**: 
  - 端到端流程测试
  - UI 细节优化
  - 动画和过渡效果
  - 性能优化
  - 安全审计（SQL 注入、XSS 等）
- **Acceptance Criteria Addressed**: 所有 AC 的最终验证
- **Test Requirements**:
  - `human-judgement` TR-16.1: 完整用户旅程流畅：注册 → 设置数据 → 查看计划 → 打卡
  - `human-judgement` TR-16.2: UI 达到"简洁美观"标准
  - `programmatic` TR-16.3: 无控制台错误和警告
- **Notes**: 这是一个整理和验收任务
