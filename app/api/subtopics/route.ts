import { NextRequest, NextResponse } from 'next/server'
import { query, insert, Topic, AttachmentType } from '@/lib/db'
import { getSession, canCreateContent } from '@/lib/auth'
import { z } from 'zod'

const attachmentSchema = z.object({
  name: z.string(),
  url: z.string(),
  type: z.string(),
  size: z.number(),
})

const createSubtopicSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  content: z.string().optional(),
  topicId: z.string().min(1, 'Tópico é obrigatório'),
  attachments: z.array(attachmentSchema).optional(),
})

function getAttachmentType(mimeType: string): AttachmentType {
  if (mimeType === 'application/pdf') return 'PDF'
  if (mimeType.startsWith('video/')) return 'VIDEO'
  if (mimeType.startsWith('image/')) return 'IMAGE'
  if (mimeType.includes('document') || mimeType.includes('word') || mimeType.includes('excel') || mimeType.includes('powerpoint')) return 'DOCUMENT'
  return 'OTHER'
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    if (!canCreateContent(session.role)) {
      return NextResponse.json(
        { error: 'Sem permissão para criar subtópicos' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validation = createSubtopicSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { title, content, topicId, attachments } = validation.data

    // Check if topic exists
    const topics = await query<Topic>(
      'SELECT id FROM topics WHERE id = ?',
      [topicId]
    )

    if (topics.length === 0) {
      return NextResponse.json({ error: 'Tópico não encontrado' }, { status: 404 })
    }

    // Create subtopic
    const subtopicId = await insert(
      'INSERT INTO subtopics (title, content, topic_id, author_id) VALUES (?, ?, ?, ?)',
      [title, content || null, topicId, session.id]
    )

    // Create attachments
    const createdAttachments = []
    if (attachments && attachments.length > 0) {
      for (const att of attachments) {
        const attachmentId = await insert(
          'INSERT INTO attachments (name, url, type, size, subtopic_id, uploaded_by_id) VALUES (?, ?, ?, ?, ?, ?)',
          [att.name, att.url, getAttachmentType(att.type), att.size, subtopicId, session.id]
        )
        createdAttachments.push({
          id: attachmentId,
          name: att.name,
          url: att.url,
          type: getAttachmentType(att.type),
          size: att.size,
        })
      }
    }

    return NextResponse.json({
      subtopic: {
        id: subtopicId,
        title,
        content: content || null,
        attachments: createdAttachments,
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating subtopic:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
