import { NextRequest, NextResponse } from 'next/server'
import { query, insert, execute, Subject } from '@/lib/db'
import { getSession, isAdmin } from '@/lib/auth'
import { z } from 'zod'

const createSubjectSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  courseIds: z.array(z.string()).min(1, 'Selecione pelo menos um curso'),
  semester: z.number().min(1).max(12),
})

interface SubjectWithDetails extends Subject {
  topics_count: number
  courses_count: number
  course_names: string
}

export async function GET() {
  try {
    const session = await getSession()

    if (!session || !isAdmin(session.role)) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const subjects = await query<SubjectWithDetails>(`
      SELECT 
        s.id, 
        s.name, 
        s.description, 
        s.semester,
        (SELECT COUNT(*) FROM topics t WHERE t.subject_id = s.id) as topics_count,
        (SELECT COUNT(*) FROM course_subjects cs WHERE cs.subject_id = s.id) as courses_count,
        (SELECT GROUP_CONCAT(c.name SEPARATOR ', ') FROM courses c INNER JOIN course_subjects cs ON c.id = cs.course_id WHERE cs.subject_id = s.id) as course_names
      FROM subjects s
      ORDER BY s.semester ASC, s.name ASC
    `)

    return NextResponse.json({
      subjects: subjects.map(s => ({
        id: s.id,
        name: s.name,
        description: s.description,
        semester: s.semester,
        courseNames: s.course_names,
        isShared: s.courses_count > 1,
        _count: { topics: s.topics_count },
      }))
    })
  } catch (error) {
    console.error('Error fetching subjects:', error)
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
    const validation = createSubjectSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, description, courseIds, semester } = validation.data

    // Create subject
    const subjectId = await insert(
      'INSERT INTO subjects (name, description, semester) VALUES (?, ?, ?)',
      [name, description || null, semester]
    )

    // Link to courses
    for (const courseId of courseIds) {
      await execute(
        'INSERT INTO course_subjects (course_id, subject_id) VALUES (?, ?)',
        [courseId, subjectId]
      )
    }

    return NextResponse.json({
      subject: {
        id: subjectId,
        name,
        description: description || null,
        semester,
        isShared: courseIds.length > 1,
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating subject:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
