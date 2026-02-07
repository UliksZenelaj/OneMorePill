'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ReactCountryFlag from 'react-country-flag'
import NationalityPicker from '@/components/ui/NationalityPicker'
import { supabase } from '@/lib/supabaseClient'
import countries from 'world-countries'
import confetti from 'canvas-confetti'

export default function ProfilePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'lists' | 'profile'>('lists')
  const [profile, setProfile] = useState<any>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [beenWith, setBeenWith] = useState<string[]>([])
  const [wishlist, setWishlist] = useState<string[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [uploading, setUploading] = useState<{slot: 1 | 2, state: boolean}>({slot: 1, state: false})
  
  const [editForm, setEditForm] = useState({
    city: '',
    residence_country: '',
    social_handle: '',
    height: ''
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
          height: profileData.height?.toString() || ''
        })
      }

      const { data: been } = await supabase.from('user_nationalities').select('country_code').eq('user_id', uid)
      setBeenWith(been?.map(n => n.country_code) || [])

      const { data: wish } = await supabase.from('user_wishlist_nationalities').select('country_code').eq('user_id', uid)
      setWishlist(wish?.map(n => n.country_code) || [])
    }
    load()
  }, [router])

  // --- ELIMINAZIONE ACCOUNT ---
  const handleDeleteAccount = async () => {
    const confirmDelete = confirm(
      "ATTENZIONE: Questa azione è irreversibile. Elimineremo definitivamente il tuo profilo e tutte le tue liste. Procedere?"
    )

    if (confirmDelete) {
      try {
        if (!userId) return

        // 1. Eliminiamo i dati dalle tabelle correlate
        await supabase.from('user_nationalities').delete().eq('user_id', userId)
        await supabase.from('user_wishlist_nationalities').delete().eq('user_id', userId)
        
        // 2. Eliminiamo il profilo
        const { error } = await supabase.from('profiles').delete().eq('id', userId)
        if (error) throw error

        // 3. Logout e ritorno alla home
        await supabase.auth.signOut()
        router.push('/')
      } catch (e) {
        console.error(e)
        alert("Errore durante l'eliminazione dell'account.")
      }
    }
  }

  // --- ALTRE FUNZIONI ---
  async function addBeenWith(code: string) {
    if (!userId || beenWith.includes(code)) return
    const { error } = await supabase.from('user_nationalities').insert({ user_id: userId, country_code: code })
    if (!error) {
      setBeenWith((prev) => [...prev, code])
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#000000', '#ffffff', '#FFD700'] })
    }
  }

  async function addWishlist(code: string) {
    if (!userId || wishlist.includes(code)) return
    const { error } = await supabase.from('user_wishlist_nationalities').insert({ user_id: userId, country_code: code })
    if (!error) { setWishlist((prev) => [...prev, code]) }
  }

  const handleUpdate = async () => {
    const { error } = await supabase.from('profiles').update({
      city: editForm.city,
      residence_country: editForm.residence_country,
      social_handle: editForm.social_handle,
      height: parseInt(editForm.height) || null
    }).eq('id', userId)

    if (!error) {
      setProfile({ ...profile, ...editForm, height: parseInt(editForm.height) })
      setIsEditing(false)
    }
  }

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
        
        <h1 className="text-3xl font-black mb-10 tracking-tight text-center sm:text-left">OneMorePill</h1>

        <div className="flex justify-center gap-12 border-b border-gray-100 mb-8">
          <button onClick={() => setActiveTab('lists')} className={`pb-4 text-base font-bold transition-all ${activeTab === 'lists' ? 'border-b-2 border-black text-black' : 'text-gray-300'}`}>Lists</button>
          <button onClick={() => setActiveTab('profile')} className={`pb-4 text-base font-bold transition-all ${activeTab === 'profile' ? 'border-b-2 border-black text-black' : 'text-gray-300'}`}>My Profile</button>
        </div>

        {activeTab === 'lists' ? (
          <div className="space-y-12 animate-in fade-in duration-500">
            <section>
              <h2 className="text-xl font-bold mb-1">Database</h2>
              <p className="text-sm text-gray-500 mb-6">Nationalities i've been with</p>
              <div className="flex flex-wrap gap-3">
                {beenWith.map(code => (
                  <div key={code} className="flex items-center gap-2 border border-gray-200 rounded-full pl-3 pr-5 py-2.5 font-bold shadow-sm animate-in zoom-in-50 duration-300">
                    <ReactCountryFlag svg countryCode={code} style={{fontSize: '1.2em'}} />
                    <span>{countryName(code)}</span>
                  </div>
                ))}
                <div className="border border-dashed border-gray-300 rounded-full px-5 py-2.5 text-gray-400 font-bold">
                   <NationalityPicker placeholder="add one more" onSelect={(c) => addBeenWith(c.cca2)} />
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-1">Radar</h2>
              <p className="text-sm text-gray-500 mb-6">Nationalities i'd like to date</p>
              <div className="flex flex-wrap gap-3">
                {wishlist.map(code => (
                  <div key={code} className="flex items-center gap-2 border border-dashed border-gray-300 rounded-full pl-3 pr-5 py-2.5 font-bold text-gray-700 bg-gray-50/30">
                    <ReactCountryFlag svg countryCode={code} style={{fontSize: '1.2em'}} />
                    <span>{countryName(code)}</span>
                  </div>
                ))}
                <div className="border border-dashed border-gray-300 rounded-full px-5 py-2.5 text-gray-400 font-bold">
                   <NationalityPicker placeholder="add one more" onSelect={(c) => addWishlist(c.cca2)} />
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-500">
            {isEditing ? (
              <div className="space-y-4 border border-gray-200 rounded-[2rem] p-6 animate-in slide-in-from-top-4">
                <input placeholder="City" className="w-full border-b border-gray-200 py-2 font-bold outline-none focus:border-black" value={editForm.city} onChange={e => setEditForm({...editForm, city: e.target.value})} />
                <div className="flex items-center gap-2 py-2 border-b border-gray-200 font-bold">
                    <NationalityPicker placeholder="Select residence" onSelect={(c) => setEditForm({...editForm, residence_country: c.cca2})} />
                    {editForm.residence_country && <ReactCountryFlag svg countryCode={editForm.residence_country} />}
                </div>
                <input placeholder="Height (cm)" type="number" className="w-full border-b border-gray-200 py-2 font-bold outline-none focus:border-black" value={editForm.height} onChange={e => setEditForm({...editForm, height: e.target.value})} />
                <input placeholder="Instagram @handle" className="w-full border-b border-gray-200 py-2 font-bold outline-none focus:border-black" value={editForm.social_handle} onChange={e => setEditForm({...editForm, social_handle: e.target.value})} />
                <div className="flex gap-4 pt-2">
                    <button onClick={handleUpdate} className="flex-1 bg-black text-white py-3 rounded-xl font-bold">Save</button>
                    <button onClick={() => setIsEditing(false)} className="flex-1 bg-gray-100 text-black py-3 rounded-xl font-bold">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="border border-gray-200 rounded-[2rem] p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold">{profile.username}</h3>
                    <div className="flex gap-1">
                      <ReactCountryFlag svg countryCode={profile.nationality_1} />
                      {profile.nationality_2 && <ReactCountryFlag svg countryCode={profile.nationality_2} />}
                    </div>
                  </div>
                  <p className="font-bold text-gray-700 flex items-center gap-2 italic text-sm">
                    📍 {profile.city || 'Set City'}, {countryName(profile.residence_country || 'IT')}
                  </p>
                </div>

                <div className="grid grid-cols-3 border border-gray-200 rounded-2xl overflow-hidden divide-x divide-gray-200">
                  <div className="py-4 text-center font-bold text-sm">{profile.gender}</div>
                  <div className="py-4 text-center font-bold text-[10px] uppercase tracking-tighter flex items-center justify-center">{profile.orientation}</div>
                  <div className="py-4 text-center font-bold text-sm">{profile.height || '—'} cm</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[1, 2].map((slot) => (
                    <div key={slot} className="relative aspect-[2/3] bg-gray-100 rounded-[2rem] overflow-hidden border border-gray-100 group">
                      {(slot === 1 ? profile.avatar_url : profile.avatar_url_2) && (
                        <img src={slot === 1 ? profile.avatar_url : profile.avatar_url_2} className="w-full h-full object-cover" />
                      )}
                      <label className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <span className="bg-white text-black text-[10px] font-black px-4 py-2 rounded-full shadow-lg">UPLOAD</span>
                        <input type="file" className="hidden" onChange={(e) => uploadPhoto(e, slot as 1 | 2)} />
                      </label>
                    </div>
                  ))}
                </div>

                <div className="border border-gray-200 rounded-2xl p-4 flex items-center gap-4">
                  <span className="text-xl">📸</span>
                  <span className="font-bold flex-1">{profile.social_handle || '@instagram'}</span>
                </div>

                <div className="space-y-3 pt-4">
                    <button onClick={() => setIsEditing(true)} className="w-full py-4 border border-gray-200 rounded-2xl font-bold hover:border-black transition-all">Edit profile</button>
                    
                    <button onClick={async () => { await supabase.auth.signOut(); router.push('/'); }} className="w-full py-4 text-gray-400 font-bold text-sm uppercase tracking-widest hover:text-black transition-colors">Logout</button>
                    
                    {/* DANGER ZONE: ELIMINA ACCOUNT */}
                    <div className="pt-8 mt-4 border-t border-gray-100">
                        <p className="text-[9px] font-black text-center text-red-300 uppercase tracking-widest mb-4">Danger Zone</p>
                        <button 
                            onClick={handleDeleteAccount}
                            className="w-full py-4 border border-red-100 text-red-400 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-red-50 transition-all"
                        >
                            Delete Account Forever
                        </button>
                    </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  )
}