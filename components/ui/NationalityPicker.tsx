'use client'

import { useState, useRef, useEffect } from 'react'
import ReactCountryFlag from 'react-country-flag'
import countries from 'world-countries'

type Country = {
  cca2: string
  name: { common: string }
}

type Props = {
  placeholder: string
  onSelect?: (country: Country) => void
}

export default function NationalityPicker({ placeholder, onSelect }: Props) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Country | null>(null)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  const isControlled = typeof onSelect === 'function'

  // chiude cliccando fuori
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const filteredCountries = countries.filter((country) =>
    country.name.common.toLowerCase().includes(search.toLowerCase())
  )

  function handleSelect(country: Country) {
    if (!isControlled) {
      setSelected(country)
    }

    onSelect?.(country)
    setOpen(false)
    setSearch('')
  }

  return (
    <div ref={ref} className="relative">
      {/* trigger */}
      <div onClick={() => setOpen(true)} className="cursor-pointer">
        {!isControlled && selected ? (
          <span className="flex items-center gap-1.5 text-black">
            <ReactCountryFlag svg countryCode={selected.cca2} />
            {selected.name.common}
          </span>
        ) : (
          <span className="text-gray-500">{placeholder}</span>
        )}
      </div>

      {/* dropdown */}
      {open && (
        <div className="absolute left-0 z-20 mt-2 w-64 max-h-60 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow">
          {/* search */}
          <div className="p-2 border-b">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm text-black placeholder-gray-500 focus:outline-none"
            />
          </div>

          {/* list */}
          {filteredCountries.map((country) => (
            <div
              key={country.cca2}
              onClick={() => handleSelect(country as Country)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-black hover:bg-gray-100 cursor-pointer"
            >
              <ReactCountryFlag svg countryCode={country.cca2} />
              {country.name.common}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
