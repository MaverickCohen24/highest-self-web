'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Sun, Moon, CheckSquare, Activity,
  Map, Palette, BookOpen, BarChart3, Flame, LogOut, ScrollText, Smartphone
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Today' },
  { to: '/morning', icon: Sun, label: 'Morning' },
  { to: '/evening', icon: Moon, label: 'Evening' },
  { to: '/habits', icon: CheckSquare, label: 'Habits' },
  { to: '/protocols', icon: Activity, label: 'Protocols' },
  { to: '/mastery', icon: Map, label: 'Mastery' },
  { to: '/creative', icon: Palette, label: 'Creative' },
  { to: '/reflections', icon: BookOpen, label: 'Reflect' },
  { to: '/weekly', icon: BarChart3, label: 'Weekly' },
  { to: '/journal', icon: ScrollText, label: 'Journal' },
  { to: '/consumption', icon: Smartphone, label: 'Screen' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-16 flex flex-col items-center py-4 bg-[#0a0a0a] border-r border-[#1e1e1e] shrink-0">
      <div className="mb-6 mt-6">
        <Flame className="w-5 h-5 text-[#c9a84c]" strokeWidth={1.5} />
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {NAV.map(({ to, icon: Icon, label }) => {
          const active = pathname === to
          return (
            <Link
              key={to}
              href={to}
              title={label}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl transition-all',
                active
                  ? 'bg-[#252525] text-[#e8e6e3]'
                  : 'text-[#5a5855] hover:text-[#a8a5a0] hover:bg-[#161616]'
              )}
            >
              <Icon className="w-4 h-4" strokeWidth={active ? 2 : 1.5} />
              <span className="text-[9px] font-medium leading-none">{label}</span>
            </Link>
          )
        })}
      </nav>

      <button
        onClick={handleSignOut}
        className="text-[#5a5855] hover:text-[#a8a5a0] p-2 rounded-lg transition-colors mt-2"
        title="Sign out"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </aside>
  )
}
