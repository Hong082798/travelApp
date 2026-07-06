import React, { useCallback, useEffect, useState } from 'react'
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, StyleSheet, RefreshControl,
} from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation'
import { getMyBookingOrders, cancelBookingOrder, type BookingOrderVO } from '../../api/booking'

type Props = NativeStackScreenProps<RootStackParamList, 'MyBookings'>

const PAGE_SIZE = 10
const STATUS_COLOR: Record<number, string> = { 0: '#B66A23', 1: '#1F5C43', 2: '#8B7E6D', 3: '#5C2F25' }

const getErrorMessage = ( error: unknown ) => error instanceof Error ? error.message : '请求失败'

export default function MyBookingsScreen( { navigation }: Props ) {
  const [ orders, setOrders ] = useState<BookingOrderVO[]>( [] )
  const [ pageNum, setPageNum ] = useState( 1 )
  const [ total, setTotal ] = useState( 0 )
  const [ loading, setLoading ] = useState( true )
  const [ loadingMore, setLoadingMore ] = useState( false )
  const [ refreshing, setRefreshing ] = useState( false )

  useEffect( () => {
    navigation.setOptions( { title: '我的预订' } )
  }, [ navigation ] )

  // append=true时追加到已有列表（加载更多），false时替换整个列表（首次加载/下拉刷新）
  const loadPage = useCallback( async ( page: number, append: boolean ) => {
    try {
      const res = await getMyBookingOrders( page, PAGE_SIZE )
      setOrders( prev => append ? [ ...prev, ...res.records ] : res.records )
      setTotal( res.total )
      setPageNum( page )
    }
    catch ( error ) {
      Alert.alert( '加载失败', getErrorMessage( error ) )
    }
  }, [] )

  useEffect( () => {
    setLoading( true )
    loadPage( 1, false ).finally( () => setLoading( false ) )
  }, [ loadPage ] )

  const handleRefresh = async () => {
    setRefreshing( true )
    await loadPage( 1, false )
    setRefreshing( false )
  }

  const handleLoadMore = async () => {
    // orders.length < total 说明还有下一页；loadingMore防止FlatList触发多次onEndReached重复请求
    if ( loadingMore || orders.length >= total ) return
    setLoadingMore( true )
    await loadPage( pageNum + 1, true )
    setLoadingMore( false )
  }

  const handleCancel = ( id: number ) => {
    Alert.alert( '确认取消', '确定要取消这个预约吗?', [
      { text: '再想想', style: 'cancel' },
      {
        text: '确定取消', style: 'destructive', onPress: async () => {
          try {
            await cancelBookingOrder( id )
            // 取消成功后重新拉第一页，而不是本地手改状态——
            // 保证列表数据和后端真实状态一致，避免本地乐观更新和后端并发结果不一致
            await loadPage( 1, false )
          }
          catch ( error ) {
            Alert.alert( '取消失败', getErrorMessage( error ) )
          }
        },
      },
    ] )
  }

  if ( loading ) {
    return <View style = { styles.center }><ActivityIndicator size = "large" color = "#1F5C43" /></View>
  }

  if ( orders.length === 0 ) {
    return <View style = { styles.center }><Text style = { styles.emptyText }>还没有预约记录</Text></View>
  }

  return (
      <FlatList
          style = { styles.container }
          data = { orders }
          keyExtractor = { ( item ) => String( item.id ) }
          refreshControl = { <RefreshControl refreshing = { refreshing } onRefresh = { handleRefresh } tintColor = "#1F5C43" /> }
          onEndReached = { handleLoadMore }
          onEndReachedThreshold = { 0.3 }
          ListFooterComponent = { loadingMore ? <ActivityIndicator style = { styles.footerLoading } /> : null }
          renderItem = { ( { item } ) => {
            // 待确认(0)和已确认(1)都还能取消，已取消(2)/已完成(3)不能再操作
            const cancellable = item.status === 0 || item.status === 1
            return (
                <View style = { styles.card }>
                  <View style = { styles.cardHeader }>
                    <Text style = { styles.targetName }>{ item.targetName }</Text>
                    <Text style = { [ styles.statusText, { color: STATUS_COLOR[ item.status ] } ] }>
                      { item.statusText }
                    </Text>
                  </View>
                  <Text style = { styles.slotInfo }>
                    { item.slotDate } { item.startTime.slice( 0, 5 ) }-{ item.endTime.slice( 0, 5 ) }
                  </Text>
                  { cancellable && (
                      <TouchableOpacity style = { styles.cancelButton } onPress = { () => handleCancel( item.id ) }>
                        <Text style = { styles.cancelText }>取消预约</Text>
                      </TouchableOpacity>
                  ) }
                </View>
            )
          } }
      />
  )
}

const styles = StyleSheet.create( {
  container: { flex: 1, backgroundColor: '#F6F1E8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 15, color: '#8B7E6D' },
  card: {
    backgroundColor: '#FFFDF8',
    borderRadius: 18,
    padding: 16,
    margin: 12,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: '#E8DDC6',
    shadowColor: '#6B4E2E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  targetName: { fontSize: 17, fontWeight: '800', color: '#2A241D', flex: 1, marginRight: 8 },
  statusText: { fontSize: 13, fontWeight: '800' },
  slotInfo: { fontSize: 14, color: '#6F6356', marginTop: 8 },
  cancelButton: { marginTop: 10, alignSelf: 'flex-start' },
  cancelText: { fontSize: 13, color: '#A6402B', fontWeight: '800' },
  footerLoading: { marginVertical: 16 },
} )
