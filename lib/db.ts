import mysql from 'mysql2/promise'

// Configuração do banco de dados MySQL
// IMPORTANTE: Altere essas credenciais para as do seu banco de dados
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'forum_academico',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

// Pool de conexões para melhor performance
const pool = mysql.createPool(dbConfig)

// Função helper para executar queries
export async function query<T = unknown>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const [rows] = await pool.execute(sql, params)
  return rows as T[]
}

// Função helper para executar queries que retornam um único resultado
export async function queryOne<T = unknown>(
  sql: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(sql, params)
  return rows[0] || null
}

// Função helper para inserir e retornar o ID
export async function insert(
  sql: string,
  params?: unknown[]
): Promise<number> {
  const [result] = await pool.execute(sql, params) as [mysql.ResultSetHeader, unknown]
  return result.insertId
}

// Função helper para update/delete e retornar linhas afetadas
export async function execute(
  sql: string,
  params?: unknown[]
): Promise<number> {
  const [result] = await pool.execute(sql, params) as [mysql.ResultSetHeader, unknown]
  return result.affectedRows
}

// Exportar pool para casos especiais
export { pool }

// Tipos do banco de dados
export type UserRole = 'ADMIN' | 'MODERATOR' | 'STUDENT'
export type AttachmentType = 'PDF' | 'VIDEO' | 'IMAGE' | 'DOCUMENT' | 'OTHER'

export interface User {
  id: number
  name: string
  email: string
  password: string
  role: UserRole
  course_id: number | null
  created_at: Date
  updated_at: Date
}

export interface Course {
  id: number
  name: string
  description: string | null
  code: string
  created_at: Date
  updated_at: Date
}

export interface Subject {
  id: number
  name: string
  description: string | null
  semester: number
  created_at: Date
  updated_at: Date
}

export interface CourseSubject {
  course_id: number
  subject_id: number
}

export interface Topic {
  id: number
  title: string
  description: string | null
  subject_id: number
  author_id: number
  created_at: Date
  updated_at: Date
}

export interface Subtopic {
  id: number
  title: string
  content: string | null
  topic_id: number
  author_id: number
  created_at: Date
  updated_at: Date
}

export interface Attachment {
  id: number
  name: string
  url: string
  type: AttachmentType
  size: number
  subtopic_id: number
  uploaded_by_id: number
  created_at: Date
}
