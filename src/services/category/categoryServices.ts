import type { AxiosResponse } from 'axios'
import { http } from '../config'
import type { ICategory } from './dto/categoryDto'

const routePrefix = 'category'

export async function listAllCategories(): Promise<AxiosResponse<ICategory[]>> {
  return http.get(routePrefix)
}
