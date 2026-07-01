import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { getNotePage } from '../../api/note'
import type { TravelNoteVO } from '../../api/note'
import type { RootStackParamList } from '../../navigation'
import { getFollowingFeed } from '../../api/follow'   // ← 新增

type NoteListNavigationProp = NativeStackNavigationProp<RootStackParamList, 'NoteList'>

// 格式化时间
const formatDate = ( dateString: string ) => {
  const date = new Date( dateString )
  const year = date.getFullYear()
  const month = ( date.getMonth() + 1 ).toString().padStart( 2, '0' )
  const day = date.getDate().toString().padStart( 2, '0' )
  return `${ year }-${ month }-${ day }`
}

export default function NoteListScreen() {

  const navigation = useNavigation<NoteListNavigationProp>()
  const [ data, setData ] = useState<TravelNoteVO[]>( [] )
  const [ pageNum, setPageNum ] = useState( 1 )
  const [ hasMore, setHasMore ] = useState( true )
  const [ loading, setLoading ] = useState( false )
  const [ refreshing, setRefreshing ] = useState( false )
  const [ activeTab, setActiveTab ] = useState<'recommend' | 'following'>( 'recommend' )

  const fetchData = useCallback( async ( page: number, isRefresh = false ) => {
    if ( loading ) return
    setLoading( true )
    try {
      // @ts-ignore
      // const res = await getNotePage( { pageNum: page, pageSize: 10 } )
      const res = activeTab === 'recommend' ? await getNotePage( {
        pageNum: page,
        pageSize: 10
      } ) : await getFollowingFeed( page, 10 )
      if ( isRefresh ) {
        setData( res.records )
      }
      else {
        setData( prev => [ ...prev, ...res.records ] )
      }
      setHasMore( page < res.pages )
      setPageNum( page )
    }
    finally {
      setLoading( false )
      if ( isRefresh ) {
        setRefreshing( false )
      }
    }
  }, [ loading, activeTab ] )

  // 切换tab
  const handleTabChange = ( tab: 'recommend' | 'following' ) => {
    if ( tab === activeTab ) return // 点的是当前tab，不处理
    setActiveTab( tab )
    setData( [] ) // 清空数据
    setPageNum( 1 ) // 清空旧数据
    setHasMore( true )
  }

  useEffect( () => {
    fetchData( 1, true )
  }, [ activeTab ] )

  const handleRefresh = () => {
    setRefreshing( true )
    setHasMore( true )
    fetchData( 1, true )
  }

  const handleLoadMore = () => {
    // data 为空时不触发加载更多，避免空列表反复触发 onEndReached 造成死循环
    if ( !hasMore || loading || data.length === 0 ) return
    fetchData( pageNum + 1 )
  }

  const renderFooter = () => {
    if ( loading && data.length > 0 ) {
      return (
          <View style = { styles.footer }>
            <ActivityIndicator size = "small" color = "#1890ff" />
          </View>
      )
    }
    if ( !hasMore && data.length > 0 ) {
      return (
          <View style = { styles.footer }>
            <Text style = { styles.footerText }>没有更多了</Text>
          </View>
      )
    }
    return null
  }

  const renderItem = ( { item }: { item: TravelNoteVO } ) => (
      <TouchableOpacity
          style = { styles.card }
          onPress = { () => navigation.navigate( 'NoteDetail', { id: item.id } ) }
          activeOpacity = { 0.8 }
      >
        {/* 标题 */ }
        <Text style = { styles.title } numberOfLines = { 2 }>{ item.title }</Text>

        {/* 作者信息行 */ }
        <View style = { styles.authorRow }>
          <View style = { styles.avatar }>
            <Text style = { styles.avatarText }>
              { item.authorNickname?.charAt( 0 ) ?? '?' }
            </Text>
          </View>
          <Text style = { styles.nickname }>{ item.authorNickname }</Text>
          <Text style = { styles.date }>{ formatDate( item.createTime ) }</Text>
        </View>

        {/* 底部统计行 */ }
        <View style = { styles.statsRow }>
          <Text style = { styles.stat }>❤️ { item.likeCount }</Text>
        </View>
      </TouchableOpacity>
  )

  return (
      <SafeAreaView>

        {/* 顶部切换标签 */ }
        <View style = { styles.tabBar }>
          <TouchableOpacity
              style = { styles.tabItem }
              onPress = { () => handleTabChange( 'recommend' ) }
          >
            <Text style = { [ styles.tabText, activeTab === 'recommend' && styles.tabTextActive ] }>
              推荐
            </Text>
            { activeTab === 'recommend' && <View style = { styles.tabIndicator } /> }
          </TouchableOpacity>

          <TouchableOpacity
              style = { styles.tabItem }
              onPress = { () => handleTabChange( 'following' ) }
          >
            <Text style = { [ styles.tabText, activeTab === 'following' && styles.tabTextActive ] }>
              关注
            </Text>
            { activeTab === 'following' && <View style = { styles.tabIndicator } /> }
          </TouchableOpacity>
        </View>

        <FlatList
            data = { data }
            keyExtractor = { ( item ) => String( item.id ) }
            renderItem = { renderItem }
            contentContainerStyle = { styles.list }
            refreshControl = {
              <RefreshControl refreshing = { refreshing } onRefresh = { handleRefresh } />
            }
            onEndReached = { handleLoadMore }
            onEndReachedThreshold = { 0.2 }
            ListFooterComponent = { renderFooter }
            ListEmptyComponent = {
              !loading ? (
                  <View style = { styles.empty }>
                    <Text style = { styles.emptyText }>暂无游记</Text>
                  </View>
              ) : null
            }
        />
      </SafeAreaView>
  )
}

const styles = StyleSheet.create( {
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a1a',
    lineHeight: 24,
    marginBottom: 12,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1890ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  nickname: {
    fontSize: 13,
    color: '#555',
    flex: 1,
  },
  date: {
    fontSize: 12,
    color: '#bbb',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    fontSize: 13,
    color: '#999',
    marginRight: 16,
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#bbb',
  },
  empty: {
    paddingTop: 100,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#bbb',
  },

  container: { flex: 1, backgroundColor: '#f5f5f5' },   // ← 新增
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabText: {
    fontSize: 15,
    color: '#999',
  },
  tabTextActive: {
    color: '#1890ff',
    fontWeight: '600',
  },
  tabIndicator: {
    marginTop: 6,
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#1890ff',
  },
} )
