import type { AxiosResponse } from 'axios'
import { http } from '../config'

export async function login(data: {
  email: string
  password: string
}): Promise<AxiosResponse<{ token: string }>> {
  return http.post('auth/login', data)
}
