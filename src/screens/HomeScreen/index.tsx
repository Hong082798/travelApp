import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  View, Text, Image, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, SafeAreaView
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { CompositeNavigationProp } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import { getScenicPage } from '../../api/scenic'
import type { ScenicSpot } from '../../api/scenic'
import type { RootStackParamList } from '../../navigation'
import type { MainTabParamList } from '../../navigation/MainTabs'

type HomeNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, '首页'>,
  NativeStackNavigationProp<RootStackParamList>
>

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavigationProp>()
  const [ data, setData ] = useState<ScenicSpot[]>( [] )
  const [ pageNum, setPageNum ] = useState( 1 )
  const [ hasMore, setHasMore ] = useState( true )
  const [ loading, setLoading ] = useState( false )
  const [ refreshing, setRefreshing ] = useState( false )
  const loadingRef = useRef( false )

  const fetchData: ( page: number, isRefresh?: boolean ) => Promise<void> = useCallback( async ( page: number, isRefresh = false ) => {
    if ( loadingRef.current ) return
    loadingRef.current = true
    setLoading( true )
    try {
      // @ts-ignore
      const res = await getScenicPage( { pageNum: page, pageSize: 10 } )
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
      loadingRef.current = false
      setLoading( false )
      setRefreshing( false )
    }
  }, [] )


  useEffect( () => {
    fetchData( 1, true )
  }, [ fetchData ] )

  // 下拉刷新
  const handleRefresh = () => {
    setRefreshing( true )
    setHasMore( true )
    fetchData( 1, true )
  }

  // 上拉加载更多
  const handleLoadMore = () => {
    if ( !hasMore || loading ) return
    fetchData( pageNum + 1 )
  }

  // 渲染底部加载状态
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

  // 渲染单张景点卡片
  const renderItem = ( { item }: { item: ScenicSpot } ) => (
      <TouchableOpacity
          style = { styles.card }
          onPress = { () => navigation.navigate( 'ScenicDetail', { id: item.id, categoryName: item.categoryName } ) }
          activeOpacity = { 0.85 }
      >
        <View style = { styles.cardImageWrap }>
          { item.coverImage ? (
              <Image source = { { uri: item.coverImage } } style = { styles.cardImage } />
          ) : (
              <View style = { [ styles.cardImage, styles.cardImagePlaceholder ] }>
                <Text style = { styles.placeholderEmoji }>🏞️</Text>
              </View>
          ) }
          <View style = { styles.badge }>
            <Text style = { styles.badgeText } numberOfLines = { 1 }>{ item.categoryName }</Text>
          </View>
        </View>

        <View style = { styles.cardBody }>
          <Text style = { styles.cardTitle } numberOfLines = { 1 }>{ item.name }</Text>
          <Text style = { styles.cardDesc } numberOfLines = { 2 }>{ item.description }</Text>
          <View style = { styles.cardFooter }>
            <Text style = { styles.address } numberOfLines = { 1 }>📍 { item.address }</Text>
          </View>
          <View style = { styles.cardBottomRow }>
            <Text style = { styles.score }>⭐ { item.score }</Text>
            <Text style = { styles.price }>
              { Number( item.ticketPrice ) === 0 ? '免费' : `¥${ item.ticketPrice }` }
            </Text>
          </View>
        </View>
      </TouchableOpacity>
  )

  return (
      <SafeAreaView style = { styles.container }>
        {/* 顶部标题 */ }
        <View style = { styles.header }>
          <Text style = { styles.headerTitle }>发现</Text>
          <Text style = { styles.headerSubtitle }>找到下一个想去的地方</Text>
        </View>

        {/* 游记社区入口 */ }
        <TouchableOpacity
            style = { styles.noteEntry }
            onPress = { () => navigation.navigate( 'NoteList' ) }
            activeOpacity = { 0.85 }
        >
          <View style = { styles.noteEntryIcon }>
            <Text style = { styles.noteEntryIconText }>📖</Text>
          </View>
          <View style = { styles.noteEntryTextWrap }>
            <Text style = { styles.noteEntryTitle }>旅行游记社区</Text>
            <Text style = { styles.noteEntrySubtitle }>看看大家都去了哪里</Text>
          </View>
          <Text style = { styles.noteEntryArrow }>›</Text>
        </TouchableOpacity>

        {/* 景点列表 */ }
        <FlatList
            data = { data }
            keyExtractor = { ( item ) => String( item.id ) }
            renderItem = { renderItem }
            contentContainerStyle = { styles.list }
            refreshControl = {
              <RefreshControl refreshing = { refreshing } onRefresh = { handleRefresh } tintColor = "#1890ff" />
            }
            onEndReached = { handleLoadMore }
            onEndReachedThreshold = { 0.2 }
            ListFooterComponent = { renderFooter }
            ListEmptyComponent = {
              !loading ? (
                  <View style = { styles.empty }>
                    <Text style = { styles.emptyEmoji }>🗺️</Text>
                    <Text style = { styles.emptyText }>暂无景点数据</Text>
                  </View>
              ) : null
            }
        />
      </SafeAreaView>
  )
}

const styles = StyleSheet.create( {
  container: {
    flex: 1,
    backgroundColor: '#f5f6f8',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  list: {
    padding: 16,
    paddingTop: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 14,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardImageWrap: {
    width: 108,
    height: 132,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImagePlaceholder: {
    backgroundColor: '#eef1f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 30,
  },
  badge: {
    position: 'absolute',
    left: 8,
    top: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    maxWidth: '80%',
  },
  badgeText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '500',
  },
  cardBody: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  cardDesc: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
    marginTop: 4,
  },
  cardFooter: {
    marginTop: 6,
  },
  address: {
    fontSize: 12,
    color: '#aaa',
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  score: {
    fontSize: 13,
    color: '#fa8c16',
    fontWeight: '500',
  },
  price: {
    fontSize: 14,
    color: '#f5222d',
    fontWeight: '700',
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
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#bbb',
  },
  noteEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  noteEntryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#e6f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  noteEntryIconText: {
    fontSize: 22,
  },
  noteEntryTextWrap: {
    flex: 1,
  },
  noteEntryTitle: {
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  noteEntrySubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  noteEntryArrow: {
    fontSize: 22,
    color: '#ccc',
    marginLeft: 4,
  },
} )
