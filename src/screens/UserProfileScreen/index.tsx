import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation'
import { checkFollow, followUser, unfollowUser, getFollowCount } from '../../api/follow'
import AsyncStorage from '@react-native-async-storage/async-storage'

type Props = NativeStackScreenProps<RootStackParamList, 'UserProfile'>

export default function UserProfileScreen( { route, navigation }: Props ) {

  const { userId, nickname } = route.params
  const [ followed, setFollowed ] = useState<boolean>( false )
  const [ followLoading, setFollowLoading ] = useState<boolean>( true )
  const [ count, setCount ] = useState( { followingCount: 0, followCount: 0 } )
  const [ isSelf, setIsSelf ] = useState<boolean>( false )

  useEffect( () => {
    // @ts-ignore
    navigation.setOptions( { title: nickname } )

    // 判断是不是自己
    const checkSelf = async () => {
      const myId = await AsyncStorage.getItem( 'userId' )
      if ( myId && parseInt( myId ) === userId ) {
        setIsSelf( true )
        setFollowLoading( false ) // 如果是自己，不需要check
      }
      else {
        fetchFollowStatus()
      }
    }
    // 拿到关注的状态
    const fetchFollowStatus = async () => {
      try {
        const res = await checkFollow( userId )
        setFollowed( res )
      }
      catch {
        setFollowed( false )
      }
      finally {
        setFollowLoading( false )
      }
    }

    //拿到关注数量
    const fetchCount = async () => {
      try {
        const res = await getFollowCount( userId )
        setCount( res )
      }
      catch {
        // 计算失败静默，保持0秒

      }
    }

    checkSelf()
    fetchCount()

  }, [ userId ] );

  const handleFollow = async () => {
    if ( followLoading ) return
    setFollowLoading( true )

    const oldFollowed = followed
    const oldFollowCount = count.followCount

    // 乐观更新
    setFollowed( !oldFollowed )
    setCount( {
      ...count,
      followCount: oldFollowed ? count.followCount - 1 : count.followCount + 1
    } )

    try {
      if ( oldFollowed ) {
        await unfollowUser( userId )
      }
      else {
        await followUser( userId )
      }
    }
    catch ( error: any ) {
      // 回滚乐观更新
      setFollowed( oldFollowed )
      setCount( {
        ...count,
        followCount: oldFollowCount
      } )
      Alert.alert( '操作失败', error.message ?? '请检查网络连接或稍后再试' )
    }
    finally {
      setFollowLoading( false )
    }
  }

  return (
      <View style = { styles.container }>
        {/* 头部：头像 + 昵称 */ }
        <View style = { styles.header }>
          <View style = { styles.avatar }>
            <Text style = { styles.avatarText }>{ nickname?.charAt( 0 ) ?? '?' }</Text>
          </View>
          <Text style = { styles.nickname }>{ nickname }</Text>

          {/* 关注/粉丝数 */ }
          <View style = { styles.countRow }>
            <View style = { styles.countItem }>
              <Text style = { styles.countNum }>{ count.followingCount }</Text>
              <Text style = { styles.countLabel }>关注</Text>
            </View>
            <View style = { styles.countItem }>
              <Text style = { styles.countNum }>{ count.followCount }</Text>
              <Text style = { styles.countLabel }>粉丝</Text>
            </View>
          </View>

          {/* R7：不是自己才显示关注按钮 */ }
          { !isSelf && (
              <TouchableOpacity
                  style = { [ styles.followBtn, followed && styles.followedBtn ] }
                  onPress = { handleFollow }
                  disabled = { followLoading }
              >
                <Text style = { [ styles.followBtnText, followed && styles.followedBtnText ] }>
                  { followed ? '已关注' : '+ 关注' }
                </Text>
              </TouchableOpacity>
          ) }
        </View>
      </View>
  )
}

const styles = StyleSheet.create( {
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#fff', alignItems: 'center', paddingVertical: 24 },
  avatar: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#1890ff',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '600' },
  nickname: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 16 },
  countRow: { flexDirection: 'row', marginBottom: 16 },
  countItem: { alignItems: 'center', marginHorizontal: 24 },
  countNum: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },
  countLabel: { fontSize: 13, color: '#999', marginTop: 2 },
  followBtn: {
    backgroundColor: '#1890ff', paddingHorizontal: 32, paddingVertical: 8, borderRadius: 20,
  },
  followedBtn: { backgroundColor: '#f0f0f0' },
  followBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  followedBtnText: { color: '#999' },
} )
