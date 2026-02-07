'use client'

import { useState } from 'react'
import countries from 'world-countries'
import ReactCountryFlag from 'react-country-flag'

interface NationalityPickerProps {
  onSelect: (country: any) => void
  placeholder?: string
  className?: string
}

export default function NationalityPicker({ onSelect, placeholder = "Add nationality", className = "" }: NationalityPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')

  // Ordiniamo i paesi per nome comune
  const sortedCountries = [...countries].sort((a, b) => 
    a.name.common.localeCompare(b.name.common)
  )

  const filteredCountries = sortedCountries.filter(c =>
    c.name.common.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Trigger: il testo cliccabile che vedi nella pillola tratteggiata */}
      <button
        onClick={(e) => {
          e.preventDefault()
          setIsOpen(!isOpen)
        }}
        className="focus:outline-none transition-all active:scale-95 cursor-pointer whitespace-nowrap"
      >
        {placeholder}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 z-50 mt-4 w-72 bg-white border border-gray-100 shadow-2xl rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-gray-50 bg-gray-50/50">
            <input
              autoFocus
              type="text"
              placeholder="Search country..."
              className="w-full px-4 py-2 text-sm bg-white border border-gray-100 rounded-xl outline-none focus:ring-2 ring-black/5 text-black font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="max-h-64 overflow-y-auto scrollbar-hide">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((c) => (
                <button
                  key={c.cca2}
                  type="button"
                  onClick={() => {
                    onSelect(c)
                    setIsOpen(false)
                    setSearch('')
                  }}
                  className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0"
                >
                  <ReactCountryFlag 
                    svg 
                    countryCode={c.cca2} 
                    style={{ fontSize: '1.4em', borderRadius: '2px' }} 
                  />
                  <span className="text-sm font-bold text-black">{c.name.common}</span>
                </button>
              ))
            ) : (
              <div className="p-5 text-center text-xs text-gray-400 font-bold uppercase tracking-widest">
                No country found
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Overlay invisibile per chiudere cliccando fuori */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-transparent" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}