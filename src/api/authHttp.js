import http from './http'

const login = (email, password) => {
  const path = 'auth/login'

  return http.post(path, { email, password })
}

const resetPassword = (new_password, old_password, check_new_password) => {
  const path = 'auth/resetpassword'
  return http.put(path, { new_password, old_password, check_new_password })
}

export default { login, resetPassword }
