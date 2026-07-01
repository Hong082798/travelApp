import request from "./index";

export interface UserInfo {
  id: number
  username: string
  nickname: string
  avatar: string | null
  phone: number
  status: number
  createTime: string
}

export interface LoginParams {
  username: string
  password: string
}

export const login = ( params: LoginParams ) => {
  return request.post<any, UserInfo>( '/users/login', params )
}

export const getUserInfo = () => {
  return request.get<any, UserInfo>( '/users/info' )
}
