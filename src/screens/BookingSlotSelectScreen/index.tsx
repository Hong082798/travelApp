import React, { useEffect, useState } from 'react'
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, StyleSheet,
} from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation'
import { listAvailableBookingSlots, createBookingOrder, type BookingSlotVO } from '../../api/booking'

// @ts-ignore
type Props = NativeStackScreenProps<RootStackParamList, 'BookingSlotSelect'>

const getErrorMessage = ( error: unknown ) => error instanceof Error ? error.message : String( error )

// @ts-ignore
export default function BookingSlotSelectScreen( { route, navigation }: Props ) {

  // @ts-ignore
  const { targetType, targetId, targetName } = route.params
  const [ slots, setSlots ] = useState<BookingSlotVO[]>( [] )
  const [ loading, setLoading ] = useState( true )
  const [ selectedId, setSelectedId ] = useState<number | null>( null )
  const [ submitting, setSubmitting ] = useState( false )

  useEffect( () => {
    navigation.setOptions( { title: `预约 · ${ targetName }` } )

    let mounted = true
    const fetchSlots = async () => {
      try {
        const res = await listAvailableBookingSlots( targetType, targetId )
        if ( !mounted ) return
        setSlots( res )
      }
      catch ( error ) {
        if ( !mounted ) return
        Alert.alert( '加载失败', getErrorMessage( error ) )
      }
      finally {
        if ( mounted ) setLoading( false )
      }
    }
    fetchSlots()
    return () => {
      mounted = false
    }
  }, [ targetType, targetId, targetName, navigation ] )


  const handleSubmit = async () => {
    // 双重防护
    if ( selectedId === null || submitting ) return
    setSubmitting( true )
    try {
      await createBookingOrder( selectedId )
      Alert.alert( '预约成功', '订单已提交等待管理员确定', [
        { text: '好的', onPress: () => navigation.goBack() }
      ] )
    }
    catch ( e ) {
      Alert.alert( '预约失败', getErrorMessage( e ) )
    }
    finally {
      setSubmitting( false )
    }
  }

  if ( loading ) {
    return <View style = { styles.center }><ActivityIndicator size = "large" color = "#1F5C43" /></View>
  }

  if ( slots.length === 0 ) {
    return <View style = { styles.center }><Text style = { styles.emptyText }>暂无可预约时段</Text></View>
  }

  return (
      <View style = { styles.container }>
        <FlatList
            data = { slots }
            keyExtractor = { ( item ) => String( item.id ) }
            contentContainerStyle = { styles.listContent }
            renderItem = { ( { item } ) => {
              // 已下架或名额已满的时段禁止选择，但仍展示在列表里让用户看到已被占用的情况
              const disabled = item.status === 0 || item.remainingCount <= 0
              const selected = selectedId === item.id
              return (
                  <TouchableOpacity
                      style = { [ styles.slotCard, selected && styles.slotCardSelected, disabled && styles.slotCardDisabled ] }
                      disabled = { disabled }
                      onPress = { () => setSelectedId( item.id ) }
                  >
                    <Text style = { styles.slotDate }>{ item.slotDate }</Text>
                    <Text
                        style = { styles.slotTime }>{ item.startTime.slice( 0, 5 ) } - { item.endTime.slice( 0, 5 ) }</Text>
                    <Text style = { [ styles.slotRemain, disabled && styles.slotRemainDisabled ] }>
                      { item.status === 0 ? '已下架' : item.remainingCount <= 0 ? '名额已满' : `剩余 ${ item.remainingCount } 名额` }
                    </Text>
                  </TouchableOpacity>
              )
            } }
        />
        <TouchableOpacity
            style = { [ styles.submitButton, ( selectedId === null || submitting ) && styles.submitButtonDisabled ] }
            disabled = { selectedId === null || submitting }
            onPress = { handleSubmit }
        >
          <Text style = { styles.submitText }>{ submitting ? '提交中...' : '提交预约' }</Text>
        </TouchableOpacity>
      </View>
  )
}

const styles = StyleSheet.create( {
  container: { flex: 1, backgroundColor: '#F6F1E8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 15, color: '#8B7E6D' },
  listContent: { padding: 16 },
  slotCard: {
    backgroundColor: '#FFFDF8', borderRadius: 18, padding: 16, marginBottom: 12,
    borderWidth: 2, borderColor: '#E8DDC6',
    shadowColor: '#6B4E2E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  slotCardSelected: { borderColor: '#1F5C43', backgroundColor: '#F1EADB' },
  slotCardDisabled: { opacity: 0.5 },
  slotDate: { fontSize: 17, fontWeight: '800', color: '#2A241D' },
  slotTime: { fontSize: 14, color: '#6F6356', marginTop: 5 },
  slotRemain: { fontSize: 13, color: '#1F5C43', marginTop: 7, fontWeight: '700' },
  slotRemainDisabled: { color: '#8B7E6D' },
  submitButton: {
    backgroundColor: '#1F5C43', margin: 16, padding: 14,
    borderRadius: 16, alignItems: 'center',
    shadowColor: '#173B2D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 4,
  },
  submitButtonDisabled: { backgroundColor: '#AA9A83' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '800' },
} )
