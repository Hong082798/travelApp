import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { login } from '../../api/user'
import type { RootStackParamList } from '../../navigation'
import { resetLogoutLock } from '../../utils/auth'
import { getUserInfo } from '../../api/user'

type LoginNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>

export default function LoginScreen() {

  const navigation = useNavigation<LoginNavigationProp>()
  const [ username, setUsername ] = useState( '' )
  const [ password, setPassword ] = useState( '' )
  const [ loading, setLoading ] = useState( false )

  const handleLogin = async () => {
    if ( !username.trim() || !password.trim() ) {
      Alert.alert( '提示', '用户名和密码不能为空' )
      return
    }
    setLoading( true )
    try {
      const token = await login( { username, password } )
      // @ts-ignore
      await AsyncStorage.setItem( 'token', token )

      const info = await getUserInfo()
      await AsyncStorage.setItem( 'userId', String( info.id ) )

      resetLogoutLock() // 登录成功后解锁登出
      // @ts-ignore
      navigation.replace( 'MainTabs' )
    }
    catch ( error ) {
      // @ts-ignore
      Alert.alert( '登录失败', error.message || '用户名或密码错误' )
    }
    finally {
      setLoading( false )
    }
  }

  return (
      <KeyboardAvoidingView
          style = { styles.container }
          behavior = { Platform.OS === 'ios' ? 'padding' : 'height' }
      >
        <View style = { styles.card }>
          <Text style = { styles.title }>文旅平台</Text>
          <Text style = { styles.subtitle }>发现美好旅途</Text>

          <TextInput
              style = { styles.input }
              placeholder = "请输入用户名"
              placeholderTextColor = "#999"
              value = { username }
              onChangeText = { setUsername }
              autoCapitalize = "none"
          />

          <TextInput
              style = { styles.input }
              placeholder = "请输入密码"
              placeholderTextColor = "#999"
              value = { password }
              onChangeText = { setPassword }
              secureTextEntry
          />

          <TouchableOpacity
              style = { [ styles.button, loading && styles.buttonDisabled ] }
              onPress = { handleLogin }
              disabled = { loading }
          >
            { loading
                ? <ActivityIndicator color = "#fff" />
                : <Text style = { styles.buttonText }>登 录</Text>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create( {
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#1a1a1a',
    marginBottom: 16,
    backgroundColor: '#fafafa',
  },
  button: {
    height: 48,
    backgroundColor: '#1890ff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#91caff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
} )
