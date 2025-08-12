import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Title, Card, Paragraph } from 'react-native-paper';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Title style={styles.title}>Almoxarifado App</Title>
      
      <Card style={styles.card}>
        <Card.Content>
          <Title>Bem-vindo!</Title>
          <Paragraph>
            Use este aplicativo para gerenciar seus pedidos de materiais.
          </Paragraph>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
  },
}); 