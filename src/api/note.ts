import request from "./index";
import type { PageResult } from "./types";

export interface TravelNoteVO {
  id: number
  userId: number
  authorNickname: string
  authorAvatar: string | null
  title: string
  content: string | null
  coverImage: string | null
  scenicId: number
  status: number
  likeCount: number
  viewCount: number | null
  liked: boolean | null
  createTime: string
}

export interface NotePageParams {
  pageNum: number
  pageSize: number
  keyword: string
  scenicId?: number
  userId?: number
}

export const getNotePage = ( params: NotePageParams ) => {
  return request.post<any, PageResult<TravelNoteVO>>( '/notes/page', params )
}

export const getNoteDetail = ( id: number ) => {
  return request.get<any, TravelNoteVO>( `/notes/${ id }` )
}

// 点赞
export const likeNote = ( id: number ) => {
  return request.post<any, null>( `/notes/${ id }/like` )
}

// 取消点赞
export const unlikeNote = ( id: number ) => {
  return request.delete<any, null>( `/notes/${ id }/like` )
}
