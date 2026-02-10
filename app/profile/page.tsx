'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ReactCountryFlag from 'react-country-flag'
import NationalityPicker from '@/components/ui/NationalityPicker'
import { supabase } from '@/lib/supabaseClient'
import countries from 'world-countries'
import confetti from 'canvas-confetti'
import { 
  MapPin, 
  Instagram, 
  LogOut, 
  Trash2, 
  User, 
  Ruler, 
  Compass, 
  Edit3, 
  Database as DbIcon, 
  Radar,
  Quote
} from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'pills' | 'profile'>('pills')
  const [profile, setProfile] = useState<any>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [beenWith, setBeenWith] = useState<string[]>([])
  const [wishlist, setWishlist] = useState<string[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [pillToDelete, setPillToDelete] = useState<{code: string, type: 'database' | 'radar'} | null>(null)
  const [uploading, setUploading] = useState<{slot: 1 | 2, state: boolean}>({slot: 1, state: false})
  
  const [editForm, setEditForm] = useState({
    city: '',
    residence_country: '',
    social_handle: '',
    height: '',
    introduction: '' // <-- Nuovo campo
  })

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/'); return; }
      const uid = session.user.id
      setUserId(uid)

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', uid).single()
      if (profileData) {
        setProfile(profileData)
        setEditForm({
          city: profileData.city || '',
          residence_country: profileData.residence_country || '',
          social_handle: profileData.social_handle || '',
          height: profileData.height?.toString() || '',
          introduction: profileData.introduction || '' // <-- Caricamento
        })
      }

      const { data: been } = await supabase.from('user_nationalities').select('country_code').eq('user_id', uid)
      setBeenWith(been?.map(n => n.country_code) || [])

      const { data: wish } = await supabase.from('user_wishlist_nationalities').select('country_code').eq('user_id', uid)
      setWishlist(wish?.map(n => n.country_code) || [])
    }
    load()
  }, [router])

  async function confirmDeletePill() {
    if (!userId || !pillToDelete) return
    const table = pillToDelete.type === 'database' ? 'user_nationalities' : 'user_wishlist_nationalities'
    const { error } = await supabase.from(table).delete().eq('user_id', userId).eq('country_code', pillToDelete.code)
    if (!error) {
      if (pillToDelete.type === 'database') setBeenWith(prev => prev.filter(c => c !== pillToDelete.code))
      else setWishlist(prev => prev.filter(c => c !== pillToDelete.code))
      setPillToDelete(null)
    }
  }

  const handleDeleteAccount = async () => {
    if (confirm("ATTENZIONE: Questa azione è irreversibile. Procedere?")) {
      try {
        if (!userId) return
        await supabase.from('user_nationalities').delete().eq('user_id', userId)
        await supabase.from('user_wishlist_nationalities').delete().eq('user_id', userId)
        await supabase.from('profiles').delete().eq('id', userId)
        await supabase.auth.signOut()
        router.push('/')
      } catch (e) { alert("Errore durante l'eliminazione.") }
    }
  }

  // --- FUNZIONI PER AGGIUNGERE PILLOLE (Mancanti nello screen) ---
async function addBeenWith(code: string) {
  if (!userId || beenWith.includes(code)) return
  const { error } = await supabase.from('user_nationalities').insert({ user_id: userId, country_code: code })
  if (!error) {
    setBeenWith((prev) => [...prev, code])
    // Se vuoi i coriandoli, lasciali pure!
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#000000', '#ffffff', '#FFD700'] })
  }
}

async function addWishlist(code: string) {
  if (!userId || wishlist.includes(code)) return
  const { error } = await supabase.from('user_wishlist_nationalities').insert({ user_id: userId, country_code: code })
  if (!error) { 
    setWishlist((prev) => [...prev, code]) 
  }
}

  const handleUpdate = async () => {
    const { error } = await supabase.from('profiles').update({
      city: editForm.city, 
      residence_country: editForm.residence_country,
      social_handle: editForm.social_handle, 
      height: parseInt(editForm.height) || null,
      introduction: editForm.introduction // <-- Salvataggio
    }).eq('id', userId)

    if (!error) {
      setProfile({ ...profile, ...editForm, height: parseInt(editForm.height) })
      setIsEditing(false)
    }
  }

  // ... (uploadPhoto e countryName rimangono uguali)
  async function uploadPhoto(event: any, slot: 1 | 2) {
    try {
      setUploading({ slot, state: true })
      const file = event.target.files[0]
      const filePath = `${userId}-${slot}-${Math.random()}.${file.name.split('.').pop()}`
      await supabase.storage.from('avatars').upload(filePath, file)
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath)
      const updateData = slot === 1 ? { avatar_url: publicUrl } : { avatar_url_2: publicUrl }
      await supabase.from('profiles').update(updateData).eq('id', userId)
      setProfile({ ...profile, ...updateData })
    } catch (e) { console.error(e) } finally { setUploading({ slot, state: false }) }
  }

  const countryName = (code: string) => countries.find(c => c.cca2 === code)?.name.common
  if (!profile) return null

  return (
    <main className="min-h-screen bg-white text-black pb-32 font-['DM_Sans']">
      <div className="max-w-md mx-auto px-6 pt-10">
        
        <h1 className="text-3xl font-black mb-10 tracking-tighter italic text-center sm:text-left">OneMorePill</h1>

        <div className="flex justify-center gap-12 border-b border-gray-100 mb-8">
          <button 
  onClick={() => setActiveTab('pills')} 
  className={`pb-4 flex items-center gap-2 text-sm font-bold transition-all ${activeTab === 'pills' ? 'border-b-2 border-black text-black' : 'text-gray-300'}`}
>
  <DbIcon size={16} strokeWidth={activeTab === 'pills' ? 2.5 : 1.5} /> Pills
</button>
          <button onClick={() => setActiveTab('profile')} className={`pb-4 flex items-center gap-2 text-sm font-bold transition-all ${activeTab === 'profile' ? 'border-b-2 border-black text-black' : 'text-gray-300'}`}>
            <User size={16} strokeWidth={activeTab === 'profile' ? 2.5 : 1.5} /> My Profile
          </button>
        </div>

        {activeTab === 'pills' ? (
  <div className="space-y-12 animate-in fade-in duration-500">
            {/* ... Sezione Database e Radar (invariate) ... */}
            <section>
              <div className="flex items-center gap-2 mb-1">
                <DbIcon size={18} className="text-gray-400" />
                <h2 className="text-xl font-bold italic tracking-tight">Database</h2>
              </div>
              <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-6 ml-7">Nationalities i've been with</p>
              <div className="flex flex-wrap gap-3">
                {beenWith.map(code => (
                  <button key={code} onClick={() => setPillToDelete({ code, type: 'database' })} className="flex items-center gap-2 border border-gray-100 rounded-full pl-3 pr-5 py-2.5 font-bold shadow-sm bg-white active:scale-95 transition-all">
                    <ReactCountryFlag svg countryCode={code} style={{fontSize: '1.2em'}} />
                    <span className="text-sm">{countryName(code)}</span>
                  </button>
                ))}
                <div className="border border-dashed border-gray-200 rounded-full px-5 py-2.5 text-gray-400 font-bold text-sm">
                   <NationalityPicker placeholder="+ add one" onSelect={(c) => addBeenWith(c.cca2)} />
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-1">
                <Radar size={18} className="text-gray-400" />
                <h2 className="text-xl font-bold italic tracking-tight">Radar</h2>
              </div>
              <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-6 ml-7">Nationalities i'd like to date</p>
              <div className="flex flex-wrap gap-3">
                {wishlist.map(code => (
                  <button key={code} onClick={() => setPillToDelete({ code, type: 'radar' })} className="flex items-center gap-2 border border-dashed border-gray-200 rounded-full pl-3 pr-5 py-2.5 font-bold text-gray-700 bg-gray-50/30 active:scale-95 transition-all">
                    <ReactCountryFlag svg countryCode={code} style={{fontSize: '1.2em'}} />
                    <span className="text-sm">{countryName(code)}</span>
                  </button>
                ))}
                <div className="border border-dashed border-gray-200 rounded-full px-5 py-2.5 text-gray-400 font-bold text-sm">
                   <NationalityPicker placeholder="+ add one" onSelect={(c) => addWishlist(c.cca2)} />
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-500">
            {isEditing ? (
              <div className="space-y-6 border border-gray-100 rounded-[2rem] p-8 bg-gray-50/30">
                <div className="space-y-4">
                  <input placeholder="City" className="w-full bg-transparent border-b border-gray-200 py-3 font-bold outline-none focus:border-black transition-all" value={editForm.city} onChange={e => setEditForm({...editForm, city: e.target.value})} />
                  <div className="flex items-center gap-2 py-3 border-b border-gray-200 font-bold">
                      <NationalityPicker placeholder="Select residence" onSelect={(c) => setEditForm({...editForm, residence_country: c.cca2})} />
                      {editForm.residence_country && <ReactCountryFlag svg countryCode={editForm.residence_country} />}
                  </div>
                  <input placeholder="Height (cm)" type="number" className="w-full bg-transparent border-b border-gray-200 py-3 font-bold outline-none focus:border-black transition-all" value={editForm.height} onChange={e => setEditForm({...editForm, height: e.target.value})} />
                  <input placeholder="Instagram @handle" className="w-full bg-transparent border-b border-gray-200 py-3 font-bold outline-none focus:border-black transition-all" value={editForm.social_handle} onChange={e => setEditForm({...editForm, social_handle: e.target.value})} />
                  
                  {/* EDIT INTRODUCTION */}
                  <div className="pt-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Introduction</label>
                    <textarea 
                      placeholder="Who are you? How should they contact you?" 
                      className="w-full bg-transparent border-b border-gray-200 py-3 font-bold outline-none focus:border-black transition-all resize-none h-24"
                      maxLength={240}
                      value={editForm.introduction} 
                      onChange={e => setEditForm({...editForm, introduction: e.target.value})} 
                    />
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-[9px] text-gray-300 font-bold italic text-left">Max 240 chars</span>
                      <span className={`text-[9px] font-bold ${editForm.introduction.length >= 240 ? 'text-red-500' : 'text-gray-300'}`}>
                        {editForm.introduction.length}/240
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <button onClick={handleUpdate} className="flex-1 bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px]">Save</button>
                    <button onClick={() => setIsEditing(false)} className="flex-1 bg-white border border-gray-200 text-black py-4 rounded-2xl font-black uppercase tracking-widest text-[10px]">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="border border-gray-100 rounded-[2.5rem] p-8 space-y-4 bg-white shadow-sm">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-black italic tracking-tighter">{profile.username}</h3>
                    <div className="flex gap-1.5">
                      <ReactCountryFlag svg countryCode={profile.nationality_1} className="rounded-sm" />
                      {profile.nationality_2 && <ReactCountryFlag svg countryCode={profile.nationality_2} className="rounded-sm" />}
                    </div>
                  </div>
                  <p className="font-bold text-gray-400 flex items-center gap-2 italic text-sm">
                    <MapPin size={14} strokeWidth={2} />
                    {profile.city || 'Set City'}, {countryName(profile.residence_country || 'IT')}
                  </p>
                </div>

                {/* VISUALIZZAZIONE INTRODUCTION */}
                {profile.introduction && (
                  <div className="border border-gray-100 rounded-[2.5rem] p-8 bg-white shadow-sm animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-2 mb-3">
                      <Quote size={12} className="text-gray-300" />
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-300">Introduction</p>
                    </div>
                    <p className="text-sm font-bold leading-relaxed text-gray-800 italic">
                      "{profile.introduction}"
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-3 border border-gray-100 rounded-[1.5rem] overflow-hidden divide-x divide-gray-100 bg-white">
                  <div className="py-5 flex flex-col items-center gap-1.5 text-gray-400">
                    <User size={16} strokeWidth={1.5} />
                    <span className="text-[10px] font-black uppercase text-black">{profile.gender}</span>
                  </div>
                  <div className="py-5 flex flex-col items-center gap-1.5 text-gray-400">
                    <Compass size={16} strokeWidth={1.5} />
                    <span className="text-[10px] font-black uppercase text-black">{profile.orientation}</span>
                  </div>
                  <div className="py-5 flex flex-col items-center gap-1.5 text-gray-400">
                    <Ruler size={16} strokeWidth={1.5} />
                    <span className="text-[10px] font-black uppercase text-black">{profile.height || '—'} cm</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[1, 2].map((slot) => (
                    <div key={slot} className="relative aspect-[4/5] bg-gray-50 rounded-[2rem] overflow-hidden border border-gray-100 group shadow-sm">
                      {(slot === 1 ? profile.avatar_url : profile.avatar_url_2) && (
                        <img src={slot === 1 ? profile.avatar_url : profile.avatar_url_2} className="w-full h-full object-cover" />
                      )}
                      <label className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <span className="bg-white text-black text-[10px] font-black px-5 py-2.5 rounded-full shadow-xl uppercase tracking-widest">UPLOAD {slot}</span>
                        <input type="file" className="hidden" onChange={(e) => uploadPhoto(e, slot as 1 | 2)} />
                      </label>
                    </div>
                  ))}
                </div>

                <div className="border border-gray-100 rounded-2xl p-5 flex items-center gap-4 bg-white shadow-sm">
                  <Instagram size={18} strokeWidth={1.5} className="text-gray-400" />
                  <span className="font-bold flex-1 text-sm">{profile.social_handle || '@instagram'}</span>
                </div>

                <div className="space-y-3 pt-6">
                    <button onClick={() => setIsEditing(true)} className="w-full py-4 flex items-center justify-center gap-2 border border-gray-200 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-black transition-all bg-white">
                        <Edit3 size={14} /> Edit profile
                    </button>
                    <button onClick={async () => { await supabase.auth.signOut(); router.push('/'); }} className="w-full py-4 flex items-center justify-center gap-2 text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] hover:text-black transition-colors">
                        <LogOut size={14} /> Logout
                    </button>
                    <div className="pt-10 mt-6 border-t border-gray-50 text-center">
                        <p className="text-[9px] font-black text-red-200 uppercase tracking-[0.3em] mb-4 text-center">Danger Zone</p>
                        <button onClick={handleDeleteAccount} className="w-full py-4 flex items-center justify-center gap-2 border border-red-50 text-red-300 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all">
                            <Trash2 size={14} /> Delete Account Forever
                        </button>
                    </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* MODAL CANCELLAZIONE (invariato) */}
        {pillToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/10 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-xs rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200 text-center border border-gray-50">
              <div className="mb-6 flex justify-center">
                <ReactCountryFlag svg countryCode={pillToDelete.code} style={{fontSize: '4em'}} className="rounded-md shadow-sm" />
              </div>
              <h3 className="text-xl font-black uppercase italic tracking-tighter mb-2">Remove Pill?</h3>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-10 leading-relaxed px-4">
                Are you sure you want to remove <br/>
                <span className="text-black">{countryName(pillToDelete.code)}</span>?
              </p>
              
              <div className="space-y-3">
                <button onClick={confirmDeletePill} className="w-full bg-red-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-100 active:scale-95 transition-all">
                   Remove it
                </button>
                <button onClick={() => setPillToDelete(null)} className="w-full bg-gray-50 text-gray-400 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all">
                   Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}