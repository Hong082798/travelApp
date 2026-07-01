import React, { useState, useEffect } from 'react'
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, ScrollView } from 'react-native'
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
  const [ userInfo, setUserInfo ] = useState<{ nickname: string; id: number; avatar: string | null } | null>( null )
  const [ count, setCount ] = useState( { followingCount: 0, followCount: 0 } )
  const [ loading, setLoading ] = useState( true )

  useEffect( () => {
    const fetchData = async () => {
      try {
        // 并发拉取用户信息
        const info = await getUserInfo()
        setUserInfo( { nickname: info.nickname, id: info.id, avatar: info.avatar } )
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

  const handleComingSoon = ( feature: string ) => {
    Alert.alert( feature, '功能即将上线，敬请期待' )
  }

  if ( loading ) {
    return (
        <View style = { styles.center }>
          <ActivityIndicator size = "large" color = "#1890ff" />
        </View>
    )
  }

  return (
      <SafeAreaView style = { styles.container }>
        <ScrollView showsVerticalScrollIndicator = { false }>
          {/* 头部横幅 */ }
          <View style = { styles.banner } />

          {/* 头像 + 昵称 + 数据卡片 */ }
          <View style = { styles.headerCard }>
            <View style = { styles.avatar }>
              { userInfo?.avatar ? (
                  <Image source = { { uri: userInfo.avatar } } style = { styles.avatarImage } />
              ) : (
                  <Text style = { styles.avatarText }>
                    { userInfo?.nickname?.charAt( 0 ) ?? '?' }
                  </Text>
              ) }
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

              <View style = { styles.countDivider } />

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

          {/* 功能菜单 */ }
          <View style = { styles.section }>
            <TouchableOpacity
                style = { styles.menuItem }
                onPress = { () => userInfo && navigation.navigate( 'UserProfile', {
                  userId: userInfo.id,
                  nickname: userInfo.nickname,
                } ) }
                activeOpacity = { 0.7 }
            >
              <Text style = { styles.menuIcon }>👤</Text>
              <Text style = { styles.menuLabel }>预览我的主页</Text>
              <Text style = { styles.menuArrow }>›</Text>
            </TouchableOpacity>

            <View style = { styles.menuDivider } />

            <TouchableOpacity
                style = { styles.menuItem }
                onPress = { () => handleComingSoon( '我的收藏' ) }
                activeOpacity = { 0.7 }
            >
              <Text style = { styles.menuIcon }>⭐</Text>
              <Text style = { styles.menuLabel }>我的收藏</Text>
              <Text style = { styles.menuArrow }>›</Text>
            </TouchableOpacity>

            <View style = { styles.menuDivider } />

            <TouchableOpacity
                style = { styles.menuItem }
                onPress = { () => handleComingSoon( '设置' ) }
                activeOpacity = { 0.7 }
            >
              <Text style = { styles.menuIcon }>⚙️</Text>
              <Text style = { styles.menuLabel }>设置</Text>
              <Text style = { styles.menuArrow }>›</Text>
            </TouchableOpacity>
          </View>

          {/* 退出登录 */ }
          <View style = { styles.section }>
            <TouchableOpacity style = { styles.logoutBtn } onPress = { handleLogout } activeOpacity = { 0.7 }>
              <Text style = { styles.logoutText }>退出登录</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
  )
}
const styles = StyleSheet.create( {
  container: { flex: 1, backgroundColor: '#f5f6f8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  banner: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 140,
    backgroundColor: '#1890ff',
  },
  headerCard: {
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 56,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingTop: 44,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    position: 'absolute',
    top: -40,
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#1890ff',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 4, borderColor: '#fff',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '600' },
  nickname: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 16 },
  countRow: { flexDirection: 'row', alignItems: 'center' },
  countItem: { alignItems: 'center', paddingHorizontal: 28 },
  countDivider: { width: 1, height: 24, backgroundColor: '#eee' },
  countNum: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },
  countLabel: { fontSize: 13, color: '#999', marginTop: 2 },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a1a',
  },
  menuArrow: {
    fontSize: 20,
    color: '#ccc',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 48,
  },
  logoutBtn: { paddingVertical: 15, alignItems: 'center' },
  logoutText: { fontSize: 15, color: '#f5222d', fontWeight: '500' },
} )
