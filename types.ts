
// Enums
export enum UserRole {
  CLIENT = 'CLIENT',
  PT = 'PT'
}

export enum Language {
  EN = 'EN',
  DK = 'DK'
}

export enum RequestStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  REJECTED = 'rejected'
}

export enum FitnessLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced'
}

// Entities
export interface ClientHealthData {
  weight?: number; // kg
  height?: number; // cm
  goals?: string;
  fitnessLevel?: FitnessLevel;
  medicalHistory?: string; // Optional text
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  photoUrl: string;
  // PT Specific
  specialties?: string[];
  bio?: string; // Stored as JSON string or object handling both langs
  location?: string;
  hourlyRate?: number;
  // Client Specific
  preferredLanguage?: Language;
  activePtId?: string | null;
  healthData?: ClientHealthData; // New field for Client Health Data
  ptNotes?: string; // Private notes for the PT about this client
}

export interface PTRequest {
  id: string;
  clientId: string;
  ptId: string;
  status: RequestStatus;
  createdAt: number;
}

export interface Plan {
  id: string;
  clientId: string;
  ptId: string;
  title: string;
  status: 'active' | 'completed';
  startDate: string;
  endDate: string;
  workouts: Workout[];
  diet: Diet | null;
}

export interface Workout {
  id: string;
  dayOfWeek: string;
  title: string;
  exercises: string[]; // Simplified for MVP
  mediaLink?: string;
}

export interface Diet {
  id: string;
  title: string;
  focus: string; // e.g., Cutting
  meals: Meal[];
}

export interface Meal {
  id: string;
  name: string;
  calories: number;
  photoUrl?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string; // PT or Client ID
  receiverId: string;
  body: string;
  timestamp: number;
}
