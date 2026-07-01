import React from 'react'
import { View, Text, StyleSheet, SafeAreaView } from 'react-native'

export default function PlaceholderScreen() {
  return (
      <SafeAreaView style = { styles.container }>
        <Text style = { styles.emoji }>🚧</Text>
        <Text style = { styles.title }>玩乐</Text>
        <Text style = { styles.subtitle }>精彩内容即将上线，敬请期待</Text>
      </SafeAreaView>
  )
}

const styles = StyleSheet.create( {
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#999' },
} )
