'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Flame } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <Flame className="w-8 h-8 text-[#c9a84c] mb-3" strokeWidth={1.5} />
          <h1 className="text-xl font-semibold text-[#e8e6e3]">Highest Self</h1>
          <p className="text-sm text-[#5a5855] mt-1">Create your journal</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-3">
          <input
            type="email" placeholder="Email" required
            className="input-field"
            value={email} onChange={e => setEmail(e.target.value)}
          />
          <input
            type="password" placeholder="Password (min 6 characters)" required minLength={6}
            className="input-field"
            value={password} onChange={e => setPassword(e.target.value)}
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-[#5a5855] mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-[#c9a84c] hover:opacity-80">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
