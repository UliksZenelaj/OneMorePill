'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import NationalityPicker from '@/components/ui/NationalityPicker'
import { supabase } from '@/lib/supabaseClient'

export default function SignupPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    username: '',
    gender: '',
    orientation: '',
    nationality1: '',
    nationality2: '',
    email: '',
    password: '',
  })

  function isValid() {
    return (
      form.username &&
      form.gender &&
      form.orientation &&
      form.nationality1 &&
      form.email &&
      form.password
    )
  }

  async function handleSignup() {
    if (!isValid()) return
    setLoading(true)

    // 1️⃣ create auth user
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (error || !data.user) {
      alert(error?.message || 'Signup failed')
      setLoading(false)
      return
    }

    const userId = data.user.id

    // 2️⃣ create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        username: form.username,
        gender: form.gender,
        orientation: form.orientation,
        nationality_1: form.nationality1,
        nationality_2: form.nationality2 || null,
      })

    if (profileError) {
      alert(profileError.message)
      setLoading(false)
      return
    }

    // 3️⃣ redirect
    router.push('/profile')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-bold text-black mb-8">
          OneMoreColor
        </h1>

        <div className="space-y-4">
          <Input
            placeholder="username"
            onChange={(e) =>
              setForm({ ...form, username: e.target.value })
            }
          />

          <Select
            onChange={(e) =>
              setForm({ ...form, gender: e.target.value })
            }
          >
            <option value="">gender</option>
            <option>man</option>
            <option>woman</option>
            <option>non-binary</option>
            <option>prefer not to say</option>
          </Select>

          <Select
            onChange={(e) =>
              setForm({ ...form, orientation: e.target.value })
            }
          >
            <option value="">orientation</option>
            <option>heterosexual</option>
            <option>homosexual</option>
            <option>bisexual</option>
            <option>pansexual</option>
            <option>asexual</option>
            <option>other</option>
          </Select>

          <div className="w-full border border-gray-400 rounded-lg px-4 py-2 text-sm text-black">
  <NationalityPicker
    placeholder="nationality 1"
    onSelect={(c) =>
      setForm({ ...form, nationality1: c.cca2 })
    }
  />
</div>

<div className="w-full border border-gray-400 rounded-lg px-4 py-2 text-sm text-black">
  <NationalityPicker
    placeholder="nationality 2 (optional)"
    onSelect={(c) =>
      setForm({ ...form, nationality2: c.cca2 })
    }
  />
</div>


          <Input
            type="email"
            placeholder="email@email.com"
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <Input
            type="password"
            placeholder="********"
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          <div className="mt-6">
            <Button
              onClick={handleSignup}
              disabled={!isValid() || loading}
            >
              {loading ? 'Signing up...' : 'Signup'}
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
