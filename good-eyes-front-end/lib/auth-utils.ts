export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Date.now() / 1000
    return payload.exp < currentTime
  } catch (error) {
    return true // If we can't parse the token, consider it expired
  }
}

export function getTokenExpirationTime(token: string): Date | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return new Date(payload.exp * 1000)
  } catch (error) {
    return null
  }
}

export function getTokenPayload(token: string): Record<string, unknown> | null {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch (error) {
    return null
  }
}

export function shouldRefreshToken(token: string): boolean {
  if (!token) return false
  
  try {
    const payload = getTokenPayload(token)
    if (!payload) return true
    
    const currentTime = Date.now() / 1000
    const timeUntilExpiry = (payload.exp as number) - currentTime
    
    // Refresh token if it expires in the next 5 minutes
    return timeUntilExpiry < 300
  } catch (error) {
    return true
  }
} 