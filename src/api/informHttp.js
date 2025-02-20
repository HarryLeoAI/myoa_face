import http from './http'

const createInform = (data) => {
  const path = '/inform/'

  return http.post(path, data)
}

export default { createInform }
