import React from 'react'

type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export default function Input(props: InputProps) {
  return (
    <input
      {...props}
      className={`w-full border border-gray-400 rounded-lg px-4 py-2 text-sm text-black placeholder-gray-500 focus:outline-none ${props.className ?? ''}`}
    />
  )
}
