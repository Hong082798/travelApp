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
            <ActivityIndicator size = "small" color = "#1890ff" />
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
          <Text style = { styles.headerTitle }>玩乐</Text>
          <Text style = { styles.headerSubtitle }>周边好去处，随时安排</Text>
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
                  tintColor = "#1890ff"
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
  tabsWrap: {
    backgroundColor: '#fff',
    marginTop: 10,
  },
  tabsList: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#f5f6f8',
    marginRight: 8,
  },
  tabChipActive: {
    backgroundColor: '#1890ff',
  },
  tabChipText: {
    fontSize: 13,
    color: '#666',
  },
  tabChipTextActive: {
    color: '#fff',
    fontWeight: '600',
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
  address: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 6,
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
} );
