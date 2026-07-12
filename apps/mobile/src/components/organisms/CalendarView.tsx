import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { theme } from '@maps/tokens';
import { useTheme } from '@/lib/theme';
import { AppText } from '@/components/atoms';

export interface CalendarItem {
  id: string;
  date: string; // yyyy-mm-dd
  title: string;
  placeCount: number;
}

export interface CalendarViewProps {
  items: CalendarItem[];
  /** yyyy-mm, computed by the caller (avoids a render-time `new Date()` read). */
  initialMonth: string;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

/**
 * Month calendar (docs/plan/09-mobile.md STEP 5) — mirrors web `CalendarView`:
 * days with a record get a brand dot; tapping a day lists that day's logs;
 * tapping a listed log navigates to its detail (`/logs/[id]`).
 */
export function CalendarView({ items, initialMonth }: CalendarViewProps) {
  const { colors } = useTheme();
  const [cursor, setCursor] = useState(initialMonth);
  const [selected, setSelected] = useState<string | null>(null);

  const byDate = useMemo(() => {
    const m = new Map<string, CalendarItem[]>();
    items.forEach((it) => {
      const list = m.get(it.date) ?? [];
      list.push(it);
      m.set(it.date, list);
    });
    return m;
  }, [items]);

  const [year, month] = cursor.split('-').map(Number) as [number, number];
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const today = useMemo(() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  }, []);

  const shift = (delta: number) => {
    let y = year;
    let m = month + delta;
    if (m < 1) {
      m = 12;
      y -= 1;
    } else if (m > 12) {
      m = 1;
      y += 1;
    }
    setCursor(`${y}-${String(m).padStart(2, '0')}`);
    setSelected(null);
  };

  const dateStr = (day: number) => `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const selectedItems = selected ? (byDate.get(selected) ?? []) : [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="이전 달"
          hitSlop={theme.space[2]}
          onPress={() => shift(-1)}
          style={styles.navButton}
        >
          <AppText variant="subtitle" color="secondary">
            ‹
          </AppText>
        </Pressable>
        <AppText variant="bodyStrong">
          {year}년 {month}월
        </AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="다음 달"
          hitSlop={theme.space[2]}
          onPress={() => shift(1)}
          style={styles.navButton}
        >
          <AppText variant="subtitle" color="secondary">
            ›
          </AppText>
        </Pressable>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAYS.map((w) => (
          <View key={w} style={styles.cell}>
            <AppText variant="caption" color="muted">
              {w}
            </AppText>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((day, i) => {
          if (day === null) return <View key={`blank-${i}`} style={styles.cell} />;

          const ds = dateStr(day);
          const has = byDate.has(ds);
          const isSelected = selected === ds;
          const isToday = today === ds;

          return (
            <Pressable
              key={ds}
              disabled={!has}
              accessibilityRole={has ? 'button' : undefined}
              accessibilityState={has ? { selected: isSelected } : undefined}
              onPress={() => setSelected(isSelected ? null : ds)}
              style={[
                styles.cell,
                styles.dayCell,
                { backgroundColor: isSelected ? colors.brand : has ? colors.surfaceAlt : 'transparent' },
                isToday && !isSelected && { borderWidth: 2, borderColor: colors.brand },
              ]}
            >
              <AppText variant="caption" color={isSelected ? 'onBrand' : has ? 'primary' : 'secondary'}>
                {day}
              </AppText>
              {has && <View style={[styles.dot, { backgroundColor: isSelected ? colors.surface : colors.brand }]} />}
            </Pressable>
          );
        })}
      </View>

      {selectedItems.length > 0 && (
        <View style={styles.list}>
          {selectedItems.map((it) => (
            <Pressable
              key={it.id}
              accessibilityRole="button"
              onPress={() => router.push({ pathname: '/logs/[id]', params: { id: it.id } })}
              style={[styles.listItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <AppText variant="bodyStrong" style={styles.listTitle} numberOfLines={1}>
                {it.title}
              </AppText>
              <AppText variant="caption" color="muted">
                {it.placeCount}곳
              </AppText>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.space[4],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    paddingHorizontal: theme.space[3],
    paddingVertical: theme.space[2],
  },
  weekRow: {
    flexDirection: 'row',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCell: {
    borderRadius: theme.radius.lg,
    gap: theme.space[1],
  },
  dot: {
    width: theme.space[1],
    height: theme.space[1],
    borderRadius: theme.radius.full,
  },
  list: {
    gap: theme.space[2],
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.space[4],
    paddingVertical: theme.space[3],
  },
  listTitle: {
    flex: 1,
    marginRight: theme.space[2],
  },
});
