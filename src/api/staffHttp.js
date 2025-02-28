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

const downloadStaffs = (ids) => {
  const path = `staff/download/`

  return http.dowloadFile(path, { ids: JSON.stringify(ids) })
}

const requestNoPageStaffs = () => {
  const path = 'staff/nopaginationlist/'

  return http.get(path)
}

const changeDepartment = (pk, data) => {
  const path = `departmetns/${pk}/`

  return http.put(path, data)
}

export default {
  getDepartments,
  createStaff,
  requestStaffs,
  lockStaff,
  downloadStaffs,
  requestNoPageStaffs,
  changeDepartment,
}
