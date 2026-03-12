import { NextRequest, NextResponse } from 'next/server'
import { execute, query, User } from '@/lib/db'
import { getSession, isAdmin } from '@/lib/auth'
import { z } from 'zod'

const updateUserSchema = z.object({
  role: z.enum(['ADMIN', 'MODERATOR', 'STUDENT']),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getSession()

    if (!session || !isAdmin(session.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const { userId } = await params
    const body = await request.json()
    const validation = updateUserSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { role } = validation.data

    await execute(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, userId]
    )

    const users = await query<User>(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [userId]
    )

    return NextResponse.json({ user: users[0] })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
