import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { query, User, UserRole } from './db'
import bcrypt from 'bcryptjs'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'forum-academico-secret-key-change-in-production'
)

export interface UserPayload {
  id: string
  email: string
  name: string
  role: UserRole
  courseId: string | null
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createToken(user: UserPayload): Promise<string> {
  return new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    courseId: user.courseId,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as UserPayload
  } catch {
    return null
  }
}

export async function getSession(): Promise<UserPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value
  
  if (!token) return null
  
  return verifyToken(token)
}

export async function setSession(user: UserPayload): Promise<void> {
  const token = await createToken(user)
  const cookieStore = await cookies()
  
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('auth-token')
}

interface UserWithCourse extends User {
  course_name: string | null
  course_code: string | null
}

export async function getUserById(id: string) {
  const users = await query<UserWithCourse>(`
    SELECT 
      u.id, 
      u.name, 
      u.email, 
      u.role, 
      u.course_id,
      c.name as course_name,
      c.code as course_code
    FROM users u
    LEFT JOIN courses c ON u.course_id = c.id
    WHERE u.id = ?
  `, [id])

  const user = users[0]
  if (!user) return null

  return {
    id: user.id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    courseId: user.course_id?.toString() || null,
    course: user.course_id ? {
      id: user.course_id.toString(),
      name: user.course_name,
      code: user.course_code,
    } : null,
  }
}

export function canCreateContent(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'MODERATOR'
}

export function isAdmin(role: UserRole): boolean {
  return role === 'ADMIN'
}
