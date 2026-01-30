import React from 'react'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export default function Button(props: ButtonProps) {
  return (
    <button
      {...props}
      className={`w-full bg-red-600 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50 ${props.className ?? ''}`}
    />
  )
}
