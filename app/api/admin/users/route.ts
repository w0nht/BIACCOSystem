import { NextResponse } from 'next/server'
import { query, User } from '@/lib/db'
import { getSession, isAdmin } from '@/lib/auth'

interface UserWithCourse extends User {
  course_name: string | null
}

export async function GET() {
  try {
    const session = await getSession()

    if (!session || !isAdmin(session.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const users = await query<UserWithCourse>(`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.role, 
        u.created_at,
        c.name as course_name
      FROM users u
      LEFT JOIN courses c ON u.course_id = c.id
      ORDER BY u.created_at DESC
    `)

    return NextResponse.json({
      users: users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.created_at,
        course: u.course_name ? { name: u.course_name } : null,
      }))
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
