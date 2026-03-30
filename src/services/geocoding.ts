export interface SearchResult {
  id: string;
  name: string;
  displayName: string;
  latitude: number;
  longitude: number;
  type: string;
}

// Nominatim (OpenStreetMap) 무료 지오코딩 API 사용
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

let lastRequestTime = 0;

export async function searchPlaces(query: string): Promise<SearchResult[]> {
  if (!query.trim() || query.trim().length < 2) return [];

  // Nominatim 정책: 초당 1회 제한
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < 1000) {
    await new Promise((resolve) => setTimeout(resolve, 1000 - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();

  const params = new URLSearchParams({
    q: query,
    format: 'json',
    addressdetails: '1',
    limit: '8',
    'accept-language': 'ko',
  });

  const response = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: {
      'User-Agent': 'TravelApp/1.0',
    },
  });

  if (!response.ok) {
    throw new Error('검색에 실패했습니다.');
  }

  const data = await response.json();

  return data.map((item: any) => ({
    id: item.place_id.toString(),
    name: item.name || item.display_name.split(',')[0],
    displayName: item.display_name,
    latitude: parseFloat(item.lat),
    longitude: parseFloat(item.lon),
    type: item.type,
  }));
}
