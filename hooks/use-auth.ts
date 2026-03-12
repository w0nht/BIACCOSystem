'use client'

import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'MODERATOR' | 'STUDENT'
  courseId: string | null
  course?: {
    id: string
    name: string
    code: string
  } | null
}

interface AuthState {
  user: User | null
  isLoading: boolean
  error: Error | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, courseId?: string) => Promise<void>
  logout: () => Promise<void>
  mutate: () => void
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

export function useAuth(): AuthState {
  const router = useRouter()
  const { data, error, isLoading, mutate } = useSWR<{ user: User | null }>(
    '/api/auth/session',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  )

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || 'Erro ao fazer login')
    }

    await mutate()
    router.push('/dashboard')
  }, [mutate, router])

  const register = useCallback(async (
    name: string,
    email: string,
    password: string,
    courseId?: string
  ) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, courseId }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || 'Erro ao criar conta')
    }

    await mutate()
    router.push('/dashboard')
  }, [mutate, router])

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    await mutate()
    router.push('/')
  }, [mutate, router])

  return {
    user: data?.user ?? null,
    isLoading,
    error: error ?? null,
    login,
    register,
    logout,
    mutate,
  }
}

export function canCreateContent(role: 'ADMIN' | 'MODERATOR' | 'STUDENT'): boolean {
  return role === 'ADMIN' || role === 'MODERATOR'
}

export function isAdmin(role: 'ADMIN' | 'MODERATOR' | 'STUDENT'): boolean {
  return role === 'ADMIN'
}
