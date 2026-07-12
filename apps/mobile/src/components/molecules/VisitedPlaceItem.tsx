import { StyleSheet, View } from 'react-native';
import { theme } from '@maps/tokens';
import { useTheme } from '@/lib/theme';
import { AppText, HeartRating, Tag } from '@/components/atoms';

export interface VisitedPlaceItemProps {
  /** 1-based visit order shown in the badge. */
  order: number;
  name: string;
  category?: string | null;
  address?: string | null;
  rating?: number | null;
  memo?: string | null;
}

/**
 * One visited place row in a date-log detail (docs/plan/09-mobile.md STEP 5)
 * — mirrors web `VisitedPlaceItem` (order badge, name/category, rating, memo).
 * No place-detail link: mobile has no public `/places/[id]` (Phase 1 excludes
 * public explore surfaces), so the name is plain text here, not a link.
 */
export function VisitedPlaceItem({ order, name, category, address, rating, memo }: VisitedPlaceItemProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.badge, { backgroundColor: colors.surfaceAlt }]}>
        <AppText variant="bodyStrong" color="brand" style={styles.badgeText}>
          {order}
        </AppText>
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <View style={styles.titleGroup}>
            <AppText variant="bodyStrong">{name}</AppText>
            {category && <Tag>{category}</Tag>}
          </View>
          {!!rating && <HeartRating value={rating} />}
        </View>
        {address && (
          <AppText variant="caption" color="secondary">
            {address}
          </AppText>
        )}
        {memo && (
          <AppText variant="caption" color="secondary">
            {memo}
          </AppText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: theme.space[3],
    borderWidth: 1,
    borderRadius: theme.radius.xl,
    padding: theme.space[4],
  },
  badge: {
    width: theme.space[7],
    height: theme.space[7],
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: theme.font.size.sm,
  },
  body: {
    flex: 1,
    gap: theme.space[1],
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.space[2],
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.space[2],
    flex: 1,
  },
});
