'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth, canCreateContent } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { BookOpen, FolderOpen, FileText, Users, ArrowRight, Brain, Code } from 'lucide-react'

interface DashboardStats {
  courses: number
  subjects: number
  topics: number
  users: number
}

interface Course {
  id: string
  name: string
  code: string
  description: string | null
  _count: {
    subjects: number
  }
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, coursesRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/courses/details'),
        ])
        
        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
        }
        
        if (coursesRes.ok) {
          const coursesData = await coursesRes.json()
          setCourses(coursesData.courses || [])
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner className="size-8" />
      </div>
    )
  }

  const courseIcons: Record<string, React.ReactNode> = {
    'IA': <Brain className="size-6" />,
    'CC': <Code className="size-6" />,
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Bem-vindo, {user?.name || 'Estudante'}
        </h1>
        <p className="text-muted-foreground mt-1">
          Acesse o conteúdo das matérias e acompanhe seu progresso
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.courses || 0}</p>
                <p className="text-sm text-muted-foreground">Cursos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-accent/20">
                <FolderOpen className="size-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.subjects || 0}</p>
                <p className="text-sm text-muted-foreground">Matérias</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-chart-2/20">
                <FileText className="size-5 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.topics || 0}</p>
                <p className="text-sm text-muted-foreground">Tópicos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-chart-3/20">
                <Users className="size-5 text-chart-3" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.users || 0}</p>
                <p className="text-sm text-muted-foreground">Usuários</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-foreground">Cursos Disponíveis</h2>
          {user && canCreateContent(user.role) && (
            <Button asChild variant="outline">
              <Link href="/manage">Gerenciar conteúdo</Link>
            </Button>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    {courseIcons[course.code] || <BookOpen className="size-6" />}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl">{course.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {course.description || 'Sem descrição disponível'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {course._count.subjects} matérias disponíveis
                  </span>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/courses/${course.id}`}>
                      Acessar
                      <ArrowRight className="size-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {courses.length === 0 && (
            <Card className="md:col-span-2">
              <CardContent className="py-12 text-center">
                <BookOpen className="size-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum curso disponível ainda.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  )
}
