import { Pin, RouteResult } from '../types';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// API 키는 환경변수로 관리 (개발 중에는 직접 입력)
let apiKey = '';

export function setGeminiApiKey(key: string) {
  apiKey = key;
}

export function getGeminiApiKey(): string {
  return apiKey;
}

// 간단한 캐시 (동일 경로 요청 시 API 호출 절감)
const routeCache = new Map<string, RouteResult>();

function getCacheKey(pins: Pin[]): string {
  return pins
    .map((p) => `${p.latitude.toFixed(4)},${p.longitude.toFixed(4)}`)
    .sort()
    .join('|');
}

export async function getOptimizedRoute(pins: Pin[]): Promise<RouteResult> {
  if (pins.length < 2) {
    throw new Error('최소 2개 이상의 장소를 선택해주세요.');
  }

  if (!apiKey) {
    throw new Error('Gemini API 키를 설정해주세요.');
  }

  const cacheKey = getCacheKey(pins);
  const cached = routeCache.get(cacheKey);
  if (cached) return cached;

  const pinDescriptions = pins
    .map((p, i) => `${i + 1}. ${p.title} (위도: ${p.latitude}, 경도: ${p.longitude})`)
    .join('\n');

  const prompt = `당신은 여행 경로 최적화 전문가입니다. 아래 여행지들의 최적 방문 순서를 추천해주세요.

여행지 목록:
${pinDescriptions}

다음 JSON 형식으로만 응답하세요 (마크다운 코드블록 없이 순수 JSON만):
{
  "optimizedOrder": [원래 목록의 인덱스 순서, 예: [0, 2, 1, 3]],
  "totalDistance": "총 이동 거리 (예: 약 150km)",
  "estimatedTime": "총 예상 소요 시간 (예: 약 5시간)",
  "estimatedCost": "예상 교통비 (원화, 예: 약 50,000원)",
  "tips": ["여행 팁1", "여행 팁2", "여행 팁3"],
  "segments": [
    {
      "from": "출발지명",
      "to": "도착지명",
      "distance": "거리",
      "duration": "소요시간",
      "transport": "추천 교통수단",
      "cost": "예상 비용"
    }
  ]
}

비용, 거리, 시간을 종합적으로 고려하여 가장 효율적인 경로를 추천하세요.`;

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API 오류: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('AI 응답을 받지 못했습니다.');
  }

  // JSON 파싱 (코드블록 제거)
  const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const parsed = JSON.parse(jsonStr);

  const result: RouteResult = {
    optimizedOrder: parsed.optimizedOrder.map((idx: number) => pins[idx]),
    totalDistance: parsed.totalDistance,
    estimatedTime: parsed.estimatedTime,
    estimatedCost: parsed.estimatedCost,
    tips: parsed.tips || [],
    segments: parsed.segments || [],
  };

  routeCache.set(cacheKey, result);
  return result;
}
