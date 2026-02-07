'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { supabase } from '@/lib/supabaseClient'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin() {
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    router.push('/profile')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        {/* Header centrato */}
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-black">
            OneMorePill
          </h1>
          <p className="text-sm text-gray-600">
            Track your international romances
          </p>
        </div>

        <div className="space-y-4">
          <Input
            type="email"
            placeholder="email@email.com"
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            type="password"
            placeholder="********"
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button onClick={handleLogin} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>

          <p className="text-sm text-center text-gray-600 mt-6">
            Don’t have an account?{' '}
            <Link href="/signup" className="text-black font-medium">
              Signup
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}