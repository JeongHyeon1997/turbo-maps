import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppShell } from '@/components/templates';
import { CalendarView, type CalendarItem } from '@/components/organisms';
import { PageTitle } from '@/components/atoms';

interface Row {
  id: string;
  date: string;
  title: string | null;
  date_log_places: { id: string }[];
}

export default async function CalendarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data } = await supabase
    .from('date_logs')
    .select('id, date, title, date_log_places(id)')
    .order('date', { ascending: false });

  const rows = (data ?? []) as unknown as Row[];
  const items: CalendarItem[] = rows.map((r) => ({
    id: r.id,
    date: r.date.slice(0, 10),
    title: r.title ?? '무제 데이트',
    placeCount: r.date_log_places?.length ?? 0,
  }));

  // Current month computed server-side and passed as a prop (no hydration drift).
  const now = new Date();
  const initialMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageTitle className="text-2xl">캘린더</PageTitle>
        <CalendarView items={items} initialMonth={initialMonth} />
      </div>
    </AppShell>
  );
}
