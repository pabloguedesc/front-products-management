import type { AxiosResponse } from 'axios'
import { http } from '../config'
import type { IDataToListProductDto, IPaginatedResponseDto } from './dto/listProductsDto'
import type { ICreateProductDto, ICreateProductResponse } from './dto/createProductDto'

const routePrefix = 'product'

export async function listAllProducts({
  item,
  filterValue,
  take
}: IDataToListProductDto): Promise<AxiosResponse<IPaginatedResponseDto>> {
  const params = {
    item,
    filterValue,
    take
  }

  return http.get(`${routePrefix}`, { params })
}

export async function saveNewProduct(
  payload: ICreateProductDto
): Promise<AxiosResponse<ICreateProductResponse>> {
  console.log('OI', payload)
  return http.post(routePrefix, payload)
}
