import { NextRequest, NextResponse } from 'next/server'
import { query, Subject } from '@/lib/db'

interface TopicWithAuthor {
  id: number
  title: string
  description: string | null
  created_at: Date
  author_name: string
  subtopics_count: number
}

interface CourseInfo {
  id: number
  name: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subjectId: string }> }
) {
  try {
    const { subjectId } = await params

    // Get subject
    const subjects = await query<Subject>(
      'SELECT id, name, description, semester FROM subjects WHERE id = ?',
      [subjectId]
    )

    const subject = subjects[0]

    if (!subject) {
      return NextResponse.json({ error: 'Matéria não encontrada' }, { status: 404 })
    }

    // Get courses this subject belongs to (for shared subjects)
    const courses = await query<CourseInfo>(`
      SELECT c.id, c.name 
      FROM courses c
      INNER JOIN course_subjects cs ON c.id = cs.course_id
      WHERE cs.subject_id = ?
    `, [subjectId])

    // Get topics
    const topics = await query<TopicWithAuthor>(`
      SELECT 
        t.id, 
        t.title, 
        t.description, 
        t.created_at,
        u.name as author_name,
        (SELECT COUNT(*) FROM subtopics st WHERE st.topic_id = t.id) as subtopics_count
      FROM topics t
      INNER JOIN users u ON t.author_id = u.id
      WHERE t.subject_id = ?
      ORDER BY t.created_at DESC
    `, [subjectId])

    return NextResponse.json({
      subject: {
        ...subject,
        courses,
        isShared: courses.length > 1,
        topics: topics.map(t => ({
          id: t.id,
          title: t.title,
          description: t.description,
          createdAt: t.created_at,
          author: { name: t.author_name },
          _count: { subtopics: t.subtopics_count }
        }))
      }
    })
  } catch (error) {
    console.error('Error fetching subject:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
