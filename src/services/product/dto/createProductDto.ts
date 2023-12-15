export interface ICreateProductDto {
  name: string
  description: string
  price: number
  expiry_date: string
  image: string | File
  category_id: string
}

export interface IUpdateProductDto extends ICreateProductDto {}

export interface ICreateProductResponse extends ICreateProductDto {
  id: string
  updatedAt: Date
  createdAt: Date
}
