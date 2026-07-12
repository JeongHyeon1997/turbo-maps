import { Image, StyleSheet, View } from 'react-native';
import { theme } from '@maps/tokens';
import { useTheme } from '@/lib/theme';
import { AppText, CoverFallback, HeartRating, Tag } from '@/components/atoms';
import { formatLogDate } from '@/lib/format-date';

export interface DateLogCardPlace {
  name: string;
  category: string;
}

export interface DateLogCardData {
  id: string;
  date: string;
  title: string;
  memo: string;
  rating: number;
  places: DateLogCardPlace[];
  coverImage?: string | null;
}

export interface DateLogCardProps {
  log: DateLogCardData;
}

// Fixed dark overlay behind the date badge so it stays legible over any photo,
// in both light and dark theme — not a semantic token (same exception as the
// `OAuthButton` atom's third-party brand colors: a fixed, theme-independent value).
const DATE_BADGE_BG = 'rgba(0,0,0,0.6)';
const DATE_BADGE_FG = '#FFFFFF';

/**
 * One date-log entry in the home feed (docs/plan/09-mobile.md STEP 4) — mirrors
 * web `DateLogCard`, but RN primitives and no `Link` yet: the detail route
 * (`/logs/[id]`) doesn't exist until STEP 5, so this card is read-only display
 * for now (no `onPress`/navigation — STEP 5 wires that up once the route exists).
 */
export function DateLogCard({ log }: DateLogCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.cover}>
        {log.coverImage ? (
          <Image source={{ uri: log.coverImage }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <CoverFallback style={StyleSheet.absoluteFill} />
        )}
        <View style={[styles.dateBadge, { backgroundColor: DATE_BADGE_BG }]}>
          <AppText variant="caption" style={{ color: DATE_BADGE_FG }}>
            {formatLogDate(log.date)}
          </AppText>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <AppText variant="bodyStrong" style={styles.title} numberOfLines={1}>
            {log.title}
          </AppText>
          <HeartRating value={log.rating} />
        </View>

        {log.memo.length > 0 && (
          <AppText variant="caption" color="secondary" numberOfLines={2}>
            {log.memo}
          </AppText>
        )}

        {log.places.length > 0 && (
          <View style={styles.tags}>
            {log.places.map((place, index) => (
              <Tag key={`${place.name}-${index}`}>
                {place.category ? `${place.name} · ${place.category}` : place.name}
              </Tag>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: theme.radius['2xl'],
    overflow: 'hidden',
  },
  cover: {
    // 160 = space[24] (96) + space[16] (64) — composed from the spacing scale,
    // same pattern as the `Button` atom's size heights.
    height: theme.space[24] + theme.space[16],
    justifyContent: 'flex-end',
    padding: theme.space[4],
  },
  dateBadge: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.space[3],
    paddingVertical: theme.space[1],
  },
  body: {
    padding: theme.space[4],
    gap: theme.space[3],
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.space[2],
  },
  title: {
    flex: 1,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.space[2],
  },
});
