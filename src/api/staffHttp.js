import http from './http'

const getDepartments = async () => {
  const path = 'staff/departmtents/'

  return http.get(path)
}

export default { getDepartments }
