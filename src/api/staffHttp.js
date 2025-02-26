import http from './http'

const getDepartments = () => {
  const path = 'staff/departmtents/'

  return http.get(path)
}

const createStaff = (email, realname, telphone) => {
  const path = '/staff/'

  return http.post(path, { email, realname, telphone })
}

const requestStaffs = (page, size, params) => {
  const path = `/staff/`
  let urlParams = params ? params : {}
  urlParams['page'] = page
  urlParams['size'] = size
  return http.get(path, urlParams)
}

const lockStaff = (id) => {
  const path = `staff/${id}/`

  return http.put(path, { status: '3' })
}
export default { getDepartments, createStaff, requestStaffs, lockStaff }
