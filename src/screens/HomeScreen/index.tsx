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
        <View style = { styles.header }>
          <View style = { styles.hero }>
            <Text style = { styles.heroEyebrow }>CULTURAL JOURNEY</Text>
            <Text style = { styles.headerTitle }>山河有约</Text>
            <Text style = { styles.headerSubtitle }>发现城市周边的风景、人文与烟火气</Text>
            <View style = { styles.heroStats }>
              <View style = { styles.heroStatItem }>
                <Text style = { styles.heroStatValue }>精选</Text>
                <Text style = { styles.heroStatLabel }>文旅目的地</Text>
              </View>
              <View style = { styles.heroDivider } />
              <View style = { styles.heroStatItem }>
                <Text style = { styles.heroStatValue }>实时</Text>
                <Text style = { styles.heroStatLabel }>门票与评分</Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity
            style = { styles.noteEntry }
            onPress = { () => navigation.navigate( 'NoteList' ) }
            activeOpacity = { 0.85 }
        >
          <View style = { styles.noteEntryIcon }>
            <Text style = { styles.noteEntryIconText }>册</Text>
          </View>
          <View style = { styles.noteEntryTextWrap }>
            <Text style = { styles.noteEntryTitle }>旅人手记</Text>
            <Text style = { styles.noteEntrySubtitle }>从真实游记里找下一段路线灵感</Text>
          </View>
          <Text style = { styles.noteEntryArrow }>›</Text>
        </TouchableOpacity>

        <FlatList
            data = { data }
            keyExtractor = { ( item ) => String( item.id ) }
            renderItem = { renderItem }
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
    backgroundColor: '#F6F1E8',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 2,
  },
  hero: {
    backgroundColor: '#1F5C43',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
    overflow: 'hidden',
    shadowColor: '#173B2D',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 5,
  },
  heroEyebrow: {
    fontSize: 11,
    color: '#D9C79B',
    fontWeight: '700',
    letterSpacing: 0,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFF9EE',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E8DDC6',
    marginTop: 6,
    lineHeight: 21,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: 'rgba(255,249,238,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,249,238,0.18)',
  },
  heroStatItem: {
    minWidth: 86,
  },
  heroStatValue: {
    color: '#FFF9EE',
    fontSize: 15,
    fontWeight: '800',
  },
  heroStatLabel: {
    color: '#D9C79B',
    fontSize: 11,
    marginTop: 3,
  },
  heroDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,249,238,0.2)',
    marginHorizontal: 12,
  },
  list: {
    padding: 16,
    paddingTop: 14,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFDF8',
    borderRadius: 18,
    marginBottom: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E9DDC8',
    shadowColor: '#6B4E2E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.09,
    shadowRadius: 16,
    elevation: 3,
  },
  cardImageWrap: {
    width: 124,
    height: 150,
    backgroundColor: '#D8C9AB',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImagePlaceholder: {
    backgroundColor: '#E8DDC6',
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
    backgroundColor: 'rgba(31,92,67,0.9)',
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 4,
    maxWidth: '80%',
  },
  badgeText: {
    fontSize: 11,
    color: '#FFF9EE',
    fontWeight: '700',
  },
  cardBody: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2A241D',
  },
  cardDesc: {
    fontSize: 13,
    color: '#756B5E',
    lineHeight: 19,
    marginTop: 5,
  },
  cardFooter: {
    marginTop: 8,
  },
  address: {
    fontSize: 12,
    color: '#8B7E6D',
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  score: {
    fontSize: 13,
    color: '#B66A23',
    fontWeight: '700',
  },
  price: {
    fontSize: 16,
    color: '#A6402B',
    fontWeight: '800',
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
  noteEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDF8',
    marginHorizontal: 16,
    marginTop: 14,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E8DDC6',
    shadowColor: '#6B4E2E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  noteEntryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#B84B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  noteEntryIconText: {
    fontSize: 18,
    color: '#FFF9EE',
    fontWeight: '800',
  },
  noteEntryTextWrap: {
    flex: 1,
  },
  noteEntryTitle: {
    fontSize: 16,
    color: '#2A241D',
    fontWeight: '800',
  },
  noteEntrySubtitle: {
    fontSize: 12,
    color: '#817361',
    marginTop: 3,
  },
  noteEntryArrow: {
    fontSize: 24,
    color: '#B84B35',
    marginLeft: 4,
  },
} )
