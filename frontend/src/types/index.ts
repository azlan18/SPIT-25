// src/types/index.ts
export interface Store {
  id: string;
  name: string;
  address: string;
  rating?: number;
  types: string[];
  vicinity: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export interface MapProps {
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
}

export type StoreType = "zero_waste" | "refill_station" | "ethical_market" | "all";

export interface SearchBarProps {
  onSearch: (location: { lat: number; lng: number }, query?: string) => void;
  googleApi: typeof google;
}

export interface TaskUpdate {
  _id?: string  // MongoDB ID
  id: string
  taskId: string
  date: string
  status: 'todo' | 'in-progress' | 'completed'
  notes: string
  timeStamp: string
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  date: string;
  companyId: string;
  notes?: string;
  updates?: Array<{
    id: string;
    status: 'todo' | 'in-progress' | 'completed';
    notes: string;
    date: string;
    timeStamp: string;
  }>;
}

export interface Company {
  _id: string;
  name: string;
  industry: string;
  status: 'active' | 'on-hold' | 'completed';
  description?: string;
} 