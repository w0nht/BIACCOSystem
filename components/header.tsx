'use client'

import Link from 'next/link'
import { useAuth, canCreateContent, isAdmin } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Brain, LogOut, User, Settings, ChevronDown, BookOpen, Shield } from 'lucide-react'

export function Header() {
  const { user, logout } = useAuth()

  const roleLabel = {
    ADMIN: 'Administrador',
    MODERATOR: 'Moderador',
    STUDENT: 'Estudante',
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Brain className="size-8 text-primary" />
            <span className="text-xl font-bold text-foreground hidden sm:inline">BIACCOSystem 026</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/courses"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cursos
            </Link>
            {user && canCreateContent(user.role) && (
              <Link
                href="/manage"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Gerenciar
              </Link>
            )}
            {user && isAdmin(user.role) && (
              <Link
                href="/admin"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Admin
              </Link>
            )}
          </nav>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <div className="flex items-center justify-center size-8 rounded-full bg-primary/20 text-primary">
                    <User className="size-4" />
                  </div>
                  <span className="hidden sm:inline text-sm">{user.name}</span>
                  <ChevronDown className="size-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-primary mt-1">{roleLabel[user.role]}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <BookOpen className="size-4 mr-2" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                {user && isAdmin(user.role) && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer">
                      <Shield className="size-4 mr-2" />
                      Painel Admin
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <Settings className="size-4 mr-2" />
                    Configurações
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
                  <LogOut className="size-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Entrar</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Criar conta</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
