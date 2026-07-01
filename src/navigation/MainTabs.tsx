import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import HomeScreen from '../screens/HomeScreen'
import NoteListScreen from '../screens/NoteListScreen'
import EntertainmentScreen from '../screens/EntertainmentScreen'
import ProfileScreen from '../screens/ProfileScreen'
import { Text } from 'react-native'

// 底部 Tab 路由表类型
export type MainTabParamList = {
  首页: undefined
  NoteList: undefined
  玩乐: undefined
  我的: undefined
}

const Tab = createBottomTabNavigator<MainTabParamList>()

export default function MainTabs() {
  return (
      <Tab.Navigator
          screenOptions = { {
            headerShown: false,       // Tab 里的页面不显示 Tab 自己的 header（外层 Stack 的 header 管）
            tabBarActiveTintColor: '#1890ff',
            tabBarInactiveTintColor: '#999',
            tabBarStyle: {
              height: 56,
              paddingBottom: 6,
              paddingTop: 6,
              borderTopColor: '#f0f0f0',
            },
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '500',
            },
          } }
      >
        <Tab.Screen
            name = "首页"
            component = { HomeScreen }
            options = { {
              tabBarLabel: '首页',
              tabBarIcon: ( { color } ) => <Text style = { { color, fontSize: 20 } }>🏠</Text>
            } }
        />
        <Tab.Screen
            name = "NoteList"
            component = { NoteListScreen }
            options = { {
              tabBarLabel: '游记',
              tabBarIcon: ( { color } ) => <Text style = { { color, fontSize: 20 } }>📝</Text>
            } }
        />
        <Tab.Screen
            name = "玩乐"
            component = { EntertainmentScreen }
            options = { {
              tabBarLabel: '玩乐',
              tabBarIcon: ( { color } ) => <Text style = { { color, fontSize: 20 } }>🎯</Text>
            } }
        />
        <Tab.Screen
            name = "我的"
            component = { ProfileScreen }
            options = { {
              tabBarLabel: '我的',
              tabBarIcon: ( { color } ) => <Text style = { { color, fontSize: 20 } }>👤</Text>
            } }
        />
      </Tab.Navigator>
  )
}
