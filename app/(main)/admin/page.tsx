'use client'

import { useEffect, useState } from 'react'
import { useAuth, isAdmin } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { Shield, Users, BookOpen, FolderOpen, Plus, Search, Share2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'

interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'MODERATOR' | 'STUDENT'
  course: { name: string } | null
  createdAt: string
}

interface Course {
  id: string
  name: string
  code: string
  description: string | null
  _count: { subjects: number; users: number }
}

interface Subject {
  id: string
  name: string
  description: string | null
  semester: number
  courseNames: string
  isShared: boolean
  _count: { topics: number }
}

export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Form states
  const [newCourseName, setNewCourseName] = useState('')
  const [newCourseCode, setNewCourseCode] = useState('')
  const [newCourseDesc, setNewCourseDesc] = useState('')
  
  const [newSubjectName, setNewSubjectName] = useState('')
  const [newSubjectDesc, setNewSubjectDesc] = useState('')
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [newSubjectSemester, setNewSubjectSemester] = useState('1')

  useEffect(() => {
    if (!user || !isAdmin(user.role)) return

    async function fetchData() {
      try {
        const [usersRes, coursesRes, subjectsRes] = await Promise.all([
          fetch('/api/admin/users'),
          fetch('/api/admin/courses'),
          fetch('/api/admin/subjects'),
        ])

        if (usersRes.ok) {
          const data = await usersRes.json()
          setUsers(data.users || [])
        }
        if (coursesRes.ok) {
          const data = await coursesRes.json()
          setCourses(data.courses || [])
        }
        if (subjectsRes.ok) {
          const data = await subjectsRes.json()
          setSubjects(data.subjects || [])
        }
      } catch (error) {
        console.error('Error fetching admin data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user])

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole as User['role'] } : u))
        )
      }
    } catch (error) {
      console.error('Error updating role:', error)
    }
  }

  const handleCreateCourse = async () => {
    try {
      const res = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newCourseName, 
          code: newCourseCode,
          description: newCourseDesc 
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setCourses((prev) => [...prev, { ...data.course, _count: { subjects: 0, users: 0 } }])
        setNewCourseName('')
        setNewCourseCode('')
        setNewCourseDesc('')
      }
    } catch (error) {
      console.error('Error creating course:', error)
    }
  }

  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourses(prev => 
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    )
  }

  const handleCreateSubject = async () => {
    if (selectedCourses.length === 0) return

    try {
      const res = await fetch('/api/admin/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newSubjectName, 
          description: newSubjectDesc,
          courseIds: selectedCourses,
          semester: parseInt(newSubjectSemester),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const courseNames = courses
          .filter(c => selectedCourses.includes(c.id))
          .map(c => c.name)
          .join(', ')
        
        setSubjects((prev) => [...prev, { 
          ...data.subject, 
          courseNames,
          _count: { topics: 0 } 
        }])
        setNewSubjectName('')
        setNewSubjectDesc('')
        setSelectedCourses([])
        setNewSubjectSemester('1')
      }
    } catch (error) {
      console.error('Error creating subject:', error)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (!user || !isAdmin(user.role)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-16 text-center">
            <Shield className="size-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Acesso restrito</h3>
            <p className="text-muted-foreground mb-4">
              Esta área é exclusiva para administradores.
            </p>
            <Button asChild>
              <Link href="/dashboard">Voltar ao dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Painel Administrativo</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie usuários, cursos e matérias da plataforma
        </p>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="size-4" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <BookOpen className="size-4" />
            Cursos
          </TabsTrigger>
          <TabsTrigger value="subjects" className="flex items-center gap-2">
            <FolderOpen className="size-4" />
            Matérias
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Gerenciar Usuários</CardTitle>
                  <CardDescription>
                    Altere permissões e gerencie contas de usuários
                  </CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar usuário..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Curso</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Cadastro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.course?.name || '-'}</TableCell>
                      <TableCell>
                        <Select
                          value={u.role}
                          onValueChange={(value) => handleUpdateRole(u.id, value)}
                          disabled={u.id === user.id}
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="STUDENT">Estudante</SelectItem>
                            <SelectItem value="MODERATOR">Moderador</SelectItem>
                            <SelectItem value="ADMIN">Administrador</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDistanceToNow(new Date(u.createdAt), { 
                          addSuffix: true,
                          locale: ptBR 
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Gerenciar Cursos</CardTitle>
                  <CardDescription>
                    Adicione e edite cursos disponíveis na plataforma
                  </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="size-4 mr-2" />
                      Novo curso
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar novo curso</DialogTitle>
                      <DialogDescription>
                        Adicione um novo curso à plataforma
                      </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                      <Field>
                        <FieldLabel>Nome do curso</FieldLabel>
                        <Input
                          placeholder="Ex: Engenharia de Software"
                          value={newCourseName}
                          onChange={(e) => setNewCourseName(e.target.value)}
                        />
                      </Field>
                      <Field>
                        <FieldLabel>Código</FieldLabel>
                        <Input
                          placeholder="Ex: ES"
                          value={newCourseCode}
                          onChange={(e) => setNewCourseCode(e.target.value)}
                        />
                      </Field>
                      <Field>
                        <FieldLabel>Descrição</FieldLabel>
                        <Textarea
                          placeholder="Descrição do curso..."
                          value={newCourseDesc}
                          onChange={(e) => setNewCourseDesc(e.target.value)}
                        />
                      </Field>
                    </FieldGroup>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancelar</Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button onClick={handleCreateCourse}>Criar curso</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Matérias</TableHead>
                    <TableHead>Alunos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.name}</TableCell>
                      <TableCell>{course.code}</TableCell>
                      <TableCell>{course._count.subjects}</TableCell>
                      <TableCell>{course._count.users}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subjects Tab */}
        <TabsContent value="subjects">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Gerenciar Matérias</CardTitle>
                  <CardDescription>
                    Adicione e organize matérias - selecione múltiplos cursos para matérias compartilhadas
                  </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="size-4 mr-2" />
                      Nova matéria
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Criar nova matéria</DialogTitle>
                      <DialogDescription>
                        Selecione um ou mais cursos para criar uma matéria compartilhada
                      </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                      <Field>
                        <FieldLabel>Cursos (selecione um ou mais)</FieldLabel>
                        <div className="space-y-2 border border-border rounded-md p-3 max-h-40 overflow-y-auto">
                          {courses.map((course) => (
                            <label 
                              key={course.id} 
                              className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded"
                            >
                              <Checkbox
                                checked={selectedCourses.includes(course.id)}
                                onCheckedChange={() => toggleCourseSelection(course.id)}
                              />
                              <span className="text-sm">{course.name}</span>
                              <span className="text-xs text-muted-foreground">({course.code})</span>
                            </label>
                          ))}
                        </div>
                        {selectedCourses.length > 1 && (
                          <div className="flex items-center gap-2 mt-2 text-sm text-primary">
                            <Share2 className="size-4" />
                            Esta matéria será compartilhada entre {selectedCourses.length} cursos
                          </div>
                        )}
                      </Field>
                      <Field>
                        <FieldLabel>Nome da matéria</FieldLabel>
                        <Input
                          placeholder="Ex: Cálculo I"
                          value={newSubjectName}
                          onChange={(e) => setNewSubjectName(e.target.value)}
                        />
                      </Field>
                      <Field>
                        <FieldLabel>Semestre</FieldLabel>
                        <Select value={newSubjectSemester} onValueChange={setNewSubjectSemester}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                              <SelectItem key={s} value={s.toString()}>
                                {s}º Semestre
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field>
                        <FieldLabel>Descrição</FieldLabel>
                        <Textarea
                          placeholder="Descrição da matéria..."
                          value={newSubjectDesc}
                          onChange={(e) => setNewSubjectDesc(e.target.value)}
                        />
                      </Field>
                    </FieldGroup>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancelar</Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button 
                          onClick={handleCreateSubject}
                          disabled={selectedCourses.length === 0}
                        >
                          Criar matéria
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Cursos</TableHead>
                    <TableHead>Semestre</TableHead>
                    <TableHead>Tópicos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {subject.name}
                          {subject.isShared && (
                            <Badge variant="secondary" className="text-xs">
                              <Share2 className="size-3 mr-1" />
                              Compartilhada
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {subject.courseNames}
                      </TableCell>
                      <TableCell>{subject.semester}º</TableCell>
                      <TableCell>{subject._count.topics}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
