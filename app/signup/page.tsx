'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import NationalityPicker from '@/components/ui/NationalityPicker'
import { supabase } from '@/lib/supabaseClient'
import ReactCountryFlag from 'react-country-flag'
import countries from 'world-countries'

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    username: '',
    gender: '',
    orientation: '',
    city: '',
    residence_country: '',
    social_handle: '',
    nationality1: '',
    nationality2: '',
    email: '',
    password: '',
  })

  // Per la UI delle bandiere selezionate
  const [nat1, setNat1] = useState<string | null>(null)
  const [nat2, setNat2] = useState<string | null>(null)
  const [resCountry, setResCountry] = useState<string | null>(null)

  function isValid() {
    return (
      form.username &&
      form.gender &&
      form.orientation &&
      form.city &&
      form.residence_country &&
      form.nationality1 &&
      form.email &&
      form.password
    )
  }

  async function handleSignup() {
    if (!isValid()) return
    setLoading(true)

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

    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      username: form.username,
      gender: form.gender,
      orientation: form.orientation,
      city: form.city,
      residence_country: form.residence_country,
      social_handle: form.social_handle || null,
      nationality_1: form.nationality1,
      nationality_2: form.nationality2 || null,
    })

    if (profileError) {
      alert(profileError.message)
      setLoading(false)
      return
    }

    router.push('/profile')
  }

  function countryName(code: string | null) {
    return countries.find((c) => c.cca2 === code)?.name.common
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
            <h1 className="text-xl font-bold text-black">OneMorePill</h1>
            <p className="text-sm text-gray-600">Track your international romances</p>
        </div>

        <div className="space-y-4">
          <Input
            placeholder="username"
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-2">
            <Select onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              <option value="">gender</option>
              <option>man</option>
              <option>woman</option>
              <option>non-binary</option>
            </Select>

            <Select onChange={(e) => setForm({ ...form, orientation: e.target.value })}>
              <option value="">orientation</option>
              <option>heterosexual</option>
              <option>homosexual</option>
              <option>bisexual</option>
              <option>other</option>
            </Select>
          </div>

          {/* LOCATION SECTION */}
          <div className="space-y-2 border-l-2 border-gray-100 pl-3">
            <p className="text-xs font-semibold text-gray-400 uppercase">Where do you live?</p>
            <div className="flex gap-2">
                <Input
                    placeholder="City (e.g. Rome)"
                    className="flex-1"
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
                <div className="w-24 border border-gray-400 rounded-lg px-2 py-2 text-sm flex items-center justify-center">
                    {resCountry ? (
                        <button onClick={() => setResCountry(null)}>
                            <ReactCountryFlag svg countryCode={resCountry} />
                        </button>
                    ) : (
                        <NationalityPicker
                            placeholder="Country"
                            onSelect={(c) => {
                                setForm({ ...form, residence_country: c.cca2 })
                                setResCountry(c.cca2)
                            }}
                        />
                    )}
                </div>
            </div>
          </div>

          {/* NATIONALITIES SECTION */}
          <div className="space-y-2 border-l-2 border-gray-100 pl-3">
            <p className="text-xs font-semibold text-gray-400 uppercase">Your origins</p>
            <div className="grid grid-cols-2 gap-2">
                <div className="border border-gray-400 rounded-lg px-3 py-2 text-sm">
                    {nat1 ? (
                        <span className="flex items-center gap-2">
                            <ReactCountryFlag svg countryCode={nat1} /> {nat1}
                        </span>
                    ) : (
                        <NationalityPicker
                            placeholder="Nationality 1"
                            onSelect={(c) => {
                                setForm({ ...form, nationality1: c.cca2 })
                                setNat1(c.cca2)
                            }}
                        />
                    )}
                </div>
                <div className="border border-gray-400 rounded-lg px-3 py-2 text-sm">
                    {nat2 ? (
                        <span className="flex items-center gap-2">
                            <ReactCountryFlag svg countryCode={nat2} /> {nat2}
                        </span>
                    ) : (
                        <NationalityPicker
                            placeholder="Nationality 2 optional"
                            onSelect={(c) => {
                                setForm({ ...form, nationality2: c.cca2 })
                                setNat2(c.cca2)
                            }}
                        />
                    )}
                </div>
            </div>
          </div>

          <Input
            placeholder="Instagram (e.g. @username)"
            onChange={(e) => setForm({ ...form, social_handle: e.target.value })}
          />

         <p className="text-sm text-gray-600">If you don't provide your Instagram account it will be impossible for the users to contact you, OneMorePill doesn't offer chat service so far</p>

          <hr className="my-4 border-gray-100" />

          <Input
            type="email"
            placeholder="email@email.com"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <Input
            type="password"
            placeholder="password"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <Button
            onClick={handleSignup}
            disabled={!isValid() || loading}
            className="w-full"
          >
            {loading ? 'Creating account...' : 'Complete Signup'}
          </Button>
        </div>
      </div>
    </main>
  )
}