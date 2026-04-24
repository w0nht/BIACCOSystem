import { NextRequest, NextResponse } from 'next/server'
import { query, insert, Topic, AttachmentType } from '@/lib/db'
import { getSession, canCreateContent } from '@/lib/auth'
import { z } from 'zod'

// Validação dos anexos
const attachmentSchema = z.object({
  name: z.string(),
  url: z.string(),
  type: z.string(),
  size: z.number(),
})

// Validação do corpo da requisição (adicionado authorId)
const createSubtopicSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  content: z.string().optional(),
  topicId: z.string().min(1, 'Tópico é obrigatório'),
  authorId: z.union([z.string(), z.number()]).optional(), // Recebe do frontend
  attachments: z.array(attachmentSchema).optional(),
})

function getAttachmentType(mimeType: string): AttachmentType {
  if (mimeType === 'PDF' || mimeType === 'application/pdf') return 'PDF'
  if (mimeType.startsWith('video/') || mimeType === 'VIDEO') return 'VIDEO'
  if (mimeType.startsWith('image/') || mimeType === 'IMAGE') return 'IMAGE'
  if (mimeType.includes('document') || mimeType === 'DOCUMENT') return 'DOCUMENT'
  return 'OTHER'
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    // Verificação de segurança: precisa de sessão ativa
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

    const { title, content, topicId, authorId, attachments } = validation.data

    // 1. Garantir que IDs sejam números para evitar erro de tipo no SQL
    const numericTopicId = parseInt(topicId as string, 10)
    const finalAuthorId = authorId ? parseInt(authorId.toString(), 10) : session.id

    // 2. Verificar se o tópico pai existe
    const topics = await query<Topic>(
      'SELECT id FROM topics WHERE id = ?',
      [numericTopicId]
    )

    if (topics.length === 0) {
      return NextResponse.json({ error: 'Tópico não encontrado' }, { status: 404 })
    }

    // 3. Criar o subtópico (author_id é obrigatório para evitar 1452)
    const subtopicId = await insert(
      'INSERT INTO subtopics (title, content, topic_id, author_id) VALUES (?, ?, ?, ?)',
      [title, content || null, numericTopicId, finalAuthorId]
    )

    // 4. Criar os anexos vinculados ao subtopicId recém-criado
    const createdAttachments = []
    if (attachments && attachments.length > 0) {
      for (const att of attachments) {
        const attachmentId = await insert(
          'INSERT INTO attachments (name, url, type, size, subtopic_id, uploaded_by_id) VALUES (?, ?, ?, ?, ?, ?)',
          [att.name, att.url, getAttachmentType(att.type), att.size, subtopicId, finalAuthorId]
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
      success: true,
      subtopic: {
        id: subtopicId,
        title,
        content: content || null,
        attachments: createdAttachments,
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar subtópico:', error)
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 })
  }
}