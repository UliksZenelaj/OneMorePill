'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ReactCountryFlag from 'react-country-flag'
import { supabase } from '@/lib/supabaseClient'
import countries from 'world-countries'
import { MapPin, Instagram, ChevronLeft, Quote, User, Compass, Ruler, Radar } from 'lucide-react'

export default function PublicProfilePage() {
  const { id } = useParams()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [radarPills, setRadarPills] = useState<string[]>([]) // Ora carichiamo il Radar
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
        // CAMBIO LOGICA: Carichiamo la wishlist (Radar) invece del database
        const { data: wish } = await supabase
          .from('user_wishlist_nationalities')
          .select('country_code')
          .eq('user_id', id)
        setRadarPills(wish?.map(n => n.country_code) || [])
      }
      setLoading(false)
    }
    loadPublicData()
  }, [id])

  const countryName = (code: string) => countries.find(c => c.cca2 === code)?.name.common

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-200 animate-pulse">Loading...</p>
    </div>
  )

  if (!profile) return <div className="p-10 text-center font-bold">User not found</div>

  return (
    <main className="min-h-screen bg-white text-black font-['DM_Sans'] pb-32">
      <div className="max-w-md mx-auto px-6 pt-10">
        
        <button 
          onClick={() => router.push('/explore')}
          className="mb-8 w-12 h-12 flex items-center justify-center bg-white rounded-full border border-gray-100 shadow-sm active:scale-90 transition-all"
        >
          <ChevronLeft size={24} strokeWidth={1.5} />
        </button>

        <div className="space-y-6">
          
          <section className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-black italic uppercase tracking-tighter leading-none mb-3">
                  {profile.username}
                </h1>
                <p className="font-bold text-gray-400 flex items-center gap-2 italic text-sm">
                  <MapPin size={14} strokeWidth={2} />
                  {profile.city || 'Secret Location'}, {countryName(profile.residence_country || 'IT')}
                </p>
              </div>
              <div className="flex gap-1.5 pt-1">
                <ReactCountryFlag svg countryCode={profile.nationality_1} className="rounded-sm shadow-sm" />
                {profile.nationality_2 && <ReactCountryFlag svg countryCode={profile.nationality_2} className="rounded-sm shadow-sm" />}
              </div>
            </div>
          </section>

          {profile.introduction && (
            <section className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center gap-2 mb-3 text-gray-300">
                <Quote size={12} />
                <p className="text-[9px] font-black uppercase tracking-[0.2em]">Introduction</p>
              </div>
              <p className="text-sm font-bold leading-relaxed text-gray-800 italic">
                "{profile.introduction}"
              </p>
            </section>
          )}

          <section className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm grid grid-cols-3 divide-x divide-gray-100">
             <div className="py-5 flex flex-col items-center gap-1">
                <User size={14} className="text-gray-300 mb-1" />
                <p className="text-[9px] font-black uppercase tracking-widest text-black">{profile.gender}</p>
             </div>
             <div className="py-5 flex flex-col items-center gap-1">
                <Compass size={14} className="text-gray-300 mb-1" />
                <p className="text-[9px] font-black uppercase tracking-widest text-black">{profile.orientation}</p>
             </div>
             <div className="py-5 flex flex-col items-center gap-1">
                <Ruler size={14} className="text-gray-300 mb-1" />
                <p className="text-[9px] font-black uppercase tracking-widest text-black">{profile.height || '—'} cm</p>
             </div>
          </section>

          {/* SEZIONE RADAR PUBBLICA - STILE COERENTE */}
<section className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
  <div className="flex items-center gap-2 mb-5">
    <Radar size={16} className="text-black" />
    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-black">Target Radar</h2>
  </div>
  
  <div className="flex flex-wrap gap-3">
    {radarPills.length > 0 ? radarPills.map(code => (
      <div 
        key={code} 
        className="flex items-center gap-2 border-2 border-dashed border-gray-200 px-4 py-2.5 rounded-full bg-white shadow-sm transition-transform hover:scale-105"
      >
        <ReactCountryFlag svg countryCode={code} style={{fontSize: '1.1em'}} />
        <span className="text-[11px] font-bold text-gray-700 uppercase tracking-tight">
          {countryName(code)}
        </span>
      </div>
    )) : (
      <p className="text-[10px] text-gray-300 italic font-bold px-2">
        No specific radar targets yet
      </p>
    )}
  </div>
</section>

          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-[2/3] rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-md">
              <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Main" />
            </div>
            {profile.avatar_url_2 ? (
              <div className="aspect-[2/3] rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-md">
                <img src={profile.avatar_url_2} className="w-full h-full object-cover" alt="Secondary" />
              </div>
            ) : (
              <div className="aspect-[2/3] rounded-[2.5rem] bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center">
                 <span className="text-[9px] font-black text-gray-200 uppercase tracking-widest text-center px-4">No second photo</span>
              </div>
            )}
          </div>

          {profile.social_handle && (
            <div className="pt-6">
              <a 
                href={`https://instagram.com/${profile.social_handle.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-black text-white py-6 rounded-3xl font-black uppercase tracking-widest text-center text-[10px] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-2xl"
              >
                <Instagram size={16} />
                Contact on Instagram
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}