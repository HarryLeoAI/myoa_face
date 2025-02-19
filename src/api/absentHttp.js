import http from './http'

const getAbsentTypes = () => {
  const path = 'absent/types'
  return http.get(path)
}

const getResponder = () => {
  const path = 'absent/responder'
  return http.get(path)
}

const createAbsent = (data) => {
  const path = 'absent/'
  return http.post(path, data)
}

const requestAbsents = (who = 'my', page = 1, status = false) => {
  let path = ''
  if (status) {
    path = `absent/?who=${who}&page=${page}&status=${status}`
  } else {
    path = `absent/?who=${who}&page=${page}`
  }
  return http.get(path)
}

const requestHandleAbsent = (id, data) => {
  const path = `absent/${id}/`
  return http.put(path, data)
}

export default {
  getAbsentTypes,
  getResponder,
  createAbsent,
  requestHandleAbsent,
  requestAbsents,
}
