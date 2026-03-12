import { NextRequest, NextResponse } from 'next/server'
import { query, User } from '@/lib/db'
import { verifyPassword, setSession } from '@/lib/auth'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = loginSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { email, password } = validation.data

    // Find user
    const users = await query<User>(
      'SELECT id, name, email, password, role, course_id FROM users WHERE email = ?',
      [email]
    )

    const user = users[0]

    if (!user) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      )
    }

    // Set session (sem a senha)
    const userSession = {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      courseId: user.course_id?.toString() || null,
    }
    await setSession(userSession)

    return NextResponse.json({ user: userSession })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Erro ao fazer login. Tente novamente.' },
      { status: 500 }
    )
  }
}
