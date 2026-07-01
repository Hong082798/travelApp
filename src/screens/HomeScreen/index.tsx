import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl, SafeAreaView
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { getScenicPage } from '../../api/scenic'
import type { ScenicSpot } from '../../api/scenic'
import type { RootStackParamList } from '../../navigation'

type HomeNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>

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
          activeOpacity = { 0.8 }
      >
        <View style = { styles.cardHeader }>
          <Text style = { styles.cardTitle } numberOfLines = { 1 }>{ item.name }</Text>
          <View style = { styles.badge }>
            <Text style = { styles.badgeText }>{ item.categoryName }</Text>
          </View>
        </View>

        <Text style = { styles.cardDesc } numberOfLines = { 2 }>{ item.description }</Text>

        <View style = { styles.cardFooter }>
          <Text style = { styles.address } numberOfLines = { 1 }>📍 { item.address }</Text>
          <View style = { styles.rightInfo }>
            <Text style = { styles.score }>⭐ { item.score }</Text>
            <Text style = { styles.price }>
              { Number( item.ticketPrice ) === 0 ? '免费' : `¥${ item.ticketPrice }` }
            </Text>
          </View>
        </View>
      </TouchableOpacity>
  )

  return (
      <SafeAreaView style = { { flex: 1 } }>
        {/* 顶部导航入口 */ }
        <TouchableOpacity
            style = { styles.noteEntry }
            onPress = { () => navigation.navigate( 'NoteList' ) }
            activeOpacity = { 0.8 }
        >
          <Text style = { styles.noteEntryText }>📖 旅行游记社区 →</Text>
        </TouchableOpacity>

        {/* 景点列表 */ }
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
                    <Text style = { styles.emptyText }>暂无景点数据</Text>
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    backgroundColor: '#e6f4ff',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 12,
    color: '#1890ff',
  },
  cardDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  address: {
    fontSize: 13,
    color: '#999',
    flex: 1,
    marginRight: 8,
  },
  rightInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  score: {
    fontSize: 13,
    color: '#fa8c16',
  },
  price: {
    fontSize: 13,
    color: '#f5222d',
    fontWeight: '600',
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
  noteEntry: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  noteEntryText: {
    fontSize: 15,
    color: '#1890ff',
    fontWeight: '500',
  },
} )
