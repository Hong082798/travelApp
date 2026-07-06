import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Dimensions,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { CompositeNavigationProp } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import { getNotePage } from '../../api/note'
import type { TravelNoteVO } from '../../api/note'
import type { RootStackParamList } from '../../navigation'
import type { MainTabParamList } from '../../navigation/MainTabs'
import { getFollowingFeed } from '../../api/follow'   // ← 新增

type NoteListNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'NoteList'>,
  NativeStackNavigationProp<RootStackParamList>
>

// 格式化时间
const formatDate = ( dateString: string ) => {
  const date = new Date( dateString )
  const year = date.getFullYear()
  const month = ( date.getMonth() + 1 ).toString().padStart( 2, '0' )
  const day = date.getDate().toString().padStart( 2, '0' )
  return `${ year }-${ month }-${ day }`
}

const GRID_GAP = 12
const CARD_WIDTH = ( Dimensions.get( 'window' ).width - GRID_GAP * 3 ) / 2

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            <ActivityIndicator size = "small" color = "#1F5C43" />
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
          activeOpacity = { 0.85 }
      >
        {/* 封面图 */ }
        <View style = { styles.imageWrap }>
          { item.coverImage ? (
              <Image source = { { uri: item.coverImage } } style = { styles.coverImage } />
          ) : (
              <View style = { [ styles.coverImage, styles.coverPlaceholder ] }>
                <Text style = { styles.placeholderEmoji }>📝</Text>
              </View>
          ) }
          <View style = { styles.likeOverlay }>
            <Text style = { styles.likeOverlayText }>❤️ { item.likeCount }</Text>
          </View>
        </View>

        {/* 标题 */ }
        <Text style = { styles.title } numberOfLines = { 2 }>{ item.title }</Text>

        {/* 作者信息行 */ }
        <View style = { styles.authorRow }>
          <View style = { styles.avatar }>
            { item.authorAvatar ? (
                <Image source = { { uri: item.authorAvatar } } style = { styles.avatarImage } />
            ) : (
                <Text style = { styles.avatarText }>
                  { item.authorNickname?.charAt( 0 ) ?? '?' }
                </Text>
            ) }
          </View>
          <Text style = { styles.nickname } numberOfLines = { 1 }>{ item.authorNickname }</Text>
          <Text style = { styles.date }>{ formatDate( item.createTime ) }</Text>
        </View>
      </TouchableOpacity>
  )

  return (
      <SafeAreaView style = { styles.container }>
        <View style = { styles.header }>
          <Text style = { styles.headerEyebrow }>TRAVEL NOTES</Text>
          <Text style = { styles.headerTitle }>旅人手记</Text>
          <Text style = { styles.headerSubtitle }>看真实路线、花费和沿途故事</Text>
        </View>

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
            numColumns = { 2 }
            columnWrapperStyle = { styles.columnWrapper }
            contentContainerStyle = { styles.list }
            refreshControl = {
              <RefreshControl refreshing = { refreshing } onRefresh = { handleRefresh } tintColor = "#1F5C43" />
            }
            onEndReached = { handleLoadMore }
            onEndReachedThreshold = { 0.2 }
            ListFooterComponent = { renderFooter }
            ListEmptyComponent = {
              !loading ? (
                  <View style = { styles.empty }>
                    <Text style = { styles.emptyEmoji }>🧳</Text>
                    <Text style = { styles.emptyText }>
                      { activeTab === 'recommend' ? '暂无游记' : '还没有关注的人发布游记' }
                    </Text>
                  </View>
              ) : null
            }
        />
      </SafeAreaView>
  )
}

const styles = StyleSheet.create( {
  container: { flex: 1, backgroundColor: '#F6F1E8' },
  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
  },
  headerEyebrow: {
    color: '#B84B35',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0,
    marginBottom: 6,
  },
  headerTitle: {
    color: '#2A241D',
    fontSize: 28,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#817361',
    fontSize: 13,
    marginTop: 5,
  },
  list: {
    padding: GRID_GAP,
    paddingTop: 14,
    paddingBottom: 24,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFDF8',
    borderRadius: 16,
    marginBottom: GRID_GAP,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E9DDC8',
    shadowColor: '#6B4E2E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 0.85,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    backgroundColor: '#E8DDC6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 34,
  },
  likeOverlay: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    backgroundColor: 'rgba(92,47,37,0.88)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  likeOverlayText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '500',
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2A241D',
    lineHeight: 19,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1F5C43',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  nickname: {
    fontSize: 12,
    color: '#6F6356',
    flex: 1,
  },
  date: {
    fontSize: 11,
    color: '#AA9A83',
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#AA9A83',
  },
  empty: {
    width: '100%',
    paddingTop: 100,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#AA9A83',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFDF8',
    marginHorizontal: 16,
    borderRadius: 18,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E8DDC6',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 14,
  },
  tabText: {
    fontSize: 15,
    color: '#8B7E6D',
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#1F5C43',
    fontWeight: '800',
  },
  tabIndicator: {
    marginTop: 5,
    width: 22,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#B84B35',
  },
} )
