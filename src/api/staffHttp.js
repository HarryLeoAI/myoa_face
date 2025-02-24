import http from './http'

const getDepartments = () => {
  const path = 'staff/departmtents/'

  return http.get(path)
}

const createStaff = (email, realname, telphone) => {
  const path = '/staff/'

  return http.post(path, { email, realname, telphone })
}

export default { getDepartments, createStaff }
