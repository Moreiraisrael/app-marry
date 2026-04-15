export type UserType = 'client' | 'consultant';
export type WardrobeStatus = 'keep' | 'donate' | 'repair' | 'pending';
export type QuizType = 'style' | 'archetype' | 'color';
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  user_type: UserType | null;
  consultant_id: string | null;
  style_archetypes: string[] | null;
  season: string | null;
  body_shape: 'Ampulheta' | 'Triângulo' | 'Triângulo Invertido' | 'Retângulo' | 'Oval' | null;
  body_measurements: Record<string, number> | null;
  face_shape: 'Oval' | 'Redondo' | 'Quadrado' | 'Coração' | 'Diamante' | 'Longo' | 'Triangular' | null;
  facial_measurements: Record<string, number> | null;
  created_at: string;
}

export interface WardrobeItem {
  id: string;
  client_id: string;
  photo_url: string;
  category: string | null;
  subcategory: string | null;
  color: string | null;
  notes: string | null;
  season_match: boolean;
  ai_analysis: string | null;
  status: WardrobeStatus;
  created_at: string;
}

export interface Quiz {
  id: string;
  client_id: string;
  quiz_type: QuizType;
  answers: Record<string, unknown>;
  result_text: string | null;
  status: 'pending' | 'approved';
  created_at: string;
}

export interface QuizWithProfile extends Quiz {
  profiles: {
    full_name: string | null;
  } | null;
}

export interface Appointment {
  id: string;
  client_id: string;
  consultant_id: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  notes: string | null;
  created_at: string;
}

export interface PartnerStore {
  id: string;
  name: string;
  logo_url: string | null;
  store_link: string | null;
  category: string | null;
  is_active: boolean;
}

export interface ShoppingList {
  id: string;
  client_id: string;
  consultant_id: string;
  title: string;
  items: Record<string, unknown>[]; // Array of product objects
  total_amount: number;
  status: 'active' | 'archived';
  created_at: string;
}

export interface ColorAnalysisRequest {
  id: string;
  client_id: string;
  consultant_id: string;
  client_photo: string;
  additional_photos: string[];
  ai_suggested_season: string | null;
  consultant_season: string | null;
  consultant_notes: string | null;
  ai_analysis_data: Record<string, unknown> | null;
  status: 'pending' | 'approved';
  created_at: string;
}

export interface Ebook {
  id: string;
  client_id: string;
  consultant_id: string;
  title: string;
  content: Record<string, unknown>;
  pdf_url: string | null;
  created_at: string;
}

export interface BiotypeRequest {
  id: string;
  client_id: string;
  consultant_id: string;
  front_photo: string | null;
  side_photo: string | null;
  ai_suggested_shape: 'Ampulheta' | 'Triângulo' | 'Triângulo Invertido' | 'Retângulo' | 'Oval' | null;
  consultant_shape: 'Ampulheta' | 'Triângulo' | 'Triângulo Invertido' | 'Retângulo' | 'Oval' | null;
  consultant_notes: string | null;
  ai_analysis_data: Record<string, unknown> | null;
  status: 'pending' | 'approved';
  created_at: string;
}

export interface VisagismRequest {
  id: string;
  client_id: string;
  consultant_id: string;
  front_face_photo: string | null;
  side_face_photo: string | null;
  ai_suggested_shape: 'Oval' | 'Redondo' | 'Quadrado' | 'Coração' | 'Diamante' | 'Longo' | 'Triangular' | null;
  consultant_shape: 'Oval' | 'Redondo' | 'Quadrado' | 'Coração' | 'Diamante' | 'Longo' | 'Triangular' | null;
  consultant_notes: string | null;
  ai_analysis_data: Record<string, unknown> | null;
  status: 'pending' | 'approved';
  created_at: string;
}
