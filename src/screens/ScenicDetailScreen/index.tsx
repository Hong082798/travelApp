import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation'
import { checkFavorite, favoriteScenic, getScenicDetail, unfavoriteScenic } from '../../api/scenic'
import type { ScenicDetail } from '../../api/scenic'

type Props = NativeStackScreenProps<RootStackParamList, 'ScenicDetail'>

const getErrorMessage = ( error: unknown ) => {
  return error instanceof Error ? error.message : '请求失败'
}

export default function ScenicDetailScreen( { route, navigation }: Props ) {
  const { id, categoryName } = route.params
  const [ detail, setDetail ] = useState<ScenicDetail | null>( null )
  const [ loading, setLoading ] = useState<boolean>( true )
  const [ favorited, setFavorited ] = useState<boolean>( false )
  const [ favoriteLoading, setFavoriteLoading ] = useState<boolean>( true )
  const favoriteRequestingRef = useRef( false )

  useEffect( () => {
    let mounted = true

    const fetchDetail = async () => {
      setLoading( true )
      setDetail( null )
      try {
        const res = await getScenicDetail( id )
        if ( !mounted ) return
        setDetail( res )
        navigation.setOptions( { title: res.name } )
      }
      catch ( error ) {
        if ( !mounted ) return
        Alert.alert( '加载失败', getErrorMessage( error ) )
      }
      finally {
        if ( mounted ) {
          setLoading( false )
        }
      }
    }

    // 收藏
    const fetchFavoriteStatus = async () => {
      setFavoriteLoading( true )
      try {
        const res = await checkFavorite( id )
        if ( !mounted ) return
        setFavorited( res )
      }
      catch {
        if ( !mounted ) return
        setFavorited( false )
      }
      finally {
        if ( mounted ) {
          setFavoriteLoading( false )
        }
      }

    }

    fetchDetail()
    fetchFavoriteStatus()

    return () => {
      mounted = false
    }
  }, [ id, navigation ] )

  const handleFavorite = useCallback( async () => {
    if ( favoriteLoading || favoriteRequestingRef.current ) return
    favoriteRequestingRef.current = true
    setFavoriteLoading( true )

    const oldFavorited = favorited // 存旧值

    // 乐观更新
    setFavorited( !oldFavorited )

    try {
      if ( oldFavorited ) {
        await unfavoriteScenic( id )
      }
      else {
        await favoriteScenic( id )
      }
    }
    catch ( error ) {
      // 失败了就回滚
      setFavorited( oldFavorited )
      Alert.alert( '操作失败', getErrorMessage( error ) )
    }
    finally {
      favoriteRequestingRef.current = false
      setFavoriteLoading( false )
    }
  }, [ favoriteLoading, favorited, id ] )

  const renderFavoriteButton = useCallback( () => (
      <TouchableOpacity
          onPress = { handleFavorite }
          disabled = { favoriteLoading }
          style = { styles.favoriteButton }
          accessibilityRole = "button"
          accessibilityLabel = { favorited ? '取消收藏景点' : '收藏景点' }
      >
        <Text style = { [ styles.favoriteText, favoriteLoading && styles.favoriteTextLoading ] }>
          { favorited ? '⭐' : '☆' }
        </Text>
      </TouchableOpacity>
  ), [ favoriteLoading, favorited, handleFavorite ] )

  useLayoutEffect( () => {
    navigation.setOptions( {
      headerRight: renderFavoriteButton,
    } )
  }, [ navigation, renderFavoriteButton ] )

  if ( loading ) {
    return (
        <View style = { styles.center }>
          <ActivityIndicator size = "large" color = "#1F5C43" />
        </View>
    )
  }

  const handleBooking = () => {
    if ( !detail ) return
    navigation.navigate( 'BookingSlotSelect', {
      targetType: 'SCENIC',
      targetId: id,
      targetName: detail.name
    } )
  }

  if ( !detail ) {
    return (
        <View style = { styles.center }>
          <Text style = { styles.errorText }>景点信息加载失败</Text>
        </View>
    )
  }

  // HTML
  return (
      <View style = { styles.page }>
        <ScrollView style = { styles.container }>
          { detail.coverImage ? (
              <Image source = { { uri: detail.coverImage } } style = { styles.cover } />
          ) : (
              <View style = { [ styles.cover, styles.coverPlaceholder ] }>
                <Text style = { styles.coverPlaceholderText }>山河</Text>
              </View>
          ) }

          <View style = { styles.heroCard }>
            <View style = { styles.titleRow }>
              <Text style = { styles.name }>{ detail.name }</Text>
              <View style = { styles.badge }>
                <Text style = { styles.badgeText }>{ categoryName }</Text>
              </View>
            </View>
            <View style = { styles.quickRow }>
              <View style = { styles.quickItem }>
                <Text style = { styles.quickValue }>{ detail.score } 分</Text>
                <Text style = { styles.quickLabel }>游客评分</Text>
              </View>
              <View style = { styles.quickItem }>
                <Text style = { styles.quickValue }>
                  { Number( detail.ticketPrice ) === 0 ? '免费' : `¥${ detail.ticketPrice }` }
                </Text>
                <Text style = { styles.quickLabel }>门票参考</Text>
              </View>
            </View>
            <Text style = { styles.description }>{ detail.description }</Text>
          </View>

          <View style = { styles.card }>
            <Text style = { styles.sectionTitle }>景点信息</Text>

            <View style = { styles.infoRow }>
              <Text style = { styles.infoLabel }>📍 地址</Text>
              <Text style = { styles.infoValue }>{ detail.address }</Text>
            </View>

            <View style = { styles.divider } />

            <View style = { styles.infoRow }>
              <Text style = { styles.infoLabel }>⭐ 评分</Text>
              <Text style = { [ styles.infoValue, styles.scoreText ] }>{ detail.score } 分</Text>
            </View>

            <View style = { styles.divider } />

            <View style = { styles.infoRow }>
              <Text style = { styles.infoLabel }>🎫 门票</Text>
              <Text style = { [ styles.infoValue, styles.priceText ] }>
                { Number( detail.ticketPrice ) === 0 ? '免费' : `¥${ detail.ticketPrice }` }
              </Text>
            </View>

            <View style = { styles.divider } />

            <View style = { styles.infoRow }>
              <Text style = { styles.infoLabel }>🗺️ 坐标</Text>
              <Text style = { styles.infoValue }>
                { detail.longitude }, { detail.latitude }
              </Text>
            </View>
          </View>

        </ScrollView>
        <TouchableOpacity style = { styles.bookingButton } onPress = { handleBooking }>
          <Text style = { styles.bookingButtonText }>预约参观</Text>
        </TouchableOpacity>
      </View>
  )
}

const styles = StyleSheet.create( {
  page: {
    flex: 1,
    backgroundColor: '#F6F1E8',
  },
  container: {
    flex: 1,
    backgroundColor: '#F6F1E8',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 15,
    color: '#8B7E6D',
  },
  favoriteButton: {
    marginRight: 8,
    padding: 4,
  },
  favoriteText: {
    fontSize: 22,
  },
  favoriteTextLoading: {
    opacity: 0.45,
  },
  card: {
    backgroundColor: '#FFFDF8',
    borderRadius: 18,
    padding: 16,
    margin: 16,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: '#E8DDC6',
    shadowColor: '#6B4E2E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  cover: {
    width: '100%',
    height: 260,
    backgroundColor: '#D8C9AB',
  },
  coverPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverPlaceholderText: {
    color: '#1F5C43',
    fontSize: 30,
    fontWeight: '800',
  },
  heroCard: {
    backgroundColor: '#FFFDF8',
    borderRadius: 22,
    padding: 18,
    marginHorizontal: 16,
    marginTop: -34,
    borderWidth: 1,
    borderColor: '#E8DDC6',
    shadowColor: '#6B4E2E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2A241D',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    backgroundColor: '#1F5C43',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    fontSize: 12,
    color: '#FFF9EE',
    fontWeight: '700',
  },
  quickRow: {
    flexDirection: 'row',
    marginBottom: 14,
    gap: 10,
  },
  quickItem: {
    flex: 1,
    backgroundColor: '#F6F1E8',
    borderRadius: 14,
    padding: 12,
  },
  quickValue: {
    color: '#A6402B',
    fontSize: 17,
    fontWeight: '800',
  },
  quickLabel: {
    color: '#817361',
    fontSize: 12,
    marginTop: 4,
  },
  description: {
    fontSize: 15,
    color: '#5F5448',
    lineHeight: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2A241D',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#8B7E6D',
    width: 80,
  },
  infoValue: {
    fontSize: 14,
    color: '#3D352D',
    flex: 1,
  },
  scoreText: {
    color: '#B66A23',
    fontWeight: '800',
  },
  priceText: {
    color: '#A6402B',
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#EFE5D2',
  },

  // 底部预约按钮样式
  bookingButton: {
    backgroundColor: '#1F5C43',
    margin: 16,
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#173B2D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 4,
  },

  bookingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }

} )
