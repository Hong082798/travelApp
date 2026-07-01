import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation'
import { getUserInfo } from '../../api/user'
import { getFollowCount } from '../../api/follow'
import { logout } from '../../utils/auth'

type NavProps = NativeStackNavigationProp<RootStackParamList>

export default function ProfileScreen() {

  const navigation = useNavigation<NavProps>()
  const [ userInfo, setUserInfo ] = useState<{ nickname: string; id: number } | null>( null )
  const [ count, setCount ] = useState( { followingCount: 0, followCount: 0 } )
  const [ loading, setLoading ] = useState( true )

  useEffect( () => {
    const fetchData = async () => {
      try {
        // 并发拉取用户信息
        const info = await getUserInfo()
        setUserInfo( { nickname: info.nickname, id: info.id } )
        const followCount = await getFollowCount( info.id )
        setCount( followCount )
      }
      catch ( error: any ) {
        Alert.alert( '加载失败', '请稍后重试', error.message )
      }
      finally {
        setLoading( false )
      }
    }
    fetchData()
  }, [] );

  // 退出登录
  const handleLogout = async () => {
    Alert.alert( '退出登录', '您确定要退出登录吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定', onPress: async () => {
          await AsyncStorage.removeItem( 'token' )
          await logout()
          navigation.replace( 'Login' )
        }
      }
    ] )
  }

  if ( loading ) {
    return (
        <View style = { styles.loadingContainer }>
          <ActivityIndicator size = "large" color = "#0000ff" />
        </View>
    )
  }

  return (
      <SafeAreaView style = { styles.container }>
        {/* 头部 */ }
        <View style = { styles.header }>
          <View style = { styles.avatar }>
            <Text style = { styles.avatarText }>
              { userInfo?.nickname?.charAt( 0 ) ?? '?' }
            </Text>
          </View>
          <Text style = { styles.nickname }>{ userInfo?.nickname ?? '未知用户' }</Text>
          <View style = { styles.countRow }>
            <TouchableOpacity
                style = { styles.countItem }
                onPress = { () => navigation.navigate( 'FollowList', {
                  type: 'following',
                  title: '我的关注',
                } ) }
            >
              <Text style = { styles.countNum }>{ count.followingCount }</Text>
              <Text style = { styles.countLabel }>关注</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style = { styles.countItem }
                onPress = { () => navigation.navigate( 'FollowList', {
                  type: 'followers',
                  title: '我的粉丝',
                } ) }
            >
              <Text style = { styles.countNum }>{ count.followCount }</Text>
              <Text style = { styles.countLabel }>粉丝</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 退出登录 */ }
        <View style = { styles.section }>
          <TouchableOpacity style = { styles.logoutBtn } onPress = { handleLogout }>
            <Text style = { styles.logoutText }>退出登录</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
  )
}
const styles = StyleSheet.create( {
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#fff', alignItems: 'center', paddingVertical: 32, marginBottom: 12 },
  avatar: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: '#1890ff',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '600' },
  nickname: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 16 },
  countRow: { flexDirection: 'row' },
  countItem: { alignItems: 'center', marginHorizontal: 28 },
  countNum: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },
  countLabel: { fontSize: 13, color: '#999', marginTop: 2 },
  section: { backgroundColor: '#fff', marginHorizontal: 0 },
  logoutBtn: { padding: 16, alignItems: 'center' },
  logoutText: { fontSize: 16, color: '#f5222d' },
} )
