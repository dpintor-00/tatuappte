export type UserRole = 'customer' | 'tattooist' | 'admin';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  phone?: string;
  bio?: string;
  avatar_url?: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface TattooDesignData {
  imageUrl?: string;
  widthCm: number;
  heightCm: number;
  rotation: number;
  opacity: number;
  bodyLocation?: string;
  notes?: string;
}

export interface Appointment {
  id: string;
  client_id: string;
  client_name?: string;
  tattooist_id: string;
  tattooist_name?: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  price: number;
  design_data: TattooDesignData;
  created_at?: string;
}

export interface Schedule {
  id: string;
  tattooist_id: string;
  day_of_week: number; // 0 = Domingo, 1 = Lunes, etc.
  day_name?: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export interface TattooQuoteCalculation {
  widthCm: number;
  heightCm: number;
  areaCm2: number;
  complexity: 'simple' | 'medium' | 'detailed' | 'master';
  estimatedHours: number;
  basePriceClp: number;
  hourlyRateClp: number;
  totalPriceClp: number;
}
