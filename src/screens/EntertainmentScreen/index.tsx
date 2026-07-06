import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type {
  EntertainmentCategory,
  EntertainmentItem,
} from '../../api/entertainment';
import {
  getEntertainmentCategories,
  getEntertainmentPage,
} from '../../api/entertainment';
import type { RootStackParamList } from '../../navigation';
import type { MainTabParamList } from '../../navigation/MainTabs';
import { renderPriceText } from '../../utils/format'

type EntertainmentNavigationProp = CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList, '玩乐'>,
    NativeStackNavigationProp<RootStackParamList>
>;

// 本地"全部"选项用的占位 id，接口返回的分类表里不会出现这个值
const ALL_CATEGORY_ID = -1;

export default function EntertainmentScreen() {
  const navigation = useNavigation<EntertainmentNavigationProp>();
  const [ categories, setCategories ] = useState<EntertainmentCategory[]>( [] );
  const [ selectedCategoryId, setSelectedCategoryId ] =
      useState<number>( ALL_CATEGORY_ID );
  const [ data, setData ] = useState<EntertainmentItem[]>( [] );
  const [ pageNum, setPageNum ] = useState( 1 );
  const [ hasMore, setHasMore ] = useState( true );
  const [ loading, setLoading ] = useState( false );
  const [ refreshing, setRefreshing ] = useState( false );
  const loadingRef = useRef( false );

  useEffect( () => {
    getEntertainmentCategories()
        .then( setCategories )
        .catch( () => {
        } );
  }, [] );

  const fetchData = useCallback(
      async ( page: number, categoryId: number, isRefresh = false ) => {
        if ( loadingRef.current ) return;
        loadingRef.current = true;
        setLoading( true );
        try {
          const res = await getEntertainmentPage( {
            pageNum: page,
            pageSize: 10,
            // categoryId === ALL_CATEGORY_ID 说明用户选的是"全部"，不传分类条件
            // categoryId !== ALL_CATEGORY_ID 才传给后端做筛选
            categoryId: categoryId === ALL_CATEGORY_ID ? undefined : categoryId,
          } );
          if ( isRefresh ) {
            setData( res.records );
          }
          else {
            setData( prev => [ ...prev, ...res.records ] );
          }
          setHasMore( page < res.pages );
          setPageNum( page );
        }
        finally {
          loadingRef.current = false;
          setLoading( false );
          setRefreshing( false );
        }
      },
      [],
  );

  // useEffect(() => {
  //   fetchData(1, true);
  // }, [fetchData]);
  useEffect( () => {
    setData( [] ); // reset列表数据
    setHasMore( true ); // reset hasMore
    setPageNum( 1 ); // reset pageNum
    fetchData( 1, selectedCategoryId, true );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ selectedCategoryId ] );

  const handleRefresh = () => {
    setRefreshing( true );
    setHasMore( true );
    fetchData( 1, selectedCategoryId, true );
  };

  const handleLoadMore = () => {
    if ( !hasMore || loading ) return;
    fetchData( pageNum + 1, selectedCategoryId );
  };

  const renderFooter = () => {
    if ( loading && data.length > 0 ) {
      return (
          <View style = { styles.footer }>
            <ActivityIndicator size = "small" color = "#1F5C43" />
          </View>
      );
    }
    if ( !hasMore && data.length > 0 ) {
      return (
          <View style = { styles.footer }>
            <Text style = { styles.footerText }>没有更多了</Text>
          </View>
      );
    }
    return null;
  };

  // 分类横向筛选栏：本轮只做选中态展示，尚未接入 categoryId 联动列表请求
  const renderCategoryTabs = () => {
    const tabs = [ { id: ALL_CATEGORY_ID, name: '全部' }, ...categories ];
    return (
        <View style = { styles.tabsWrap }>
          <FlatList
              horizontal
              showsHorizontalScrollIndicator = { false }
              data = { tabs }
              keyExtractor = { item => String( item.id ) }
              contentContainerStyle = { styles.tabsList }
              renderItem = { ( { item } ) => {
                const active = item.id === selectedCategoryId;
                return (
                    <TouchableOpacity
                        style = { [ styles.tabChip, active && styles.tabChipActive ] }
                        onPress = { () => setSelectedCategoryId( item.id ) }
                        activeOpacity = { 0.8 }
                    >
                      <Text
                          style = { [
                            styles.tabChipText,
                            active && styles.tabChipTextActive,
                          ] }
                      >
                        { item.name }
                      </Text>
                    </TouchableOpacity>
                );
              } }
          />
        </View>
    );
  };

  const renderItem = ( { item }: { item: EntertainmentItem } ) => (
      <TouchableOpacity
          style = { styles.card }
          activeOpacity = { 0.85 }
          onPress = { () =>
              navigation.navigate( 'EntertainmentDetail', {
                id: item.id,
                categoryName: item.categoryName ?? '其他',
              } )
          }
      >
        <View style = { styles.cardImageWrap }>
          { item.coverImage ? (
              <Image source = { { uri: item.coverImage } } style = { styles.cardImage } />
          ) : (
              <View style = { [ styles.cardImage, styles.cardImagePlaceholder ] }>
                <Text style = { styles.placeholderEmoji }>🎯</Text>
              </View>
          ) }
          <View style = { styles.badge }>
            <Text style = { styles.badgeText } numberOfLines = { 1 }>
              { item.categoryName ?? '其他' }
            </Text>
          </View>
        </View>

        <View style = { styles.cardBody }>
          <Text style = { styles.cardTitle } numberOfLines = { 1 }>
            { item.name }
          </Text>
          { !!item.description && (
              <Text style = { styles.cardDesc } numberOfLines = { 2 }>
                { item.description }
              </Text>
          ) }
          { !!item.address && (
              <Text style = { styles.address } numberOfLines = { 1 }>
                📍 { item.address }
              </Text>
          ) }
          <View style = { styles.cardBottomRow }>
            <Text style = { styles.score }>⭐ { item.score ?? '-' }</Text>
            <Text style = { styles.price }>{ renderPriceText( item.avgPrice ) }</Text>
          </View>
        </View>
      </TouchableOpacity>
  );

  return (
      <SafeAreaView style = { styles.container }>
        <View style = { styles.header }>
          <View style = { styles.hero }>
            <Text style = { styles.heroEyebrow }>LOCAL EXPERIENCE</Text>
            <Text style = { styles.headerTitle }>在地玩乐</Text>
            <Text style = { styles.headerSubtitle }>茶馆、演艺、夜游和亲子体验，按心情出发</Text>
          </View>
        </View>

        { renderCategoryTabs() }

        <FlatList
            data = { data }
            keyExtractor = { item => String( item.id ) }
            renderItem = { renderItem }
            contentContainerStyle = { styles.list }
            refreshControl = {
              <RefreshControl
                  refreshing = { refreshing }
                  onRefresh = { handleRefresh }
                  tintColor = "#1F5C43"
              />
            }
            onEndReached = { handleLoadMore }
            onEndReachedThreshold = { 0.2 }
            ListFooterComponent = { renderFooter }
            ListEmptyComponent = {
              !loading ? (
                  <View style = { styles.empty }>
                    <Text style = { styles.emptyEmoji }>🎯</Text>
                    <Text style = { styles.emptyText }>暂无玩乐项目</Text>
                  </View>
              ) : null
            }
        />
      </SafeAreaView>
  );
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
    backgroundColor: '#5C2F25',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#5C2F25',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 4,
  },
  heroEyebrow: {
    fontSize: 11,
    color: '#E9C77D',
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
    color: '#EAD9C6',
    marginTop: 6,
    lineHeight: 21,
  },
  tabsWrap: {
    backgroundColor: 'transparent',
    marginTop: 12,
  },
  tabsList: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#FFFDF8',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E8DDC6',
  },
  tabChipActive: {
    backgroundColor: '#1F5C43',
    borderColor: '#1F5C43',
  },
  tabChipText: {
    fontSize: 13,
    color: '#7B6B58',
    fontWeight: '600',
  },
  tabChipTextActive: {
    color: '#FFF9EE',
    fontWeight: '800',
  },
  list: {
    padding: 16,
    paddingTop: 8,
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
    backgroundColor: 'rgba(92,47,37,0.9)',
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
  address: {
    fontSize: 12,
    color: '#8B7E6D',
    marginTop: 8,
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
} );
