import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Brain, BookOpen, Users, FileText, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="size-8 text-primary" />
              <span className="text-xl font-bold text-foreground">Forum Acadêmico</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Entrar</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Criar conta</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary mb-6">
            <Brain className="size-4" />
            Plataforma de estudos colaborativa
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground max-w-4xl mx-auto leading-tight text-balance">
            Compartilhe conhecimento em IA e Ciência da Computação
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mt-6 text-pretty">
            Uma plataforma para estudantes organizarem e compartilharem conteúdo das aulas,
            desde PDFs a vídeos, de forma estruturada por matérias e tópicos.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Button size="lg" asChild>
              <Link href="/register">
                Começar agora
                <ArrowRight className="size-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Já tenho conta</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 border-t border-border">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Tudo que você precisa para estudar
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-border bg-card">
              <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                <BookOpen className="size-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">Cursos Organizados</h3>
              <p className="text-muted-foreground">
                Acesse conteúdos estruturados por curso, semestre e matéria. 
                Encontre facilmente o que precisa.
              </p>
            </div>
            
            <div className="p-6 rounded-xl border border-border bg-card">
              <div className="p-3 rounded-lg bg-accent/20 w-fit mb-4">
                <FileText className="size-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">Upload de Materiais</h3>
              <p className="text-muted-foreground">
                Compartilhe PDFs, vídeos e documentos com seus colegas. 
                Tudo organizado em tópicos e subtópicos.
              </p>
            </div>
            
            <div className="p-6 rounded-xl border border-border bg-card">
              <div className="p-3 rounded-lg bg-chart-2/20 w-fit mb-4">
                <Users className="size-6 text-chart-2" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">Colaboração</h3>
              <p className="text-muted-foreground">
                Moderadores podem criar e organizar conteúdo. 
                Estudantes acessam materiais de qualidade.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Pronto para começar?
          </h2>
          <p className="text-muted-foreground mb-8">
            Crie sua conta gratuitamente e acesse todo o conteúdo disponível.
          </p>
          <Button size="lg" asChild>
            <Link href="/register">
              Criar minha conta
              <ArrowRight className="size-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Forum Acadêmico - Plataforma de estudos para IA e Ciência da Computação</p>
        </div>
      </footer>
    </div>
  )
}
