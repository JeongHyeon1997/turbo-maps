// Minimal ambient typing for the Kakao Maps JS SDK (loaded at runtime).
// The SDK has no official types; we treat it as `any` behind `window.kakao`.
/* eslint-disable @typescript-eslint/no-explicit-any */
export {};

declare global {
  interface Window {
    kakao: any;
  }
}
