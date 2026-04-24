'use client'

import { useState, useEffect, useRef } from 'react'
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
import { Home, ArrowLeft, Save, Upload, X, FileText, Video, ImageIcon, File as FileIcon } from 'lucide-react'

interface Topic {
  id: string
  title: string
  subject: {
    id: string
    name: string
    course: {
      id: string
      name: string
    }
  }
}

interface UploadedFile {
  name: string
  size: number
  type: string
  file: File
}

const fileTypeIcons: Record<string, React.ReactNode> = {
  'application/pdf': <FileText className="size-4 text-destructive" />,
  'video': <Video className="size-4 text-chart-2" />,
  'image': <ImageIcon className="size-4 text-primary" />,
}

function getFileIcon(type: string) {
  if (type === 'application/pdf') return fileTypeIcons['application/pdf']
  if (type.startsWith('video/')) return fileTypeIcons['video']
  if (type.startsWith('image/')) return fileTypeIcons['image']
  return <FileIcon className="size-4 text-muted-foreground" />
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default function NewSubtopicPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const courseId = params.courseId as string
  const subjectId = params.subjectId as string
  const topicId = params.topicId as string

  const [topic, setTopic] = useState<Topic | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function fetchTopicData() {
      try {
        const res = await fetch(`/api/topics/${topicId}`)
        const data = await res.json()
        if (res.ok) setTopic(data.topic)
      } catch (err) {
        setTopic(null)
      } finally {
        setIsLoading(false)
      }
    }
    fetchTopicData()
  }, [topicId])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles) return

    const newFiles: UploadedFile[] = Array.from(selectedFiles).map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      file,
    }))

    setFiles((prev) => [...prev, ...newFiles])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSaving(true)

    try {
      const uploadedAttachments = []

      // 1. Upload dos arquivos (Opção B: Salvar no disco local via API)
      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file.file)

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!uploadRes.ok) throw new Error(`Erro no upload: ${file.name}`)

        const uploadData = await uploadRes.json()
        
        // Mapeamento de tipo para o banco de dados
        const attachmentType = file.type.includes('pdf') ? 'PDF' : 
                               file.type.startsWith('video/') ? 'VIDEO' :
                               file.type.startsWith('image/') ? 'IMAGE' : 'DOCUMENT'

        uploadedAttachments.push({
          name: file.name,
          url: uploadData.url, // URL pública retornada pelo servidor
          type: attachmentType,
          size: file.size,
        })
      }

      // 2. Criação do subtópico enviando o authorId (Resolve o erro 1452)
      const res = await fetch('/api/subtopics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          content, 
          topicId,
          authorId: user?.id, // Envia o ID do autor autenticado
          attachments: uploadedAttachments,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao criar subtópico no banco de dados')
      }

      router.push(`/courses/${courseId}/subjects/${subjectId}/topics/${topicId}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar a solicitação')
    } finally {
      setIsSaving(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (!topic || !user || !canCreateContent(user.role)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-16 text-center">
            <h3 className="text-xl font-semibold mb-4">Acesso não autorizado ou tópico inexistente</h3>
            <Button asChild>
              <Link href="/dashboard">Voltar ao início</Link>
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
            <BreadcrumbLink asChild>
              <Link href={`/courses/${courseId}/subjects/${subjectId}/topics/${topicId}`}>
                {topic.title}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbPage>Novo subtópico</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/courses/${courseId}/subjects/${subjectId}/topics/${topicId}`}>
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Criar Subtópico</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conteúdo da Aula</CardTitle>
          <CardDescription>
            Tópico: <span className="text-foreground font-medium">{topic.title}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Field>
                <FieldLabel htmlFor="title">Título</FieldLabel>
                <Input
                  id="title"
                  placeholder="Ex: Resumo da Aula"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="content">Texto de apoio</FieldLabel>
                <Textarea
                  id="content"
                  placeholder="Escreva aqui as explicações ou o conteúdo principal..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                />
              </Field>

              <Field>
                <FieldLabel>Materiais (Anexos)</FieldLabel>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:bg-accent/50 hover:border-primary/50 transition-all group"
                >
                  <Upload className="size-8 mx-auto text-muted-foreground mb-3 group-hover:text-primary group-hover:scale-110 transition-all" />
                  <p className="text-sm font-medium">Arraste ou clique para enviar</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, Vídeos ou Imagens</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                        <div className="flex items-center gap-3 overflow-hidden">
                          {getFileIcon(file.type)}
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeFile(index)}>
                          <X className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Field>
            </div>

            {error && (
              <div className="p-3 text-sm bg-destructive/10 border border-destructive/20 text-destructive rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full gap-2" disabled={isSaving}>
              {isSaving ? <Spinner className="size-4" /> : <Save className="size-4" />}
              {isSaving ? 'Enviando e salvando...' : 'Publicar subtópico'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}