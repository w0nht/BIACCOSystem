import { NextRequest, NextResponse } from 'next/server'
import { query, Topic, Subtopic, Attachment } from '@/lib/db'

interface TopicWithDetails extends Topic {
  author_name: string
  subject_name: string
  subject_id: number
}

interface SubtopicWithDetails extends Subtopic {
  author_name: string
}

interface CourseInfo {
  id: number
  name: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  try {
    const { topicId } = await params

    // Get topic with author and subject
    const topics = await query<TopicWithDetails>(`
      SELECT 
        t.id, 
        t.title, 
        t.description, 
        t.created_at,
        t.subject_id,
        u.name as author_name,
        s.name as subject_name
      FROM topics t
      INNER JOIN users u ON t.author_id = u.id
      INNER JOIN subjects s ON t.subject_id = s.id
      WHERE t.id = ?
    `, [topicId])

    const topic = topics[0]

    if (!topic) {
      return NextResponse.json({ error: 'Tópico não encontrado' }, { status: 404 })
    }

    // Get courses this subject belongs to
    const courses = await query<CourseInfo>(`
      SELECT c.id, c.name 
      FROM courses c
      INNER JOIN course_subjects cs ON c.id = cs.course_id
      WHERE cs.subject_id = ?
    `, [topic.subject_id])

    // Get subtopics
    const subtopics = await query<SubtopicWithDetails>(`
      SELECT 
        st.id, 
        st.title, 
        st.content, 
        st.created_at,
        u.name as author_name
      FROM subtopics st
      INNER JOIN users u ON st.author_id = u.id
      WHERE st.topic_id = ?
      ORDER BY st.created_at ASC
    `, [topicId])

    // Get attachments for each subtopic
    const subtopicIds = subtopics.map(s => s.id)
    let attachments: Attachment[] = []
    
    if (subtopicIds.length > 0) {
      attachments = await query<Attachment>(`
        SELECT id, name, url, type, size, subtopic_id
        FROM attachments
        WHERE subtopic_id IN (${subtopicIds.map(() => '?').join(',')})
      `, subtopicIds)
    }

    // Group attachments by subtopic
    const attachmentsBySubtopic = attachments.reduce((acc, att) => {
      if (!acc[att.subtopic_id]) acc[att.subtopic_id] = []
      acc[att.subtopic_id].push(att)
      return acc
    }, {} as Record<number, Attachment[]>)

    return NextResponse.json({
      topic: {
        id: topic.id,
        title: topic.title,
        description: topic.description,
        createdAt: topic.created_at,
        author: { name: topic.author_name },
        subject: {
          id: topic.subject_id,
          name: topic.subject_name,
          courses,
        },
        subtopics: subtopics.map(st => ({
          id: st.id,
          title: st.title,
          content: st.content,
          createdAt: st.created_at,
          author: { name: st.author_name },
          attachments: attachmentsBySubtopic[st.id] || []
        }))
      }
    })
  } catch (error) {
    console.error('Error fetching topic:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
