import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import HomeScreen from '../screens/HomeScreen'
import NoteListScreen from '../screens/NoteListScreen'
import EntertainmentScreen from '../screens/EntertainmentScreen'
import ProfileScreen from '../screens/ProfileScreen'
import { StyleSheet, Text } from 'react-native'

// 底部 Tab 路由表类型
export type MainTabParamList = {
  首页: undefined
  NoteList: undefined
  玩乐: undefined
  我的: undefined
}

const Tab = createBottomTabNavigator<MainTabParamList>()

const HomeTabIcon = () => <Text style = { styles.tabIcon }>🧭</Text>
const NoteTabIcon = () => <Text style = { styles.tabIcon }>📖</Text>
const EntertainmentTabIcon = () => <Text style = { styles.tabIcon }>🎟️</Text>
const ProfileTabIcon = () => <Text style = { styles.tabIcon }>👤</Text>

export default function MainTabs() {
  return (
      <Tab.Navigator
          screenOptions = { {
            headerShown: false,       // Tab 里的页面不显示 Tab 自己的 header（外层 Stack 的 header 管）
            tabBarActiveTintColor: '#1F5C43',
            tabBarInactiveTintColor: '#9B8C77',
            tabBarStyle: {
              height: 62,
              paddingBottom: 8,
              paddingTop: 7,
              backgroundColor: '#FFFDF8',
              borderTopColor: '#E8DDC6',
              borderTopWidth: 1,
            },
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '700',
            },
          } }
      >
        <Tab.Screen
            name = "首页"
            component = { HomeScreen }
            options = { {
              tabBarLabel: '首页',
              tabBarIcon: HomeTabIcon,
            } }
        />
        <Tab.Screen
            name = "NoteList"
            component = { NoteListScreen }
            options = { {
              tabBarLabel: '游记',
              tabBarIcon: NoteTabIcon,
            } }
        />
        <Tab.Screen
            name = "玩乐"
            component = { EntertainmentScreen }
            options = { {
              tabBarLabel: '玩乐',
              tabBarIcon: EntertainmentTabIcon,
            } }
        />
        <Tab.Screen
            name = "我的"
            component = { ProfileScreen }
            options = { {
              tabBarLabel: '我的',
              tabBarIcon: ProfileTabIcon,
            } }
        />
      </Tab.Navigator>
  )
}

const styles = StyleSheet.create( {
  tabIcon: {
    fontSize: 20,
  },
} )
