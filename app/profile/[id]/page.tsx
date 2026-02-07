'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ReactCountryFlag from 'react-country-flag'
import { supabase } from '@/lib/supabaseClient'
import countries from 'world-countries'

export default function PublicProfilePage() {
  const { id } = useParams()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [beenWith, setBeenWith] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPublicData() {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

      if (profileData) {
        setProfile(profileData)
        // Carichiamo solo il Database delle nazioni (pubblico)
        const { data: been } = await supabase
          .from('user_nationalities')
          .select('country_code')
          .eq('user_id', id)
        setBeenWith(been?.map(n => n.country_code) || [])
      }
      setLoading(false)
    }
    loadPublicData()
  }, [id])

  const countryName = (code: string) => countries.find(c => c.cca2 === code)?.name.common

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-200">Loading...</p>
    </div>
  )

  if (!profile) return <div className="p-10 text-center">User not found</div>

  return (
    <main className="min-h-screen bg-white text-black font-['DM_Sans'] pb-32">
      <div className="max-w-md mx-auto px-6 pt-10">
        
        {/* 1. ICONA BACK */}
        <button 
          onClick={() => router.push('/explore')}
          className="mb-8 w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full border border-gray-100 active:scale-90 transition-all"
        >
          <span className="text-xl">←</span>
        </button>

        <div className="space-y-4">
          
          {/* 2. CARD NOME / LOCATION */}
          <section className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-2">
                  {profile.username}
                </h1>
                <p className="text-gray-400 font-bold italic text-sm">
                  📍 {profile.city || 'World'}
                </p>
              </div>
              <div className="flex gap-1 pt-1">
                <ReactCountryFlag svg countryCode={profile.nationality_1} style={{fontSize: '1.4em'}} />
                {profile.nationality_2 && <ReactCountryFlag svg countryCode={profile.nationality_2} style={{fontSize: '1.4em'}} />}
              </div>
            </div>
          </section>

          {/* 3. DATABASE (TRA NOME E INFO FISICHE) */}
          <section className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 mb-4">Database</h2>
            <div className="flex flex-wrap gap-2">
              {beenWith.length > 0 ? beenWith.map(code => (
                <div key={code} className="flex items-center gap-2 border border-gray-100 px-4 py-2 rounded-full bg-white shadow-sm">
                  <ReactCountryFlag svg countryCode={code} />
                  <span className="text-[11px] font-bold text-black uppercase tracking-tight">{countryName(code)}</span>
                </div>
              )) : (
                <p className="text-[10px] text-gray-300 italic font-bold">No data collected</p>
              )}
            </div>
          </section>

          {/* 4. CARD INFO FISICHE (Gender, Height, Orientation) */}
          <section className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm grid grid-cols-3 divide-x divide-gray-100">
             <div className="py-5 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-black">{profile.gender}</p>
             </div>
             <div className="py-5 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-black">{profile.orientation}</p>
             </div>
             <div className="py-5 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-black">{profile.height} cm</p>
             </div>
          </section>

          {/* 5. GALLERIA FOTO */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="aspect-[2/3] rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm">
              <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Main" />
            </div>
            {profile.avatar_url_2 ? (
              <div className="aspect-[2/3] rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm">
                <img src={profile.avatar_url_2} className="w-full h-full object-cover" alt="Secondary" />
              </div>
            ) : (
              <div className="aspect-[2/3] rounded-[2.5rem] bg-gray-50 border border-dashed border-gray-200" />
            )}
          </div>

          {/* 6. BUTTON INSTAGRAM */}
          {profile.social_handle && (
            <div className="pt-4">
              <a 
                href={`https://instagram.com/${profile.social_handle.replace('@', '')}`}
                target="_blank"
                className="w-full bg-black text-white py-6 rounded-2xl font-black uppercase tracking-widest text-center text-xs block active:scale-95 transition-transform shadow-xl"
              >
                Contact on Instagram
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}