import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { logout } from "../utils/auth";

const request = axios.create( {
  baseURL: 'http://localhost:8089/api',
  timeout: 10000
} )

// 请求拦截器
request.interceptors.request.use(
    async ( config ) => {

      const token = await AsyncStorage.getItem( 'token' )
      if ( token ) {
        config.headers[ 'satoken' ] = token
      }

      return config
    }
)

// 响应拦截器
request.interceptors.response.use(
    ( response ) => {
      const res = response.data
      if ( res.code === 200 ) {
        return res.data
      }
      // 服务端返回业务层认证失败（HTTP 200 但 code 为 401）
      if ( res.code === 401 ) {
        logout()
        return Promise.reject( new Error( res.message || '登录已失效' ) )
      }
      return Promise.reject( new Error( res.message || '请求失败' ) )
    },
    ( error ) => {
      // HTTP 层 401
      if ( error.response && error.response.status === 401 ) {
        logout()
      }
      return Promise.reject( error )
    }
)
export default request
