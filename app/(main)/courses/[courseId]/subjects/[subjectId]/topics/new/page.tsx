'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth, canCreateContent } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FieldGroup, Field, FieldLabel, FieldError } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb'
import { Home, ArrowLeft, Save } from 'lucide-react'

interface Subject {
  id: string
  name: string
  course: {
    id: string
    name: string
  }
}

export default function NewTopicPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const courseId = params.courseId as string
  const subjectId = params.subjectId as string

  const [subject, setSubject] = useState<Subject | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function getSubjectData() {
      try {
        const res = await fetch(`/api/subjects/${subjectId}`)
        const data = await res.json()
        if (res.ok) {
          setSubject(data.subject)
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err)
        setSubject(null)
      } finally {
        setIsLoading(false)
      }
    }
    getSubjectData()
  }, [subjectId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSaving(true)

    try {
      const res = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, subjectId }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao criar tópico')
      }

      router.push(`/courses/${courseId}/subjects/${subjectId}/topics/${data.topic.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar tópico')
    } finally {
      setIsSaving(false)
    }
  }

  // Loader centralizado para evitar tentativas de leitura de undefined durante o fetch
  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner className="size-8" />
      </div>
    )
  }

  // Verificação de segurança caso o curso/matéria não exista
  if (!subject) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-16 text-center">
            <h3 className="text-xl font-semibold text-foreground mb-2">Matéria não encontrada</h3>
            <Button asChild>
              <Link href={`/courses/${courseId}`}>Voltar ao curso</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user || !canCreateContent(user.role)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-16 text-center">
            <h3 className="text-xl font-semibold text-foreground mb-2">Acesso negado</h3>
            <p className="text-muted-foreground mb-4">
              Apenas moderadores e administradores podem criar tópicos.
            </p>
            <Button asChild>
              <Link href={`/courses/${courseId}/subjects/${subjectId}`}>Voltar</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
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
              {/* CORREÇÃO DO ERRO: Uso de Optional Chaining (?.) para garantir que o código não quebre */}
              <Link href={`/courses/${courseId}`}>
                {subject?.course?.name || "Curso"}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          
          <BreadcrumbSeparator />
          
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/courses/${courseId}/subjects/${subjectId}`}>
                {subject?.name || "Matéria"}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />
          
          <BreadcrumbItem>
            <BreadcrumbPage>Novo tópico</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Button variant="ghost" asChild className="mb-6">
        <Link href={`/courses/${courseId}/subjects/${subjectId}`}>
          <ArrowLeft className="size-4 mr-2" />
          Voltar
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Criar novo tópico</CardTitle>
          <CardDescription>
            Adicione um novo tópico para a matéria <strong>{subject.name}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Field>
                <FieldLabel htmlFor="title">Título do tópico</FieldLabel>
                <Input
                  id="title"
                  placeholder="Ex: Introdução a Redes Neurais"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="description">Descrição (opcional)</FieldLabel>
                <Textarea
                  id="description"
                  placeholder="Descreva brevemente o conteúdo deste tópico..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </Field>

              {error && (
                <div className="p-3 rounded bg-destructive/10 text-destructive text-sm border border-destructive/20">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full gap-2" disabled={isSaving}>
                {isSaving ? (
                  <Spinner className="size-4" />
                ) : (
                  <Save className="size-4" />
                )}
                {isSaving ? 'Criando...' : 'Criar tópico'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}