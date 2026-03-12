import { NextRequest, NextResponse } from 'next/server'
import { query, Course, Subject } from '@/lib/db'

interface SubjectWithCount extends Subject {
  topics_count: number
  is_shared: boolean
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params

    // Get course
    const courses = await query<Course>(
      'SELECT id, name, code, description FROM courses WHERE id = ?',
      [courseId]
    )

    const course = courses[0]

    if (!course) {
      return NextResponse.json({ error: 'Curso não encontrado' }, { status: 404 })
    }

    // Get subjects for this course (including shared ones)
    const subjects = await query<SubjectWithCount>(`
      SELECT 
        s.id, 
        s.name, 
        s.description, 
        s.semester,
        (SELECT COUNT(*) FROM topics t WHERE t.subject_id = s.id) as topics_count,
        (SELECT COUNT(*) FROM course_subjects cs WHERE cs.subject_id = s.id) > 1 as is_shared
      FROM subjects s
      INNER JOIN course_subjects cs ON s.id = cs.subject_id
      WHERE cs.course_id = ?
      ORDER BY s.semester ASC, s.name ASC
    `, [courseId])

    return NextResponse.json({
      course: {
        ...course,
        subjects: subjects.map(s => ({
          ...s,
          _count: { topics: s.topics_count },
          isShared: Boolean(s.is_shared)
        }))
      }
    })
  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
