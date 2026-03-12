import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

interface CountResult {
  count: number
}

export async function GET() {
  try {
    const [[coursesResult], [subjectsResult], [topicsResult], [usersResult]] = await Promise.all([
      query<CountResult>('SELECT COUNT(*) as count FROM courses'),
      query<CountResult>('SELECT COUNT(*) as count FROM subjects'),
      query<CountResult>('SELECT COUNT(*) as count FROM topics'),
      query<CountResult>('SELECT COUNT(*) as count FROM users'),
    ])

    return NextResponse.json({
      courses: coursesResult?.count || 0,
      subjects: subjectsResult?.count || 0,
      topics: topicsResult?.count || 0,
      users: usersResult?.count || 0,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({
      courses: 0,
      subjects: 0,
      topics: 0,
      users: 0,
    })
  }
}
