import http from './http'

const createInform = (data) => {
  const path = '/inform/'

  return http.post(path, data)
}

const requestInform = (page = 1) => {
  const path = `/inform/?page=${page}`

  return http.get(path)
}

const deleteInform = (id) => {
  const path = `/inform/${id}/`

  return http.delete(path)
}

const requestInformDetail = (id) => {
  const path = `/inform/${id}`

  return http.get(path)
}

export default { createInform, requestInform, deleteInform, requestInformDetail }
