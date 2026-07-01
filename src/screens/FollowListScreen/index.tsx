import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator, Alert
} from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation'
import { getFollowing, getFollowers } from '../../api/follow'
import type { FollowUserVO } from '../../api/follow'

type Props = NativeStackScreenProps<RootStackParamList, 'FollowList'>

export default function FollowListScreen( { route, navigation }: Props ) {

  const { type, title } = route.params
  const [ list, setList ] = useState<FollowUserVO[]>( [] )
  const [ loading, setLoadign ] = useState( true )

  useEffect( () => {

    navigation.setOptions( { title: title } )

    const fetchList = async () => {
      try {
        // type决定调用哪个接口
        const res = type === 'following' ? await getFollowing() : await getFollowers()
        setList( res )
      }
      catch ( error: any ) {
        Alert.alert( '加载失败', error.message )
      }
      finally {
        setLoadign( false )
      }
    }
    fetchList()

  }, [ navigation, title, type ] );

  if ( loading ) {
    return (
        <View style = { styles.center }>
          <ActivityIndicator size = "large" color = "#1890ff" />
        </View>
    )
  }

  // 空列表好友提示
  if ( list.length === 0 ) {
    return (
        <View style = { styles.center }>
          <Text style = { styles.emptyText }>
            { type === 'following' ? '还没有关注任何人' : '还没有粉丝' }
          </Text>
        </View>
    )
  }

  const formatDate = ( dateStr: string ) => dateStr.split( 'T' )[ 0 ]

  return (
      <FlatList
          style = { styles.container }
          data = { list }
          keyExtractor = { ( item ) => String( item.userId ) }
          renderItem = { ( { item } ) => (
              // R4：点击跳转到对方的用户主页
              <TouchableOpacity
                  style = { styles.item }
                  onPress = { () => navigation.navigate( 'UserProfile', {
                    userId: item.userId,
                    nickname: item.nickname,
                  } ) }
              >
                <View style = { styles.avatar }>
                  <Text style = { styles.avatarText }>
                    { item.nickname?.charAt( 0 ) ?? '?' }
                  </Text>
                </View>
                <View style = { styles.info }>
                  <Text style = { styles.nickname }>{ item.nickname }</Text>
                  <Text style = { styles.date }>{ formatDate( item.createTime ) } 关注</Text>
                </View>
                <Text style = { styles.arrow }>›</Text>
              </TouchableOpacity>
          ) }
          ItemSeparatorComponent = { () => <View style = { styles.divider } /> }
      />
  )
}
const styles = StyleSheet.create( {
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 15, color: '#999' },
  item: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#1890ff',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  info: { flex: 1 },
  nickname: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  date: { fontSize: 12, color: '#bbb', marginTop: 2 },
  arrow: { fontSize: 20, color: '#ccc' },
  divider: { height: 1, backgroundColor: '#f0f0f0' },
} )

