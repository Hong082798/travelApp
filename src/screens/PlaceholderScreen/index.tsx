import React from 'react'
import { Text, StyleSheet, SafeAreaView } from 'react-native'

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
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F6F1E8' },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '800', color: '#2A241D', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#817361' },
} )
