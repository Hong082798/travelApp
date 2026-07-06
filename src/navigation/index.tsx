import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import LoginScreen from '../screens/LoginScreen';
import ScenicDetailScreen from '../screens/ScenicDetailScreen';
// @ts-ignore
import NoteDetailScreen from '../screens/NoteDetailScreen';
// @ts-ignore
import FollowListScreen from '../screens/FollowListScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import MainTabs from './MainTabs';
import { navigationRef } from './navigationRef';
import EntertainmentDetailScreen from '../screens/EntertainmentDetailScreen';
import BookingSlotSelectScreen from '../screens/BookingSlotSelectScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';

// 定义路由表的类型
export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  ScenicDetail: { id: number; categoryName: string };
  NoteDetail: { id: number };
  UserProfile: { userId: number; nickname: string };
  FollowList: { type: 'following' | 'followers'; title: string };
  EntertainmentDetail: { id: number; categoryName: string };
  BookingSlotSelect: { targetType: string; targetId: number; targetName: string };
  MyBookings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Navigation() {
  return (
      <NavigationContainer ref = { navigationRef }>
        <Stack.Navigator
            initialRouteName = { 'Login' }
            screenOptions = { {
              headerStyle: { backgroundColor: '#FFFDF8' },
              headerTintColor: '#1F5C43',
              headerTitleStyle: {
                color: '#2A241D',
                fontWeight: '800',
              },
              headerShadowVisible: false,
              contentStyle: { backgroundColor: '#F6F1E8' },
            } }
        >
          <Stack.Screen
              name = "Login"
              component = { LoginScreen }
              options = { { headerShown: false } }
          />
          <Stack.Screen
              name = "MainTabs"
              component = { MainTabs }
              options = { { headerShown: false } }
          />
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
              options = { { title: '' } } // 标题由页面内 setOptions 动态设置
          />
          <Stack.Screen
              name = "EntertainmentDetail"
              component = { EntertainmentDetailScreen }
              options = { { title: '玩乐详情' } }
          />
          <Stack.Screen
              name = "BookingSlotSelect"
              component = { BookingSlotSelectScreen }
              options = { { title: '选择时段' } }
          />
          <Stack.Screen
              name = "MyBookings"
              component = { MyBookingsScreen }
              options = { { title: '我的预订' } }
          />
        </Stack.Navigator>
      </NavigationContainer>
  );
}
