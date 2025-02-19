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

const getMyAbsents = (page = 1) => {
  const path = 'absent/?who=my&page=' + page
  return http.get(path)
}

const getSubAbsents = (page = 1) => {
  const path = 'absent/?who=sub&page=' + page
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
  getMyAbsents,
  getSubAbsents,
  requestHandleAbsent,
}
