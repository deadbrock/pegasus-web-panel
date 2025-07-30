import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

import HomeScreen from '../screens/HomeScreen';
import PedidosListScreen from '../screens/PedidosListScreen';
import NovoPedidoScreen from '../screens/NovoPedidoScreen';
import PedidoDetailScreen from '../screens/PedidoDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const PedidosStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="PedidosList" 
      component={PedidosListScreen} 
      options={{ title: 'Meus Pedidos' }}
    />
    <Stack.Screen 
      name="PedidoDetail" 
      component={PedidoDetailScreen} 
      options={{ title: 'Detalhes do Pedido' }}
    />
    <Stack.Screen 
      name="NovoPedido" 
      component={NovoPedidoScreen} 
      options={{ title: 'Novo Pedido' }}
    />
  </Stack.Navigator>
);

export const AppNavigator = () => (
  <Tab.Navigator>
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarIcon: ({ color }) => (
          <Icon name="home" size={26} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Pedidos"
      component={PedidosStack}
      options={{
        tabBarIcon: ({ color }) => (
          <Icon name="list-alt" size={26} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarIcon: ({ color }) => (
          <Icon name="person" size={26} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
); 