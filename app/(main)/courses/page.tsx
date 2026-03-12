'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { BookOpen, ArrowRight, Brain, Code } from 'lucide-react'

interface Course {
  id: string
  name: string
  code: string
  description: string | null
  _count: {
    subjects: number
  }
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/courses/details')
      .then((res) => res.json())
      .then((data) => setCourses(data.courses || []))
      .catch(() => setCourses([]))
      .finally(() => setIsLoading(false))
  }, [])

  const courseIcons: Record<string, React.ReactNode> = {
    'IA': <Brain className="size-8" />,
    'CC': <Code className="size-8" />,
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner className="size-8" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Cursos</h1>
        <p className="text-muted-foreground mt-1">
          Selecione um curso para acessar as matérias disponíveis
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="p-4 rounded-xl bg-primary/10 text-primary">
                  {courseIcons[course.code] || <BookOpen className="size-8" />}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl">{course.name}</CardTitle>
                  <CardDescription className="mt-2 text-base">
                    {course.description || 'Curso com foco em tecnologia e inovação'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{course._count.subjects}</span> matérias disponíveis
                </div>
                <Button asChild>
                  <Link href={`/courses/${course.id}`}>
                    Ver matérias
                    <ArrowRight className="size-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {courses.length === 0 && (
          <Card className="md:col-span-2">
            <CardContent className="py-16 text-center">
              <BookOpen className="size-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Nenhum curso disponível</h3>
              <p className="text-muted-foreground">
                Os cursos serão adicionados em breve pelo administrador.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
