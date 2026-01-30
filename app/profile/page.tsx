'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ReactCountryFlag from 'react-country-flag'
import NationalityPicker from '@/components/ui/NationalityPicker'
import { supabase } from '@/lib/supabaseClient'
import countries from 'world-countries'

type Profile = {
  id: string
  username: string
  gender: string
  orientation: string
  nationality_1: string
  nationality_2: string | null
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [nationalities, setNationalities] = useState<string[]>([])
  const [userId, setUserId] = useState<string | null>(null)

  // load session + data
  useEffect(() => {
    async function load() {
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session) {
        router.push('/')
        return
      }

      const uid = sessionData.session.user.id
      setUserId(uid)

      // profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single()

      if (!profileData) return
      setProfile(profileData)

      // nationalities
      const { data: natData } = await supabase
        .from('user_nationalities')
        .select('country_code')
        .eq('user_id', uid)

      setNationalities(natData?.map((n) => n.country_code) ?? [])
    }

    load()
  }, [router])

  async function addNationality(code: string) {
    if (!userId) return
    if (nationalities.includes(code)) return

    // optimistic UI
    setNationalities((prev) => [...prev, code])

    const { error } = await supabase
      .from('user_nationalities')
      .insert({
        user_id: userId,
        country_code: code,
      })

    if (error) {
      console.error(error)
      // rollback UI if insert fails
      setNationalities((prev) => prev.filter((c) => c !== code))
    }
  }

  if (!profile) return null

  return (
    <main className="min-h-screen bg-white px-4 py-6">
      <div className="max-w-sm mx-auto space-y-6">
        {/* logout */}
        <button
          onClick={async () => {
            await supabase.auth.signOut()
            router.push('/')
          }}
          className="text-sm text-gray-600 underline"
        >
          Logout
        </button>

        {/* project name */}
        <h1 className="text-xl font-bold text-black">
          OneMoreColor
        </h1>

        {/* user card */}
        <div className="border border-gray-300 rounded-xl p-4">
          <div className="flex items-center gap-2 font-semibold text-black">
            {profile.username}
            <ReactCountryFlag svg countryCode={profile.nationality_1} />
            {profile.nationality_2 && (
              <ReactCountryFlag svg countryCode={profile.nationality_2} />
            )}
          </div>

          <div className="text-sm text-gray-700 mt-1">
            {profile.gender}
          </div>
          <div className="text-sm text-gray-700">
            {profile.orientation}
          </div>
        </div>

        {/* nationalities */}
        <div>
          <h2 className="font-semibold text-black mb-3">
            Nationalities I’ve been with
          </h2>

          <div className="flex flex-wrap gap-2">
            {nationalities.map((code) => (
              <span
                key={code}
                className="flex items-center gap-1.5 border border-gray-400 rounded-full px-2.5 py-0.5 text-sm text-black"
              >
                <ReactCountryFlag svg countryCode={code} />
                {countries.find((c) => c.cca2 === code)?.name.common}
              </span>
            ))}

            {/* add one more */}
            <div className="border border-gray-400 rounded-full px-2.5 py-0.5 text-sm text-gray-600">
              <NationalityPicker
                placeholder="add one more"
                onSelect={(c) => addNationality(c.cca2)}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
