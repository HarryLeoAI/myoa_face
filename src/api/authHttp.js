import http from './http'

const login = (email, password) => {
  const path = 'auth/login'

  return http.post(path, { email, password })
}

export default { login }
