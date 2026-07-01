import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView

} from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation'
import { getNoteDetail, likeNote, unlikeNote } from '../../api/note'
import type { TravelNoteVO } from '../../api/note'
import { TouchableOpacity } from 'react-native'

type Props = NativeStackScreenProps<RootStackParamList, 'NoteDetail'>

const formatDate = ( dateStr: string ) => dateStr.split( 'T' )[ 0 ]
export default function NoteDetailScreen( { route, navigation }: Props ) {
  const { id } = route.params
  const [ detail, setDetail ] = useState<TravelNoteVO | null>( null )
  const [ loading, setLoading ] = useState<boolean>( true )
  const [ likeLoading, setLikeLoading ] = useState( false )

  useEffect( () => {
    const fetchDetail = async () => {
      try {
        const res = await getNoteDetail( id )
        console.log( res, '@@@@@获得列表详情数据' )
        setDetail( res )
        navigation.setOptions( { title: res.title } )
      }
      catch ( error: any ) {
        Alert.alert( '加载失败', error.message )
      }
      finally {
        setLoading( false )
      }
    }
    fetchDetail()
  }, [ id ] );

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
          <Text>游记不存在或已下架</Text>
        </View>
    )
  }

  // 点赞
  const handleLike = async () => {

    if ( !detail ) return
    if ( likeLoading ) return  // 上一次的请求没回来，直接挡掉
    setLikeLoading( true )

    const oldLiked = detail.liked // 先存旧状态
    const oldLikeCount = detail.likeCount // 先存旧状态

    // 乐观更新
    setDetail( {
      ...detail,
      liked: !oldLiked,
      likeCount: oldLiked ? oldLikeCount - 1 : oldLikeCount + 1
    } )

    try {
      // 根据原来的状态决定调用哪个接口
      if ( oldLiked ) {
        await unlikeNote( detail.id )
      }
      else {
        await likeNote( detail.id )
      }
    }
    catch ( error: any ) {
      // 回滚乐观更新
      setDetail( {
        ...detail,
        liked: oldLiked,
        likeCount: oldLikeCount
      } )
      Alert.alert( '操作失败', error.message )
    }
    finally {
      setLikeLoading( false )
    }
  }

  return (
      <SafeAreaView style = { { flex: 1 } }>
        <ScrollView style = { styles.container }>

          {/* 标题 */ }
          <View style = { styles.header }>
            <Text style = { styles.title }>{ detail.title }</Text>
          </View>

          {/* 作者信息 */ }
          <View style = { styles.authorCard }>
            <View style = { styles.avatar }>
              <Text style = { styles.avatarText }>
                { detail.authorNickname?.charAt( 0 ) ?? '?' }
              </Text>
            </View>
            <View style = { styles.authorInfo }>
              <TouchableOpacity
                  onPress = { () => navigation.navigate( 'UserProfile', {
                    userId: detail.userId,
                    nickname: detail.authorNickname,
                  } ) }
              >
                <Text style = { styles.nickname }>{ detail.authorNickname }</Text>
              </TouchableOpacity>
              <Text style = { styles.date }>{ formatDate( detail.createTime ) }</Text>
            </View>
            <TouchableOpacity
                style = { styles.likeBtn }
                onPress = { handleLike }
                disabled = { likeLoading }
                activeOpacity = { 0.6 }
            >
              <Text style = { styles.likeIcon }>
                { detail.liked ? '❤️' : '🤍' }
              </Text>
              <Text style = { styles.likeCount }>{ detail.likeCount }</Text>
            </TouchableOpacity>
          </View>

          {/* 正文内容 */ }
          <View style = { styles.contentCard }>
            <Text style = { styles.content }>
              { detail.content ?? '作者没有留下任何内容' }
            </Text>
          </View>

        </ScrollView>
      </SafeAreaView>
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
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    lineHeight: 32,
  },
  authorCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginBottom: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1890ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  authorInfo: {
    flex: 1,
  },
  nickname: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  date: {
    fontSize: 12,
    color: '#bbb',
    marginTop: 2,
  },
  likeCount: {
    fontSize: 14,
    color: '#999',
  },
  contentCard: {
    backgroundColor: '#fff',
    marginHorizontal: 0,
    padding: 20,
    minHeight: 200,
  },
  content: {
    fontSize: 16,
    color: '#333',
    lineHeight: 28,
  },
  likeBtn: { flexDirection: 'row', alignItems: 'center' },
  likeIcon: { fontSize: 16, marginRight: 4 },
} )
