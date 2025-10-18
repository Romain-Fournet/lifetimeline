export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
}

export interface Event {
  id: string;
  userId: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  datePrecision: "exact" | "month" | "year" | "decade";
  category: EventCategory;
  location?: string;
  latitude?: number;
  longitude?: number;
  photos: Photo[];
  tags: Tag[];
  createdAt: Date;
  updatedAt: Date;
}

export type EventCategory =
  | "travel"
  | "work"
  | "housing"
  | "vehicle"
  | "relationship"
  | "milestone"
  | "other";

export interface Photo {
  id: string;
  eventId: string;
  url: string;
  order: number;
  caption?: string;
  exifDate?: Date;
}

export interface Tag {
  id: string;
  userId: string;
  name: string;
  color: string;
}

export interface LifeContext {
  id: string;
  userId: string;
  type: "housing" | "work" | "vehicle" | "relationship";
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  address?: string;
  metadata?: Record<string, unknown>;
}
