export interface IProduct {
  id: string
  name: string
  description: string
  price: number
  expiry_date: string
  image: string | File
  imageUrl: string
  category_id: string
  created_at: Date | string
  updated_at: Date | string
  category: {
    id: string
    name: string
    created_at: Date
    updated_at: Date
  }
}
