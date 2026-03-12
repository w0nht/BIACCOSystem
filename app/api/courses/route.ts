import { NextResponse } from 'next/server'
import { query, Course } from '@/lib/db'

export async function GET() {
  try {
    const courses = await query<Course>(
      'SELECT id, name, code, description FROM courses ORDER BY name ASC'
    )

    return NextResponse.json({ courses })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json({ courses: [] })
  }
}
