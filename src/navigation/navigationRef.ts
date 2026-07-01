import { createNavigationContainerRef } from '@react-navigation/native'
import type { RootStackParamList } from './index'

// 创建一个全局导航的钩子
export const navigationRef = createNavigationContainerRef<RootStackParamList>()

// 封装一个 navigate 方法，方便在非组件中使用导航
export function resetToLogin() {
  if ( navigationRef.isReady() ) {
    navigationRef.reset(
        {
          index: 0,
          routes: [ { name: 'Login' } ]
        }
    )
  }
}
