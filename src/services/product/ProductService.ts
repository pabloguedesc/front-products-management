import type { AxiosResponse } from 'axios'
import { http } from '../config'
import type { IDataToListProductDto, IPaginatedResponseDto } from './dto/listProductsDto'
import type {
  ICreateProductDto,
  ICreateProductResponse,
  IUpdateProductDto
} from './dto/createProductDto'

const routePrefix = 'product'

export async function listAllProducts({
  item,
  filterValue,
  take,
  page
}: IDataToListProductDto): Promise<AxiosResponse<IPaginatedResponseDto>> {
  const params = {
    item,
    filterValue,
    take,
    page
  }

  return http.get(`${routePrefix}`, { params })
}

export async function saveNewProduct(
  payload: ICreateProductDto
): Promise<AxiosResponse<ICreateProductResponse>> {
  return http.post(routePrefix, payload)
}

export async function deleteProduct(productId: string) {
  return http.delete(`${routePrefix}/${productId}`)
}

export async function updateProduct(productId: string, payload: IUpdateProductDto) {
  return http.put(`${routePrefix}/${productId}`, payload)
}
