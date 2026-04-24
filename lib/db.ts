import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  port: Number(process.env.MYSQLPORT),
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: { rejectUnauthorized: false }
});

export async function query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]> {
  try {
    const [rows] = await pool.execute(sql, params || []);
    return rows as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}


export async function queryOne<T = unknown>(sql: string, params?: unknown[]): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] || null;
}

export async function insert(sql: string, params?: unknown[]): Promise<number> {
  const [result] = await pool.execute(sql, params || []) as [mysql.ResultSetHeader, unknown];
  return result.insertId;
}

export async function execute(sql: string, params?: unknown[]): Promise<number> {
  const [result] = await pool.execute(sql, params || []) as [mysql.ResultSetHeader, unknown];
  return result.affectedRows;
}

export { pool };

// Suas interfaces permanecem as mesmas...
export type UserRole = 'ADMIN' | 'MODERATOR' | 'STUDENT';
export type AttachmentType = 'PDF' | 'VIDEO' | 'IMAGE' | 'DOCUMENT' | 'OTHER';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  course_id: number | null;
  created_at: Date;
  updated_at: Date;
}
// ... (mantenha o restante das suas interfaces abaixo)

export interface Course {
  id: number;
  name: string;
  description: string | null;
  code: string;
  created_at: Date;
  updated_at: Date;
}

export interface Subject {
  id: number;
  name: string;
  description: string | null;
  semester: number;
  created_at: Date;
  updated_at: Date;
}

export interface CourseSubject {
  course_id: number;
  subject_id: number;
}

export interface Topic {
  id: number;
  title: string;
  description: string | null;
  subject_id: number;
  author_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface Subtopic {
  id: number;
  title: string;
  content: string | null;
  topic_id: number;
  author_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface Attachment {
  id: number;
  name: string;
  url: string;
  type: AttachmentType;
  size: number;
  subtopic_id: number;
  uploaded_by_id: number;
  created_at: Date;
}