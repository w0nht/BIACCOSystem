import { NextRequest, NextResponse } from 'next/server'
import { query, insert, Course } from '@/lib/db'
import { getSession, isAdmin } from '@/lib/auth'
import { z } from 'zod'

const createCourseSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  code: z.string().min(1, 'Código é obrigatório'),
  description: z.string().optional(),
})

interface CourseWithCounts extends Course {
  subjects_count: number
  users_count: number
}

export async function GET() {
  try {
    const session = await getSession()

    if (!session || !isAdmin(session.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const courses = await query<CourseWithCounts>(`
      SELECT 
        c.id, 
        c.name, 
        c.code, 
        c.description,
        (SELECT COUNT(*) FROM course_subjects cs WHERE cs.course_id = c.id) as subjects_count,
        (SELECT COUNT(*) FROM users u WHERE u.course_id = c.id) as users_count
      FROM courses c
      ORDER BY c.name ASC
    `)

    return NextResponse.json({
      courses: courses.map(c => ({
        ...c,
        _count: {
          subjects: c.subjects_count,
          users: c.users_count,
        }
      }))
    })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || !isAdmin(session.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const body = await request.json()
    const validation = createCourseSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, code, description } = validation.data

    const courseId = await insert(
      'INSERT INTO courses (name, code, description) VALUES (?, ?, ?)',
      [name, code, description || null]
    )

    return NextResponse.json({
      course: { id: courseId, name, code, description: description || null }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
