'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function EditProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Stati del form
  const [username, setUsername] = useState('')
  const [city, setCity] = useState('')
  const [socialHandle, setSocialHandle] = useState('')
  const [height, setHeight] = useState('')

  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/signup')
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (data) {
        setUsername(data.username || '')
        setCity(data.city || '')
        setSocialHandle(data.social_handle || '')
        setHeight(data.height?.toString() || '')
      }
      setLoading(false)
    }
    loadProfile()
  }, [router])

  const handleSave = async () => {
    setSaving(true)
    const { data: { session } } = await supabase.auth.getSession()
    
    const { error } = await supabase
      .from('profiles')
      .update({
        username,
        city,
        social_handle: socialHandle,
        height: parseInt(height) || null,
      })
      .eq('id', session?.user.id)

    if (!error) {
      router.push('/profile')
    } else {
      alert("Errore durante il salvataggio")
    }
    setSaving(false)
  }

  const handleDeleteAccount = async () => {
    const confirmDelete = confirm(
      "ATTENZIONE: Questa azione è irreversibile. Elimineremo tutti i tuoi dati, le tue liste e il tuo profilo. Vuoi procedere?"
    )

    if (confirmDelete) {
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session?.user.id

      if (!userId) return

      // Eliminiamo tutto ciò che è collegato all'utente
      await supabase.from('user_nationalities').delete().eq('user_id', userId)
      await supabase.from('user_wishlist_nationalities').delete().eq('user_id', userId)
      await supabase.from('profiles').delete().eq('id', userId)

      // Logout e reindirizzamento
      await supabase.auth.signOut()
      router.push('/signup')
    }
  }

  if (loading) return <div className="p-10 text-center font-black text-gray-200 uppercase tracking-widest text-[10px]">Loading...</div>

  return (
    <main className="min-h-screen bg-white text-black font-['DM_Sans'] pb-20">
      <div className="max-w-md mx-auto px-6 pt-10">
        
        <div className="flex items-center justify-between mb-10">
          <button onClick={() => router.back()} className="text-2xl">←</button>
          <h1 className="text-sm font-black uppercase tracking-widest">Edit Profile</h1>
          <div className="w-6" /> {/* Spacer per centrare il titolo */}
        </div>

        <div className="space-y-6">
          {/* CAMPI INPUT */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Username</label>
            <input 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold text-sm outline-none focus:border-black transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">City</label>
            <input 
              value={city} 
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold text-sm outline-none focus:border-black transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Instagram Handle</label>
            <input 
              value={socialHandle} 
              onChange={(e) => setSocialHandle(e.target.value)}
              placeholder="@username"
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold text-sm outline-none focus:border-black transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Height (cm)</label>
            <input 
              type="number"
              value={height} 
              onChange={(e) => setHeight(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 font-bold text-sm outline-none focus:border-black transition-all"
            />
          </div>

          <button 
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>

          {/* DANGER ZONE */}
          <div className="mt-20 pt-10 border-t border-gray-100">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 mb-6 text-center">Danger Zone</p>
            <button 
              onClick={handleDeleteAccount}
              className="w-full py-4 rounded-2xl border border-red-100 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-colors"
            >
              Delete Account Forever
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}