import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import LoginScreen from '../screens/LoginScreen'
import HomeScreen from '../screens/HomeScreen'
import ScenicDetailScreen from '../screens/ScenicDetailScreen'
// @ts-ignore
import NoteListScreen from '../screens/NoteListScreen'
import NoteDetailScreen from '../screens/NoteDetailScreen'
// @ts-ignore
import UserProfileScreen from '../screens/UserProfileScreen'
import { navigationRef } from './navigationRef'
import FollowListScreen from '../screens/FollowListScreen'
import MainTabs from './MainTabs'

// 定义路由表的类型
export type RootStackParamList = {
  Login: undefined
  MainTabs: undefined
  ScenicDetail: { id: number; categoryName: string }
  NoteDetail: { id: number },
  UserProfile: { userId: number, nickname: string },
  FollowList: { type: 'following' | 'followers'; title: string }
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function Navigation() {
  return (
      <NavigationContainer ref = { navigationRef }>
        <Stack.Navigator initialRouteName = { "Login" }>
          <Stack.Screen name = "Login" component = { LoginScreen } options = { { headerShown: false } } />
          <Stack.Screen name = "MainTabs" component = { MainTabs } options = { { headerShown: false } } />
          <Stack.Screen
              name = "ScenicDetail"
              component = { ScenicDetailScreen }
              options = { { title: '景点详情' } }
          />
          <Stack.Screen
              name = "NoteDetail"
              component = { NoteDetailScreen }
              options = { { title: '游记详情' } }
          />
          <Stack.Screen
              name = "UserProfile"
              component = { UserProfileScreen }
              options = { { title: '用户主页' } }
          />
          <Stack.Screen
              name = "FollowList"
              component = { FollowListScreen }
              options = { { title: '' } }   // 标题由页面内 setOptions 动态设置
          />
        </Stack.Navigator>
      </NavigationContainer>
  )
}
