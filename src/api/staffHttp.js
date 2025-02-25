import http from './http'

const getDepartments = () => {
  const path = 'staff/departmtents/'

  return http.get(path)
}

const createStaff = (email, realname, telphone) => {
  const path = '/staff/'

  return http.post(path, { email, realname, telphone })
}

const requestStaffs = (page) => {
  const path = `/staff/?page=${page}`

  return http.get(path)
}

export default { getDepartments, createStaff, requestStaffs }
