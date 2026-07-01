import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  View,
  Text,
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
          <ActivityIndicator size = "large" color = "#1890ff" />
        </View>
    )
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
      <ScrollView style = { styles.container }>

        {/* 基本信息卡片 */ }
        <View style = { styles.card }>
          <View style = { styles.titleRow }>
            <Text style = { styles.name }>{ detail.name }</Text>
            <View style = { styles.badge }>
              <Text style = { styles.badgeText }>{ categoryName }</Text>
            </View>
          </View>
          <Text style = { styles.description }>{ detail.description }</Text>
        </View>

        {/* 详细信息卡片 */ }
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
  )
}

const styles = StyleSheet.create( {
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 15,
    color: '#999',
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
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
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
  description: {
    fontSize: 15,
    color: '#555',
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#999',
    width: 80,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  scoreText: {
    color: '#fa8c16',
    fontWeight: '600',
  },
  priceText: {
    color: '#f5222d',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
} )
