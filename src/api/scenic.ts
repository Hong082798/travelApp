import request from "./index";

export interface ScenicSpot {
  id: number
  categoryId: number
  categoryName: string
  name: string
  description: string
  coverImage: string | null
  address: string
  longitude: string
  latitude: string
  ticketPrice: string
  score: string
  status: number
  createTime: string
}

export interface ScenicPageParams {
  pageNum: number
  pageSize: number
  categoryId: number
  keyword?: string
}

export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

export const getScenicPage = ( params: ScenicPageParams ) => {
  return request.post<any, PageResult<ScenicSpot>>( '/scenic-spots/page', params )
}

// 详情接口返回的类型（比列表多 updateTime，少 categoryName）
export interface ScenicDetail {
  id: number
  categoryId: number
  name: string
  description: string
  coverImage: string | null
  address: string
  longitude: number
  latitude: number
  ticketPrice: number
  score: number
  status: number
  createTime: string
  updateTime: string
}

export const getScenicDetail = ( id: number ) =>
    request.get<any, ScenicDetail>( `/scenic-spots/${ id }` )

// 收藏景点
export const favoriteScenic = ( id: number ) => {
  return request.post<any, null>( `/favorites/${ id }` )
}

// 取消收藏景点
export const unfavoriteScenic = ( id: number ) => {
  return request.delete<any, null>( `/favorites/${ id }` )
}

// 检查是否收藏（返回boolean）
export const checkFavorite = ( id: number ) => {
  return request.get<any, boolean>( `/favorites/check/${ id }` )
}

