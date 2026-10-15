export interface StaffSession {
  token: string
  expiresAtUtc: string
  fullName: string
  role: string
}

export const isAdmin = (s: StaffSession) => s.role === 'Admin'

export const isExpired = (s: StaffSession) => new Date(s.expiresAtUtc).getTime() <= Date.now()
