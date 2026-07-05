// Loads the Kakao Maps JS SDK once (with the `services` library for place
// search) and resolves when `kakao.maps` is ready. Uses NEXT_PUBLIC_KAKAO_MAP_KEY.
// The app's domain must be registered in Kakao Developers → 플랫폼 → Web.

let promise: Promise<typeof window.kakao> | null = null;

export function loadKakao(): Promise<typeof window.kakao> {
  if (typeof window === 'undefined') return Promise.reject(new Error('client only'));
  if (window.kakao?.maps) return Promise.resolve(window.kakao);
  if (promise) return promise;

  promise = new Promise((resolve, reject) => {
    const key = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
    if (!key) return reject(new Error('NEXT_PUBLIC_KAKAO_MAP_KEY missing'));
    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false&libraries=services`;
    script.async = true;
    script.onload = () => window.kakao.maps.load(() => resolve(window.kakao));
    script.onerror = () => reject(new Error('failed to load Kakao SDK'));
    document.head.appendChild(script);
  });
  return promise;
}
