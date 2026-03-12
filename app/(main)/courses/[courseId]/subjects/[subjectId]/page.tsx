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
import { FileText, Plus, ArrowRight, Home, FolderOpen, Calendar, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Interfaces garantindo consistência
interface Topic {
  id: string
  title: string
  description: string | null
  createdAt: string
  author: {
    name: string
  }
  _count: {
    subtopics: number
  }
}

interface Subject {
  id: string
  name: string
  description: string | null
  semester: number
  course: {
    id: string
    name: string
  }
  topics: Topic[]
}

export default function SubjectDetailPage() {
  const params = useParams()
  const { user } = useAuth()
  const courseId = params.courseId as string
  const subjectId = params.subjectId as string
  
  const [subject, setSubject] = useState<Subject | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchSubject() {
      try {
        const res = await fetch(`/api/subjects/${subjectId}`)
        if (!res.ok) throw new Error('Falha ao carregar')
        const data = await res.json()
        setSubject(data.subject)
      } catch (error) {
        console.error("Erro ao carregar matéria:", error)
        setSubject(null)
      } finally {
        setIsLoading(false)
      }
    }
    fetchSubject()
  }, [subjectId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (!subject) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-16 text-center">
            <FolderOpen className="size-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Matéria não encontrada</h3>
            <p className="text-muted-foreground mb-4">
              A matéria que você está procurando não existe ou foi removida.
            </p>
            <Button asChild>
              <Link href={`/courses/${courseId}`}>Voltar ao curso</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* BREADCRUMB CORRIGIDO: Previni o erro usando optional chaining */}
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
          
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              {/* O erro 'reading name' acontecia aqui. Agora usamos o '?' */}
              <Link href={`/courses/${courseId}`}>
                {subject?.course?.name || "Curso"}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbPage>{subject.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{subject.name}</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            {subject.description || `Tópicos de estudo do ${subject.semester}º semestre`}
          </p>
        </div>
        {user && canCreateContent(user.role) && (
          <Button asChild className="shrink-0">
            <Link href={`/courses/${courseId}/subjects/${subjectId}/topics/new`}>
              <Plus className="size-4 mr-2" />
              Novo tópico
            </Link>
          </Button>
        )}
      </div>

      {(!subject.topics || subject.topics.length === 0) ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <FileText className="size-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Nenhum tópico ainda</h3>
            <p className="text-muted-foreground mb-4">
              {user && canCreateContent(user.role) 
                ? 'Comece agora criando o primeiro tópico para esta matéria.'
                : 'Os tópicos de estudo serão adicionados em breve pelos moderadores.'}
            </p>
            {user && canCreateContent(user.role) && (
              <Button asChild variant="outline">
                <Link href={`/courses/${courseId}/subjects/${subjectId}/topics/new`}>
                  <Plus className="size-4 mr-2" />
                  Criar tópico
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {subject.topics.map((topic) => (
            <Card key={topic.id} className="group hover:border-primary/50 transition-all hover:shadow-sm">
              <CardHeader className="pb-3 px-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary mt-1 group-hover:bg-primary group-hover:text-white transition-colors">
                      <FileText className="size-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        {topic.title}
                      </CardTitle>
                      {topic.description && (
                        <CardDescription className="mt-1 line-clamp-2">
                          {topic.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  <Button asChild variant="ghost" size="sm" className="sm:self-center">
                    <Link href={`/courses/${courseId}/subjects/${subjectId}/topics/${topic.id}`}>
                      Ver conteúdo
                      <ArrowRight className="size-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="px-6 pb-4">
                <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-muted-foreground border-t pt-3">
                  <span className="flex items-center gap-1.5">
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
                  <span className="bg-secondary/50 px-2 py-0.5 rounded-md text-xs font-medium">
                    {topic._count.subtopics} {topic._count.subtopics === 1 ? 'Subtópico' : 'Subtópicos'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}