import { Image, StyleSheet, View } from 'react-native';
import { theme } from '@maps/tokens';
import { AppText, CoverFallback } from '@/components/atoms';

export interface CoverHeroProps {
  title: string;
  dateLabel: string;
  coverImage?: string | null;
}

// Fixed dark scrim + white text over the cover plane (photo OR the
// `CoverFallback` fill, both get the same treatment) — not a semantic token,
// same exception as `DateLogCard`'s `DATE_BADGE_BG`/`DATE_BADGE_FG`. A solid
// chip like this reads at high contrast regardless of what's behind it, so
// unlike web's `CoverHero` there's no separate no-photo text treatment needed.
const SCRIM_BG = 'rgba(0,0,0,0.6)';
const ON_SCRIM_FG = '#FFFFFF';

/**
 * Large detail-page cover (docs/plan/09-mobile.md STEP 5) — mirrors web
 * `CoverHero`: a real photo when present, else `CoverFallback` (brand tone),
 * with the date badge + title overlaid. `/logs/[id]`'s only caller for now —
 * mobile has no `/explore/[id]` (Phase 1 excludes public surfaces) — but kept
 * as its own molecule in case a future public detail screen needs it too.
 */
export function CoverHero({ title, dateLabel, coverImage }: CoverHeroProps) {
  const hasCover = !!coverImage;

  return (
    <View style={styles.container}>
      {hasCover ? (
        <Image
          source={{ uri: coverImage }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          accessibilityLabel={`${title} 커버 사진`}
        />
      ) : (
        <CoverFallback tone="brand" style={StyleSheet.absoluteFill} />
      )}
      <View style={[styles.dateBadge, { backgroundColor: SCRIM_BG }]}>
        <AppText variant="caption" style={styles.onScrimText}>
          {dateLabel}
        </AppText>
      </View>
      <AppText variant="title" style={styles.onScrimText}>
        {title}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // 192 = space[24] + space[16] + space[8] (96 + 64 + 32) — matches web
    // CoverHero's `h-48` (12rem = 192px).
    height: theme.space[24] + theme.space[16] + theme.space[8],
    borderRadius: theme.radius['2xl'],
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: theme.space[5],
    gap: theme.space[2],
  },
  dateBadge: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.full,
    paddingHorizontal: theme.space[3],
    paddingVertical: theme.space[1],
  },
  onScrimText: {
    color: ON_SCRIM_FG,
  },
});
