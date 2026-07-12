import { Stack } from 'expo-router';

/**
 * Route group layout for unauthenticated screens. Options (headerShown,
 * contentStyle) already cascade from the root `_layout.tsx` `screenOptions`
 * (STEP 1) — this just declares the group's own stack.
 */
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="couple-connect" />
    </Stack>
  );
}
