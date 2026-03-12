import { NextRequest, NextResponse } from 'next/server'
import { query, insert, User } from '@/lib/db'
import { hashPassword, setSession } from '@/lib/auth'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  courseId: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = registerSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, email, password, courseId } = validation.data

    // Check if user exists
    const existingUsers = await query<User>(
      'SELECT id FROM users WHERE email = ?',
      [email]
    )

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'Este email já está cadastrado' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const userId = await insert(
      'INSERT INTO users (name, email, password, role, course_id) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, 'STUDENT', courseId ? parseInt(courseId) : null]
    )

    // Set session
    const userSession = {
      id: userId.toString(),
      name,
      email,
      role: 'STUDENT' as const,
      courseId: courseId || null,
    }
    await setSession(userSession)

    return NextResponse.json({ user: userSession }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Erro ao criar conta. Tente novamente.' },
      { status: 500 }
    )
  }
}
