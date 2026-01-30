import React from 'react'

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>

export default function Select(props: SelectProps) {
  return (
    <select
      {...props}
      className={`w-full border border-gray-400 rounded-lg px-4 py-2 text-sm text-black bg-white focus:outline-none ${props.className ?? ''}`}
    >
      {props.children}
    </select>
  )
}
