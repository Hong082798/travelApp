import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  getEntertainmentDetail,
  checkEntertainmentFavorite,
  favoriteEntertainment,
  unfavoriteEntertainment,
  type EntertainmentItem,
} from '../../api/entertainment';
import type { RootStackParamList } from '../../navigation';
import { renderPriceText } from '../../utils/format';

type Props = NativeStackScreenProps<RootStackParamList, 'EntertainmentDetail'>;

const getErrorMessage = ( error: unknown ) => {
  return error instanceof Error ? error.message : '请求失败';
};

export default function EntertainmentDetailScreen( { route, navigation }: Props ) {
  const { id, categoryName } = route.params;
  const [ detail, setDetail ] = useState<EntertainmentItem | null>( null );
  const [ isFavorite, setIsFavorite ] = useState<boolean>( false );
  const [ loading, setLoading ] = useState( true );
  const [ favoriteLoading, setFavoriteLoading ] = useState( true );
  const favoriteRequestingRef = useRef( false );

  useEffect( () => {
    let mounted = true;
    navigation.setOptions( { title: categoryName } );

    const fetchData = async () => {
      try {
        const [ detailRes, favRes ] = await Promise.all( [
          getEntertainmentDetail( id ),
          checkEntertainmentFavorite( id ),
        ] );
        if ( !mounted ) return;
        setDetail( detailRes );
        setIsFavorite( favRes );
      }
      catch ( error ) {
        if ( !mounted ) return;
        Alert.alert( '加载失败', getErrorMessage( error ) );
      }
      finally {
        if ( !mounted ) return;
        setLoading( false );
        setFavoriteLoading( false );
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [ id, categoryName, navigation ] );

  useEffect( () => {
    if ( detail ) {
      navigation.setOptions( { title: detail.name } );
    }
  }, [ detail, navigation ] );

  const handleToggleFavorite = useCallback( async () => {
    if ( favoriteLoading ) return;
    if ( favoriteRequestingRef.current ) return;
    favoriteRequestingRef.current = true
    setFavoriteLoading( true );
    const prev = isFavorite;
    setIsFavorite( !prev );

    try {
      if ( prev ) {
        await unfavoriteEntertainment( id );
      }
      else {
        await favoriteEntertainment( id );
      }
    }
    catch ( error ) {
      setIsFavorite( prev );
      Alert.alert( '操作失败', getErrorMessage( error ) );
    }
    finally {
      favoriteRequestingRef.current = false
      setFavoriteLoading( false );
    }
  }, [ favoriteLoading, id, isFavorite ] );

  const renderFavoriteButton = useCallback(
      () => (
          <TouchableOpacity
              onPress = { handleToggleFavorite }
              disabled = { favoriteLoading }
              style = { styles.favoriteButton }
              accessibilityRole = "button"
          >
            <Text style = { [ styles.favoriteText, favoriteLoading && styles.favoriteTextLoading ] }>
              { isFavorite ? '⭐' : '☆' }
            </Text>
          </TouchableOpacity>
      ),
      [ favoriteLoading, isFavorite, handleToggleFavorite ],
  );

  useLayoutEffect( () => {
    navigation.setOptions( {
      headerRight: renderFavoriteButton,
    } );
  }, [ navigation, renderFavoriteButton ] );

  if ( loading ) {
    return (
        <View style = { styles.center }>
          <ActivityIndicator size = "large" color = "#1F5C43" />
        </View>
    );
  }

  const handleBooking = () => {
    if ( !detail ) return;
    navigation.navigate( 'BookingSlotSelect', {
      targetType: 'entertainment',
      targetId: detail.id,
      targetName: detail.name,
    } );
  }

  if ( !detail ) {
    return (
        <View style = { styles.center }>
          <Text style = { styles.errorText }>玩乐详情加载失败</Text>
        </View>
    );
  }

  const tags = detail.tags ? detail.tags.split( ',' ).map( tag => tag.trim() ).filter( Boolean ) : [];

  return (
      <View style = { styles.page }>
        <ScrollView style = { styles.container }>
          { detail.coverImage ? (
              <Image source = { { uri: detail.coverImage } } style = { styles.cover } />
          ) : (
              <View style = { [ styles.cover, styles.coverPlaceholder ] }>
                <Text style = { styles.coverPlaceholderText }>玩乐</Text>
              </View>
          ) }

          <View style = { styles.content }>
            <View style = { styles.heroCard }>
              <Text style = { styles.name }>{ detail.name }</Text>

              <View style = { styles.metaRow }>
                <Text style = { styles.metaText }>{ detail.categoryName ?? '其他' }</Text>
                <Text style = { styles.metaText }>⭐ { detail.score ?? '-' }</Text>
                <Text style = { styles.metaPrice }>{ renderPriceText( detail.avgPrice ) }</Text>
              </View>
            </View>

            { tags.length > 0 && (
                <View style = { styles.tagsWrap }>
                  { tags.map( tag => (
                      <View key = { tag } style = { styles.tagChip }>
                        <Text style = { styles.tagText }>{ tag }</Text>
                      </View>
                  ) ) }
                </View>
            ) }

            <View style = { styles.card }>
              <Text style = { styles.sectionTitle }>基础信息</Text>
              <View style = { styles.infoRow }>
                <Text style = { styles.infoLabel }>⏰ 营业时间</Text>
                <Text style = { styles.infoValue }>{ detail.openTime ?? '暂无' }</Text>
              </View>
              <View style = { styles.divider } />
              <View style = { styles.infoRow }>
                <Text style = { styles.infoLabel }>📍 地址</Text>
                <Text style = { styles.infoValue }>{ detail.address ?? '暂无' }</Text>
              </View>
              <View style = { styles.divider } />
              <View style = { styles.infoRow }>
                <Text style = { styles.infoLabel }>📞 电话</Text>
                <Text style = { styles.infoValue }>{ detail.phone ?? '暂无' }</Text>
              </View>
              <View style = { styles.divider } />
              <View style = { styles.infoRow }>
                <Text style = { styles.infoLabel }>🗺️ 坐标</Text>
                <Text style = { styles.infoValue }>
                  { detail.longitude ?? '-' }, { detail.latitude ?? '-' }
                </Text>
              </View>
            </View>

            <View style = { styles.card }>
              <Text style = { styles.sectionTitle }>项目介绍</Text>
              <Text style = { styles.description }>{ detail.description ?? '暂无介绍' }</Text>
            </View>
          </View>
        </ScrollView>

        { /* 新增：底部固定预约按钮 */ }
        <TouchableOpacity style = { styles.bookingButton } onPress = { handleBooking }>
          <Text style = { styles.bookingButtonText }>预约体验</Text>
        </TouchableOpacity>
      </View>
  );
}

const styles = StyleSheet.create( {
  page: {
    flex: 1,
    backgroundColor: '#F6F1E8',
  },
  container: { flex: 1, backgroundColor: '#F6F1E8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: {
    fontSize: 15,
    color: '#8B7E6D',
  },
  cover: { width: '100%', height: 260, backgroundColor: '#D8C9AB' },
  coverPlaceholder: {
    backgroundColor: '#E8DDC6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverPlaceholderText: {
    fontSize: 30,
    color: '#5C2F25',
    fontWeight: '800',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  heroCard: {
    backgroundColor: '#FFFDF8',
    borderRadius: 22,
    padding: 18,
    marginTop: -34,
    borderWidth: 1,
    borderColor: '#E8DDC6',
    shadowColor: '#6B4E2E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2A241D',
  },
  metaRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    color: '#6F6356',
    fontWeight: '700',
  },
  metaPrice: {
    fontSize: 16,
    color: '#A6402B',
    fontWeight: '800',
  },
  tagsWrap: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    backgroundColor: '#FFFDF8',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#E8DDC6',
  },
  tagText: {
    fontSize: 12,
    color: '#1F5C43',
    fontWeight: '700',
  },
  card: {
    marginTop: 12,
    backgroundColor: '#FFFDF8',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8DDC6',
    shadowColor: '#6B4E2E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2A241D',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  infoLabel: {
    width: 86,
    fontSize: 14,
    color: '#8B7E6D',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#3D352D',
  },
  divider: {
    height: 1,
    backgroundColor: '#EFE5D2',
  },
  description: {
    fontSize: 14,
    color: '#5F5448',
    lineHeight: 23,
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
  bookingButton: {
    backgroundColor: '#5C2F25',
    margin: 16,
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#5C2F25',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 4,
  },
  bookingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
} );
