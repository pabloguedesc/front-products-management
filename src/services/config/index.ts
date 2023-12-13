import axios from 'axios'

const http = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    Accept: 'application/json',
    Content: 'application/json'
  }
})

export { http }
