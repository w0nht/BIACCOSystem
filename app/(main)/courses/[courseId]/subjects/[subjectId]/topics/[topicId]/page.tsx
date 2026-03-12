'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth, canCreateContent } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb'
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { 
  Home, 
  FileText, 
  Plus, 
  Calendar, 
  User, 
  FileIcon, 
  Video, 
  ImageIcon, 
  Download,
  File
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Interfaces mantidas para consistência
interface Attachment {
  id: string
  name: string
  url: string
  type: 'PDF' | 'VIDEO' | 'IMAGE' | 'DOCUMENT' | 'OTHER'
  size: number
}

interface Subtopic {
  id: string
  title: string
  content: string | null
  createdAt: string
  author: {
    name: string
  }
  attachments: Attachment[]
}

interface Topic {
  id: string
  title: string
  description: string | null
  createdAt: string
  author: {
    name: string
  }
  subject: {
    id: string
    name: string
    course: {
      id: string
      name: string
    }
  }
  subtopics: Subtopic[]
}

const attachmentIcons: Record<string, React.ReactNode> = {
  PDF: <FileText className="size-4 text-destructive" />,
  VIDEO: <Video className="size-4 text-chart-2" />,
  IMAGE: <ImageIcon className="size-4 text-primary" />,
  DOCUMENT: <FileIcon className="size-4 text-accent" />,
  OTHER: <File className="size-4 text-muted-foreground" />,
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default function TopicDetailPage() {
  const params = useParams()
  const { user } = useAuth()
  const courseId = params.courseId as string
  const subjectId = params.subjectId as string
  const topicId = params.topicId as string

  const [topic, setTopic] = useState<Topic | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchTopic() {
      try {
        const res = await fetch(`/api/topics/${topicId}`)
        if (!res.ok) throw new Error()
        const data = await res.json()
        setTopic(data.topic)
      } catch (error) {
        setTopic(null)
      } finally {
        setIsLoading(false)
      }
    }
    fetchTopic()
  }, [topicId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (!topic) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="size-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Tópico não encontrado</h3>
            <Button asChild>
              <Link href={`/courses/${courseId}/subjects/${subjectId}`}>Voltar à matéria</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard"><Home className="size-4" /></Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          
          <BreadcrumbSeparator />
          
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/courses">Cursos</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />
          
          {/* CORREÇÃO: Proteção contra leitura de 'name' em objeto nulo */}
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/courses/${courseId}`}>
                {topic.subject?.course?.name || "Curso"}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          
          <BreadcrumbSeparator />
          
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/courses/${courseId}/subjects/${subjectId}`}>
                {topic.subject?.name || "Matéria"}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          
          <BreadcrumbSeparator />
          
          <BreadcrumbItem>
            <BreadcrumbPage>{topic.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{topic.title}</h1>
          {topic.description && (
            <p className="text-muted-foreground mt-2 max-w-3xl">{topic.description}</p>
          )}
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded-md">
              <User className="size-3.5" />
              {topic.author.name}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              {formatDistanceToNow(new Date(topic.createdAt), { 
                addSuffix: true,
                locale: ptBR 
              })}
            </span>
          </div>
        </div>
        
        {user && canCreateContent(user.role) && (
          <Button asChild className="shrink-0">
            <Link href={`/courses/${courseId}/subjects/${subjectId}/topics/${topicId}/subtopics/new`}>
              <Plus className="size-4 mr-2" />
              Novo subtópico
            </Link>
          </Button>
        )}
      </div>

      {!topic.subtopics || topic.subtopics.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <FileText className="size-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Nenhum conteúdo disponível</h3>
            <p className="text-muted-foreground mb-6">
              {user && canCreateContent(user.role) 
                ? 'Este tópico ainda não possui subtópicos. Adicione conteúdos ou arquivos abaixo.'
                : 'Os conteúdos estão sendo preparados e serão publicados em breve.'}
            </p>
            {user && canCreateContent(user.role) && (
              <Button asChild variant="outline">
                <Link href={`/courses/${courseId}/subjects/${subjectId}/topics/${topicId}/subtopics/new`}>
                  <Plus className="size-4 mr-2" />
                  Criar primeiro subtópico
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Accordion type="multiple" className="space-y-4" defaultValue={[topic.subtopics[0]?.id]}>
          {topic.subtopics.map((subtopic) => (
            <AccordionItem key={subtopic.id} value={subtopic.id} className="border rounded-xl px-4 bg-card/50 transition-all data-[state=open]:bg-card data-[state=open]:shadow-sm">
              <AccordionTrigger className="hover:no-underline py-5">
                <div className="flex items-start gap-4 text-left">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary mt-0.5 transition-colors group-data-[state=open]:bg-primary group-data-[state=open]:text-white">
                    <FileText className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground leading-none mb-2">{subtopic.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
                      <span>{subtopic.author.name}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(subtopic.createdAt), { 
                        addSuffix: true,
                        locale: ptBR 
                      })}</span>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-6 border-t border-border/50 mt-2">
                <div className="sm:pl-14">
                  {subtopic.content && (
                    <div className="prose prose-slate dark:prose-invert max-w-none mb-8">
                      <p className="text-foreground leading-relaxed whitespace-pre-wrap">{subtopic.content}</p>
                    </div>
                  )}
                  
                  {subtopic.attachments && subtopic.attachments.length > 0 && (
                    <div className="bg-accent/5 rounded-xl p-4 border border-border/50">
                      <h4 className="text-sm font-bold text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Download className="size-4" />
                        Materiais de Apoio
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {subtopic.attachments.map((attachment) => (
                          <a
                            key={attachment.id}
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 rounded-lg border border-border bg-background hover:border-primary/50 hover:ring-1 hover:ring-primary/50 transition-all group"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="shrink-0">{attachmentIcons[attachment.type]}</div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">{attachment.name}</p>
                                <p className="text-[10px] text-muted-foreground font-mono">{formatFileSize(attachment.size)}</p>
                              </div>
                            </div>
                            <Download className="size-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 ml-2" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  )
}