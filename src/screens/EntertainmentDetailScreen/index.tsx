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

const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : '请求失败';
};

export default function EntertainmentDetailScreen({ route, navigation }: Props) {
  const { id, categoryName } = route.params;
  const [detail, setDetail] = useState<EntertainmentItem | null>(null);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [favoriteLoading, setFavoriteLoading] = useState(true);
  const favoriteRequestingRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    navigation.setOptions({ title: categoryName });

    const fetchData = async () => {
      try {
        const [detailRes, favRes] = await Promise.all([
          getEntertainmentDetail(id),
          checkEntertainmentFavorite(id),
        ]);
        if (!mounted) return;
        setDetail(detailRes);
        setIsFavorite(favRes);
      }
      catch (error) {
        if (!mounted) return;
        Alert.alert('加载失败', getErrorMessage(error));
      }
      finally {
        if (!mounted) return;
        setLoading(false);
        setFavoriteLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [id, categoryName, navigation]);

  useEffect(() => {
    if (detail) {
      navigation.setOptions({ title: detail.name });
    }
  }, [detail, navigation]);

  const handleToggleFavorite = useCallback(async () => {
    if (favoriteLoading) return;
    if ( favoriteRequestingRef.current ) return;
    favoriteRequestingRef.current = true
    setFavoriteLoading(true);
    const prev = isFavorite;
    setIsFavorite(!prev);

    try {
      if (prev) {
        await unfavoriteEntertainment(id);
      }
      else {
        await favoriteEntertainment(id);
      }
    }
    catch (error) {
      setIsFavorite(prev);
      Alert.alert('操作失败', getErrorMessage(error));
    }
    finally {
      favoriteRequestingRef.current = false
      setFavoriteLoading(false);
    }
  }, [favoriteLoading, id, isFavorite]);

  const renderFavoriteButton = useCallback(
    () => (
      <TouchableOpacity
        onPress={handleToggleFavorite}
        disabled={favoriteLoading}
        style={styles.favoriteButton}
        accessibilityRole="button"
      >
        <Text style={[styles.favoriteText, favoriteLoading && styles.favoriteTextLoading]}>
          {isFavorite ? '⭐' : '☆'}
        </Text>
      </TouchableOpacity>
    ),
    [favoriteLoading, isFavorite, handleToggleFavorite],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: renderFavoriteButton,
    });
  }, [navigation, renderFavoriteButton]);

  if ( loading ) {
    return (
        <View style = { styles.center }>
          <ActivityIndicator size = "large" />
        </View>
    );
  }

  if (!detail) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>玩乐详情加载失败</Text>
      </View>
    );
  }

  const tags = detail.tags ? detail.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];

  return (
      <ScrollView style={styles.container}>
        {detail.coverImage ? (
          <Image source={{ uri: detail.coverImage }} style={styles.cover} />
        ) : (
          <View style={[styles.cover, styles.coverPlaceholder]}>
            <Text style={styles.coverPlaceholderText}>🎯</Text>
          </View>
        )}

        <View style={styles.content}>
          <Text style={styles.name}>{detail.name}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{detail.categoryName ?? '其他'}</Text>
            <Text style={styles.metaText}>⭐ {detail.score ?? '-'}</Text>
            <Text style={styles.metaPrice}>{renderPriceText(detail.avgPrice)}</Text>
          </View>

          {tags.length > 0 && (
            <View style={styles.tagsWrap}>
              {tags.map(tag => (
                <View key={tag} style={styles.tagChip}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>基础信息</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>⏰ 营业时间</Text>
              <Text style={styles.infoValue}>{detail.openTime ?? '暂无'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📍 地址</Text>
              <Text style={styles.infoValue}>{detail.address ?? '暂无'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📞 电话</Text>
              <Text style={styles.infoValue}>{detail.phone ?? '暂无'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>🗺️ 坐标</Text>
              <Text style={styles.infoValue}>
                {detail.longitude ?? '-'}, {detail.latitude ?? '-'}
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>项目介绍</Text>
            <Text style={styles.description}>{detail.description ?? '暂无介绍'}</Text>
          </View>
        </View>
      </ScrollView>
  );
}

const styles = StyleSheet.create( {
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: {
    fontSize: 15,
    color: '#999',
  },
  cover: { width: '100%', height: 240 },
  coverPlaceholder: {
    backgroundColor: '#eef1f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverPlaceholderText: {
    fontSize: 48,
  },
  content: { padding: 16 },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  metaRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: 14,
    color: '#666',
  },
  metaPrice: {
    fontSize: 16,
    color: '#f5222d',
    fontWeight: '700',
  },
  tagsWrap: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    backgroundColor: '#e6f4ff',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#1890ff',
  },
  card: {
    marginTop: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  infoLabel: {
    width: 86,
    fontSize: 14,
    color: '#999',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  description: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
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
} );
