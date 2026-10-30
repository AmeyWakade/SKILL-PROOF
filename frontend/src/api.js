async function csrf() {
  const response = await fetch('/api/v1/auth/csrf', { credentials: 'same-origin' })
  if (!response.ok) throw new Error('Could not initialize a secure session. Is the backend running?')
  return (await response.json()).token
}

export async function api(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase()
  const headers = { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers }
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) headers['X-XSRF-TOKEN'] = await csrf()
  const response = await fetch(path, { ...options, method, headers, credentials: 'same-origin' })
  if (response.status === 204) return null
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.detail || data.message || data.title || (response.status === 401 ? 'Please sign in to continue.' : 'Something went wrong. Please try again.'))
  return data
}
