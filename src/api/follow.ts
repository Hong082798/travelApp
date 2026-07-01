import request from "./index";
import type { PageResult } from "./types";
import type { TravelNoteVO } from "./note";

export interface FollowUserVO {
  userId: number
  nickname: string
  avatar: string | null
  createTime: string
}

// 关注用户
export const followUser = ( id: number ) => {
  return request.post<any, null>( `/follows/${ id }` )
}

// 取消关注
export const unfollowUser = ( id: number ) => {
  return request.delete<any, null>( `/follows/${ id }` )
}

// 检查是否已关注
export const checkFollow = ( id: number ) => {
  return request.get<any, boolean>( `/follows/check/${ id }` )
}

// 关注的粉丝数量
export interface FollowCount {
  followingCount: number  // 他关注了多少人
  followCount: number  // 多少人关注了他
}

export const getFollowCount = ( userId: number ) => {
  return request.get<any, FollowCount>( `/follows/count/${ userId }` )
}

export const getFollowing = async () => {
  return request.get<any, FollowUserVO[]>( '/follows/following' )
}

// 我的粉丝列表
export const getFollowers = () => {
  return request.get<any, FollowUserVO[]>( '/follows/followers' )
}

// 关注Feed流
export const getFollowingFeed = ( pageNum: number, pageSize: number ) => {
  return request.get<any, PageResult<TravelNoteVO>>( `/follows/feed?pageNum=${ pageNum }&pageSize=${ pageSize }` )
}


