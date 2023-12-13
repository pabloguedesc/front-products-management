import { http } from './config'

const routePrefix = 'category'

export async function listAllCategories() {
  return http.get(routePrefix)
}
