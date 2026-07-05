'use client';

import { useMemo, useState } from 'react';

export interface CalendarItem {
  id: string;
  date: string; // yyyy-mm-dd
  title: string;
  placeCount: number;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

/** Month calendar highlighting days with records; click a day to list them. */
export function CalendarView({
  items,
  initialMonth,
}: {
  items: CalendarItem[];
  initialMonth: string; // yyyy-mm (from server, avoids hydration drift)
}) {
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

  const dateStr = (day: number) =>
    `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const selectedItems = selected ? (byDate.get(selected) ?? []) : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button onClick={() => shift(-1)} className="rounded-lg px-3 py-1 text-text-secondary hover:bg-surface-alt">
          ‹
        </button>
        <span className="text-lg font-bold text-text-primary">
          {year}년 {month}월
        </span>
        <button onClick={() => shift(1)} className="rounded-lg px-3 py-1 text-text-secondary hover:bg-surface-alt">
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1 text-xs font-medium text-text-muted">
            {w}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`b${i}`} />;
          const ds = dateStr(day);
          const has = byDate.has(ds);
          const isSel = selected === ds;
          return (
            <button
              key={ds}
              onClick={() => has && setSelected(isSel ? null : ds)}
              className={`flex aspect-square flex-col items-center justify-center rounded-xl text-sm ${
                isSel ? 'bg-brand text-white' : has ? 'bg-surface-alt text-text-primary' : 'text-text-secondary'
              }`}
            >
              {day}
              {has && (
                <span
                  className={`mt-0.5 h-1.5 w-1.5 rounded-full ${isSel ? 'bg-white' : 'bg-brand'}`}
                />
              )}
            </button>
          );
        })}
      </div>

      {selectedItems.length > 0 && (
        <ul className="flex flex-col gap-2">
          {selectedItems.map((it) => (
            <li
              key={it.id}
              className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3"
            >
              <span className="text-sm font-semibold text-text-primary">{it.title}</span>
              <span className="text-xs text-text-muted">{it.placeCount}곳</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
