export type UserResponse = {
  id: number,
  username: string,
  email: string,
  role: 'USER' | 'ADMIN',
  telefono?: string,
  activo?: boolean,
  fechaCreacion?: string
}

