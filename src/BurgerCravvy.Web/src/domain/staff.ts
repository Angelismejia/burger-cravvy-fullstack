export interface StaffSession {
  token: string
  expiresAtUtc: string
  fullName: string
  role: string
}

export const isExpired = (s: StaffSession) => new Date(s.expiresAtUtc).getTime() <= Date.now()
