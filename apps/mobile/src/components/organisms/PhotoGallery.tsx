import { Image, StyleSheet, View } from 'react-native';
import { theme } from '@maps/tokens';
import { useTheme } from '@/lib/theme';

export interface PhotoGalleryProps {
  /** Pre-signed URLs, already ordered (e.g. by `sort_order`). */
  urls: string[];
}

/**
 * Read-only 2-column photo grid (docs/plan/09-mobile.md STEP 5) — mirrors web
 * `PhotoGallery`: no lightbox/tap-to-expand (parity — web's version doesn't
 * have one either, just the grid). Renders nothing when empty.
 */
export function PhotoGallery({ urls }: PhotoGalleryProps) {
  const { colors } = useTheme();

  if (urls.length === 0) return null;

  return (
    <View style={styles.grid}>
      {urls.map((url, i) => (
        <View key={url} style={[styles.tile, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
          <Image
            source={{ uri: url }}
            style={styles.image}
            resizeMode="cover"
            accessibilityLabel={`데이트 사진 ${i + 1}`}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tile: {
    // 48% (not 50%) + `space-between` — RN's flex-wrap accounts for `gap` when
    // deciding whether a row overflows, so two literal 50%-wide tiles plus a
    // row `gap` would overflow the container and force a 1-column layout.
    // Leaving headroom via 48%/space-between sidesteps that without `gap`.
    width: '48%',
    aspectRatio: 1,
    marginBottom: theme.space[3],
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
