// Mock data for the home feed until the DB (db-dev) + API (server-dev) land.
// Shapes intentionally mirror the planned @maps/shared schema (schema-dev).

export interface MockPlace {
  name: string;
  category: string;
}

export interface MockDateLog {
  id: string;
  date: string; // ISO
  title: string;
  memo: string;
  rating: number; // 0-5
  places: MockPlace[];
  /** signed URL of the cover photo, when one was uploaded — `null`/absent renders `CoverFallback` */
  coverImage?: string | null;
  /** author nickname — shown on the public explore feed */
  author?: string;
}

export const mockDateLogs: MockDateLog[] = [
  {
    id: '1',
    date: '2026-07-04',
    title: '연남동 골목 나들이',
    memo: '파스타 맛집 발견. 다음엔 저녁 예약하고 가기 🍝',
    rating: 5,
    places: [
      { name: '연남토마', category: '레스토랑' },
      { name: '카페 리브레', category: '카페' },
      { name: '경의선숲길', category: '산책' },
    ],
  },
  {
    id: '2',
    date: '2026-06-28',
    title: '한강 자전거 데이트',
    memo: '노을 보면서 치맥. 바람 완벽했음.',
    rating: 4,
    places: [
      { name: '뚝섬한강공원', category: '공원' },
      { name: '치킨플러스', category: '맛집' },
    ],
  },
  {
    id: '3',
    date: '2026-06-15',
    title: '성수 카페 투어',
    memo: '디저트 세 군데 도장깨기. 다 맛있었다.',
    rating: 5,
    places: [
      { name: '어니언 성수', category: '카페' },
      { name: '대림창고', category: '카페' },
      { name: '포인트오브뷰', category: '소품샵' },
    ],
  },
];
