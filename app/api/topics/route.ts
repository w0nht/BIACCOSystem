import { NextRequest, NextResponse } from 'next/server'
import { query, insert, Subject } from '@/lib/db'
import { getSession, canCreateContent } from '@/lib/auth'
import { z } from 'zod'

const createTopicSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  subjectId: z.string().min(1, 'Matéria é obrigatória'),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    if (!canCreateContent(session.role)) {
      return NextResponse.json(
        { error: 'Sem permissão para criar tópicos' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validation = createTopicSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { title, description, subjectId } = validation.data

    // Check if subject exists
    const subjects = await query<Subject>(
      'SELECT id FROM subjects WHERE id = ?',
      [subjectId]
    )

    if (subjects.length === 0) {
      return NextResponse.json({ error: 'Matéria não encontrada' }, { status: 404 })
    }

    const topicId = await insert(
      'INSERT INTO topics (title, description, subject_id, author_id) VALUES (?, ?, ?, ?)',
      [title, description || null, subjectId, session.id]
    )

    return NextResponse.json({
      topic: {
        id: topicId,
        title,
        description: description || null,
        createdAt: new Date(),
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating topic:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
