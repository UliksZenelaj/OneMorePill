'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

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
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 h-16 flex items-center justify-around z-50 px-4 max-w-md mx-auto shadow-[0_-5px_15px_rgba(0,0,0,0.02)]">
          <Link href="/explore" className="flex flex-col items-center gap-1 group">
            <span className={`text-xl transition-all ${pathname === '/explore' ? 'scale-110' : 'opacity-30'}`}>🔍</span>
            <span className={`text-[9px] font-black uppercase tracking-tighter ${pathname === '/explore' ? 'text-black' : 'text-gray-400'}`}>
              Explore
            </span>
          </Link>
          
          <Link href="/profile" className="flex flex-col items-center gap-1 group">
            <span className={`text-xl transition-all ${pathname === '/profile' ? 'scale-110' : 'opacity-30'}`}>👤</span>
            <span className={`text-[9px] font-black uppercase tracking-tighter ${pathname === '/profile' ? 'text-black' : 'text-gray-400'}`}>
              Profile
            </span>
          </Link>
        </nav>
      )}
    </>
  )
}