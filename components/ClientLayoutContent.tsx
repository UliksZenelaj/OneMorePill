'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Search, User } from 'lucide-react'

export function ClientLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const noNavRoutes = ['/', '/signup']
  const showNav = !noNavRoutes.includes(pathname)

  return (
    <>
      <main className={`${showNav ? 'pb-24' : ''}`}>
        {children}
      </main>

      {showNav && (
  <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 h-20 flex items-center justify-around z-50 px-8 max-w-md mx-auto">
    
    {/* EXPLORE */}
    <Link href="/explore" className="flex flex-col items-center gap-1.5 group">
      <Search 
        size={20} 
        strokeWidth={pathname === '/explore' ? 2.5 : 1.5} 
        className={`transition-all duration-300 ${pathname === '/explore' ? 'text-black scale-110' : 'text-gray-300'}`} 
      />
      <span className={`text-[9px] font-black uppercase tracking-[0.15em] transition-colors ${pathname === '/explore' ? 'text-black' : 'text-gray-300'}`}>
        Explore
      </span>
    </Link>
    
    {/* PROFILE */}
    <Link href="/profile" className="flex flex-col items-center gap-1.5 group">
      <User 
        size={20} 
        strokeWidth={pathname === '/profile' ? 2.5 : 1.5} 
        className={`transition-all duration-300 ${pathname === '/profile' ? 'text-black scale-110' : 'text-gray-300'}`} 
      />
      <span className={`text-[9px] font-black uppercase tracking-[0.15em] transition-colors ${pathname === '/profile' ? 'text-black' : 'text-gray-300'}`}>
        Profile
      </span>
    </Link>

  </nav>
)}
    </>
  )
}