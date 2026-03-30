export interface Pin {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description?: string;
  country?: string;
}

export interface RouteResult {
  optimizedOrder: Pin[];
  totalDistance: string;
  estimatedTime: string;
  estimatedCost: string;
  tips: string[];
  segments: RouteSegment[];
}

export interface RouteSegment {
  from: string;
  to: string;
  distance: string;
  duration: string;
  transport: string;
  cost: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  category: string;
}

export interface CountryWarning {
  category: string;
  icon: string;
  title: string;
  description: string;
  level: 'low' | 'medium' | 'high';
}

export interface CountryInfo {
  name: string;
  code: string;
  checklist: Omit<ChecklistItem, 'id' | 'checked'>[];
  warnings: CountryWarning[];
}
