import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Title, Avatar, List } from 'react-native-paper';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Avatar.Icon size={80} icon="account" />
        <Title style={styles.name}>Nome do Usuário</Title>
      </View>

      <List.Section>
        <List.Item
          title="Setor"
          description="Manutenção"
          left={props => <List.Icon {...props} icon="domain" />}
        />
        <List.Item
          title="Função"
          description="Encarregado"
          left={props => <List.Icon {...props} icon="badge-account" />}
        />
        <List.Item
          title="Email"
          description="usuario@empresa.com"
          left={props => <List.Icon {...props} icon="email" />}
        />
      </List.Section>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  name: {
    marginTop: 10,
  },
}); 