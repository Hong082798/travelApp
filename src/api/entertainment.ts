import request from "./index";

export interface EntertainmentCategory {
  id: number
  name: string
  sort: number
  status: number
  createTime: string
  updateTime: string
}

export interface EntertainmentItem {
  id: number
  categoryId: number
  categoryName: string | null
  name: string
  description: string | null
  coverImage: string | null
  address: string | null
  longitude: number | string | null
  latitude: number | string | null
  price: number | string | null
  score: number | string | null
  businessHours: string | null
  phone: string | null
  tags: string | null
  status: number
  sort: number
  createTime: string
}

export interface EntertainmentPageParams {
  pageNum: number
  pageSize: number
  categoryId?: number
  keyword?: string
  status?: number
}

export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}


