'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { Home, Settings, Calendar, User, LogOut, Menu, X, Utensils } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const navItems = [
  { path: '/dashboard', label: '仪表盘', icon: Home },
  { path: '/checkin', label: '打卡', icon: Utensils },
  { path: '/cycle-plan', label: '循环计划', icon: Calendar },
  { path: '/nutrition-plan', label: '营养设置', icon: Settings },
]

export function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (!session) return null

  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/setup'

  if (isAuthPage) return null

  return (
    <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="font-bold text-primary-700 text-lg hidden sm:block">
              碳循环记录
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    pathname === item.path
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          <div className="flex items-center space-x-2">
            <div className="hidden sm:flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User size={18} className="text-primary-600" />
              </div>
              <span className="text-sm text-gray-600 hidden lg:block">
                {session.user.email?.split('@')[0]}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="hidden sm:flex"
            >
              <LogOut size={18} className="mr-2" />
              退出
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors',
                    pathname === item.path
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
            <div className="pt-3 border-t">
              <Button
                variant="ghost"
                className="w-full justify-start px-3 py-3"
                onClick={() => signOut({ callbackUrl: '/login' })}
              >
                <LogOut size={20} className="mr-3" />
                退出登录
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
