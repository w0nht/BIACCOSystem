import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

interface CourseWithCount {
  id: number
  name: string
  code: string
  description: string | null
  subjects_count: number
}

export async function GET() {
  try {
    const courses = await query<CourseWithCount>(`
      SELECT 
        c.id, 
        c.name, 
        c.code, 
        c.description,
        (SELECT COUNT(*) FROM course_subjects cs WHERE cs.course_id = c.id) as subjects_count
      FROM courses c
      ORDER BY c.name ASC
    `)

    return NextResponse.json({
      courses: courses.map(c => ({
        ...c,
        _count: { subjects: c.subjects_count }
      }))
    })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json({ courses: [] })
  }
}
