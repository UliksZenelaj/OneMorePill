'use client'

import { useEffect, useState } from 'react'
import ReactCountryFlag from 'react-country-flag'
import { supabase } from '@/lib/supabaseClient'
import countries from 'world-countries'
import NationalityPicker from '@/components/ui/NationalityPicker'
import Link from 'next/link'
import { MapPin, Search, SlidersHorizontal } from 'lucide-react'

export default function ExplorePage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  
  // Stati del Form
  const [cityInput, setCityInput] = useState('')
  const [selectedCountry, setSelectedCountry] = useState<any>(null)
  const [radarActive, setRadarActive] = useState(false)
  const [genderFilter, setGenderFilter] = useState('all')
  const [myRadar, setMyRadar] = useState<string[]>([])

  useEffect(() => {
    async function loadMyRadar() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data } = await supabase
          .from('user_wishlist_nationalities')
          .select('country_code')
          .eq('user_id', session.user.id)
        setMyRadar(data?.map(d => d.country_code) || [])
      }
    }
    loadMyRadar()
  }, [])

  const handleSearch = async () => {
    setLoading(true)
    setHasSearched(true)

    // Partiamo scaricando i profili (escluso il proprio)
    const { data: { session } } = await supabase.auth.getSession()
    let query = supabase.from('profiles').select('*').neq('id', session?.user.id || '')

    // Filtro Gender (immediato via SQL)
    if (genderFilter !== 'all') {
      query = query.eq('gender', genderFilter)
    }

    const { data, error } = await query

    if (data) {
      let filtered = data

      // 1. FILTRO LOCATION (Nazione o Città)
      if (selectedCountry) {
        // Se c'è una nazione selezionata, cerchiamo per codice ISO (evita problemi di lingua)
        filtered = filtered.filter(p => p.nationality_1 === selectedCountry.cca2)
      } else if (cityInput.trim() !== '') {
        // Se l'utente scrive una città, cerchiamo nel campo city del profilo
        const term = cityInput.toLowerCase().trim()
        filtered = filtered.filter(p => p.city?.toLowerCase().includes(term))
      }

      // 2. FILTRO RADAR (Se attivo, mostra solo chi è nel mio radar)
      if (radarActive) {
        filtered = filtered.filter(p => myRadar.includes(p.nationality_1))
      }

      setResults(filtered)
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-white text-black font-['DM_Sans'] pb-32">
      <div className="max-w-md mx-auto px-6 pt-10">
        
        <h1 className="text-3xl font-black italic mb-8 tracking-tighter uppercase text-center">Explore</h1>

        {/* FORM DI RICERCA */}
        <div className="bg-gray-50 rounded-[2.5rem] p-6 space-y-6 shadow-sm border border-gray-100">
          
          {/* CAMPO 1: CITY O COUNTRY */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest ml-2 text-gray-400">Where</label>
            
            <div className="space-y-3">
              <div className="bg-white rounded-2xl border border-transparent focus-within:border-black p-4 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedCountry ? (
                      <>
                        <ReactCountryFlag svg countryCode={selectedCountry.cca2} style={{fontSize: '1.2em'}} />
                        <span className="text-sm font-bold">{selectedCountry.name.common}</span>
                      </>
                    ) : (
                      <span className="text-sm font-bold text-gray-400 italic">Select a country...</span>
                    )}
                  </div>
                  <NationalityPicker 
                    placeholder={selectedCountry ? "Change" : "Choose"}
                    className="text-[10px] font-black uppercase underline"
                    onSelect={(c) => {
                      setSelectedCountry(c)
                      setCityInput('') 
                    }}
                  />
                </div>
              </div>

              {!selectedCountry && (
                <input
                  type="text"
                  placeholder="...or type a city"
                  className="w-full bg-white rounded-2xl px-5 py-4 text-sm font-bold outline-none border border-transparent focus:border-black transition-all"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                />
              )}
              
              {selectedCountry && (
                <button 
                  onClick={() => setSelectedCountry(null)}
                  className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2"
                >
                  ✕ Clear Country to search by city
                </button>
              )}
            </div>
          </div>

          {/* CAMPO 2: RADAR TOGGLE */}
          <div className="flex items-center justify-between px-2 py-2 bg-white/50 rounded-2xl p-4 border border-gray-100">
            <div className="flex flex-col">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Radar Mode</label>
              <p className="text-[11px] font-bold text-black">Only target nationalities</p>
            </div>
            <button 
              onClick={() => setRadarActive(!radarActive)}
              className={`w-12 h-6 rounded-full transition-all relative ${radarActive ? 'bg-black' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${radarActive ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          {/* CAMPO 3: GENDER */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest ml-2 text-gray-400">Gender</label>
            <div className="flex gap-2">
              {['all', 'man', 'woman'].map((g) => (
                <button
                  key={g}
                  onClick={() => setGenderFilter(g)}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                    genderFilter === g ? 'bg-black text-white border-black' : 'bg-white text-gray-300 border-gray-100'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* SEARCH BUTTON */}
          <button 
            onClick={handleSearch}
            className="w-full bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/10"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* RISULTATI (Cliccabili verso il profilo pubblico) */}
        <div className="mt-12">
          {!hasSearched ? (
            <div className="text-center py-20 border-2 border-dashed border-gray-50 rounded-[3rem]">
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Ready to explore?</p>
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {results.map((p) => (
                <Link 
                  href={`/profile/${p.id}`} 
                  key={p.id} 
                  className="relative aspect-[2/3] rounded-[2.5rem] overflow-hidden bg-gray-100 border border-gray-100 group shadow-lg cursor-pointer"
                >
                  <img src={p.avatar_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={p.username} />
                  
                  {/* Info Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-5">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-black text-white uppercase tracking-tighter truncate">{p.username}</span>
                      <ReactCountryFlag svg countryCode={p.nationality_1} />
                    </div>
                    <p className="text-[9px] text-gray-300 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
  <MapPin size={10} strokeWidth={2} />
  {p.city || 'World'}
</p>
                    <p className="text-[9px] text-white/60 font-bold uppercase mb-4">
                      {p.height ? `${p.height} cm` : '—'}
                    </p>
                    
                    {/* Sostituito tag <a> con un div stilizzato per evitare Link annidati */}
                    <div className="bg-white text-black text-[9px] font-black uppercase py-2.5 rounded-2xl text-center shadow-lg group-hover:bg-gray-100 transition-colors">
                      View Profile
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <span className="text-4xl">🏳️</span>
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mt-4">No results found</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}