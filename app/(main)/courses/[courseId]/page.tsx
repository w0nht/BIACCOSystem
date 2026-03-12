'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
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
import { Badge } from '@/components/ui/badge'
import { BookOpen, FolderOpen, ArrowRight, Home, Share2 } from 'lucide-react'

// Interfaces (Mantive as suas, garantindo que subjects seja opcional no início)
interface Subject {
  id: string
  name: string
  description: string | null
  semester: number
  isShared?: boolean
  _count: {
    topics: number
  }
}

interface Course {
  id: string
  name: string
  code: string
  description: string | null
  subjects: Subject[]
}

export default function CourseDetailPage() {
  const params = useParams()
  const courseId = params.courseId as string
  const [course, setCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function getCourse() {
      try {
        const res = await fetch(`/api/courses/${courseId}`)
        if (!res.ok) throw new Error('Falha ao carregar')
        const data = await res.json()
        setCourse(data.course)
      } catch (error) {
        console.error("Erro:", error)
        setCourse(null)
      } finally {
        setIsLoading(false)
      }
    }
    getCourse()
  }, [courseId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-16 text-center">
            <BookOpen className="size-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Curso não encontrado</h3>
            <p className="text-muted-foreground mb-4">
              O curso que você está procurando não existe ou foi removido.
            </p>
            <Button asChild>
              <Link href="/courses">Voltar aos cursos</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Agrupamento seguro por semestre (Adicionado fallback para array vazio)
  const subjectsBySemester = (course.subjects || []).reduce((acc, subject) => {
    const semester = subject.semester || 1 // Fallback para 1º semestre se nulo
    if (!acc[semester]) acc[semester] = []
    acc[semester].push(subject)
    return acc
  }, {} as Record<number, Subject[]>)

  const semesters = Object.keys(subjectsBySemester).map(Number).sort((a, b) => a - b)

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
          <BreadcrumbItem>
            <BreadcrumbPage>{course.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-foreground">{course.name}</h1>
          <Badge variant="outline">{course.code}</Badge>
        </div>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          {course.description || 'Selecione uma matéria para ver os tópicos disponíveis.'}
        </p>
      </div>

      {semesters.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <FolderOpen className="size-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Nenhuma matéria disponível</h3>
            <p className="text-muted-foreground">
              As matérias deste curso serão adicionadas em breve.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-10">
          {semesters.map((semester) => (
            <section key={semester}>
              <div className="flex items-center gap-4 mb-5">
                <h2 className="text-xl font-bold text-foreground">
                  {semester}º Semestre
                </h2>
                <div className="h-px flex-1 bg-border" />
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {subjectsBySemester[semester].map((subject) => (
                  <Card key={subject.id} className="group hover:border-primary/50 transition-all hover:shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                          <FolderOpen className="size-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate group-hover:text-primary transition-colors">
                            {subject.name}
                          </CardTitle>
                          {subject.isShared && (
                            <Badge variant="secondary" className="mt-1 text-[10px] uppercase tracking-wider">
                              <Share2 className="size-3 mr-1" />
                              Compartilhada
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      {subject.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                          {subject.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-xs font-medium text-muted-foreground uppercase">
                          {subject._count.topics} {subject._count.topics === 1 ? 'Tópico' : 'Tópicos'}
                        </span>
                        <Button asChild variant="ghost" size="sm" className="group-hover:translate-x-1 transition-transform">
                          <Link href={`/courses/${courseId}/subjects/${subject.id}`}>
                            Acessar
                            <ArrowRight className="size-4 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}