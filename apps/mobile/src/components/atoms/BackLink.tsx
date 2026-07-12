import { Pressable, StyleSheet } from 'react-native';
import { router, type Href } from 'expo-router';
import { theme } from '@maps/tokens';
import { AppText } from './AppText';

// Same accessibility floor as `Button`'s MIN_TOUCH_TARGET — caption text alone
// is ~18px tall, so the pressable box is stretched to the 44px minimum.
const MIN_TOUCH_TARGET = 44;

export interface BackLinkProps {
  /** Where to go when there's no navigation history to pop (e.g. a deep link). */
  fallbackHref: Href;
  children: string;
}

/**
 * "‹ back" control — mirrors web `BackLink`: pops the navigation stack when
 * there's history to pop, else replaces with `fallbackHref`.
 */
export function BackLink({ fallbackHref, children }: BackLinkProps) {
  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(fallbackHref);
    }
  };

  return (
    <Pressable
      onPress={goBack}
      accessibilityRole="button"
      hitSlop={theme.space[2]}
      style={styles.base}
    >
      <AppText variant="caption" color="secondary">
        {children}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
});
