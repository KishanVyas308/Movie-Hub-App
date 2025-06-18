import { Stack } from "expo-router";
import './global.css';
export default function RootLayout() {
  return <Stack 
     > 
    <Stack.Screen
      name="(tabs)"
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="movies/[id]"
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="cast/[id]"
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="genres/[id]"
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="movies/category/[type]"
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="movies/[id]/cast"
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="movies/[id]/reviews"
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="movies/[id]/similar"
      options={{ headerShown: false }}
    />

  </Stack>;
}
