import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { resetToLogin } from '../navigation/navigationRef';

// 模块级并发锁
let isLoggingOut = false;

export async function logout(showTip = false) {
  if (isLoggingOut) return;
  isLoggingOut = true;

  await AsyncStorage.removeItem('token');

  if (showTip) {
    Alert.alert(
      '登录已失效',
      '您的登录状态已过期，请重新登录',
      [
        {
          text: '去登录',
          onPress: async () => {
            await resetToLogin();
            logout(false);
          },
        },
      ],
      { cancelable: false },
    );
  } else {
    resetToLogin();
  }
}

// 登录成功后调用，解锁
export function resetLogoutLock() {
  isLoggingOut = false;
}
