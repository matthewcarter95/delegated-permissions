import React, { useState } from 'react'
import { AuthForm } from '../components/AuthForm'

export function Auth() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin')
  }

  return <AuthForm mode={mode} onToggleMode={toggleMode} />
}