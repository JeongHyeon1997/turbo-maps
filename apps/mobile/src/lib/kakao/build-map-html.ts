export interface KakaoMapMarker {
  lat: number;
  lng: number;
  name?: string;
}

export interface BuildKakaoMapHtmlOptions {
  /** Kakao Map JS key (`EXPO_PUBLIC_KAKAO_MAP_KEY`) — caller must confirm this is non-empty. */
  appKey: string;
  markers: KakaoMapMarker[];
  /** Draw a polyline through `markers` in order (2+ markers required). */
  route: boolean;
  /** Hex color for the route polyline. */
  routeColor: string;
  /** Page background, shown for the instant before the SDK paints tiles. */
  backgroundColor: string;
}

/**
 * Builds the standalone HTML document loaded into the map `WebView` (docs/plan/
 * 09-mobile.md "기술 결정 사항" #2 — Kakao has no RN SDK, so the JS SDK loads
 * inside a WebView instead). Mirrors web `KakaoMap`'s marker/bounds/Polyline
 * logic (`apps/web/src/components/organisms/KakaoMap.tsx`) as inline page JS —
 * there's no DOM/React on this side of the bridge, so status changes
 * (ready/error) post back to RN via `window.ReactNativeWebView.postMessage`.
 *
 * Marker `name` strings are escaped (`<` -> `<`) before being embedded in
 * the inline `<script>` — without it, a place name containing the literal
 * text "</script>" would terminate the script tag early and break the page.
 */
export function buildKakaoMapHtml({
  appKey,
  markers,
  route,
  routeColor,
  backgroundColor,
}: BuildKakaoMapHtmlOptions): string {
  const markersJson = JSON.stringify(markers).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <style>
    html, body, #map { width: 100%; height: 100%; margin: 0; padding: 0; background: ${backgroundColor}; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false"></script>
  <script>
    function post(type) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: type }));
      }
    }
    try {
      kakao.maps.load(function () {
        try {
          var markers = ${markersJson};
          var container = document.getElementById('map');
          var seoul = new kakao.maps.LatLng(37.5665, 126.978);
          var first = markers.length ? new kakao.maps.LatLng(markers[0].lat, markers[0].lng) : seoul;
          var map = new kakao.maps.Map(container, {
            center: first,
            level: 5,
            draggable: true,
            zoomable: true
          });
          var bounds = new kakao.maps.LatLngBounds();
          var path = [];
          markers.forEach(function (m) {
            var pos = new kakao.maps.LatLng(m.lat, m.lng);
            new kakao.maps.Marker({ map: map, position: pos, title: m.name || '' });
            path.push(pos);
            bounds.extend(pos);
          });
          if (${route ? 'true' : 'false'} && path.length > 1) {
            new kakao.maps.Polyline({
              map: map,
              path: path,
              strokeWeight: 4,
              strokeColor: '${routeColor}',
              strokeOpacity: 0.9
            });
          }
          if (markers.length > 0) map.setBounds(bounds);
          post('ready');
        } catch (e) {
          post('error');
        }
      });
    } catch (e) {
      post('error');
    }
  </script>
</body>
</html>`;
}
