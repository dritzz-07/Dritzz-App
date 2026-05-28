export type VehicleType = 'hatchback' | 'sedan' | 'suv' | 'muv';

export interface Package {
  id: string;
  name: string;
  tagline: string;
  price: Record<VehicleType, number>;
  icon: string;
  features: string[];
  featured?: boolean;
}

export interface SavedVehicle {
  id: string;
  userId: string;
  type: VehicleType;
  brand: string;
  model: string;
  vehicleNumber: string;
  color: string;
  parkingSlot: string;
  society: string;
  isDefault?: boolean;
}

export interface SelectedVehicleForBooking {
  vehicleId?: string; // id of saved vehicle or just custom
  type: VehicleType;
  brand?: string;
  model?: string;
  vehicleNumber?: string;
  color?: string;
  date: string;
  timeSlot: string;
  packageId: string;
  price: number;
}

export interface BookingDetails {
  userId?: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  // single legacy fields
  date?: string;
  timeSlot?: string;
  vehicleType?: VehicleType;
  packageId?: string;
  // multi vehicle booking
  vehicles: SelectedVehicleForBooking[];
  notes: string;
  latitude?: number;
  longitude?: number;
  amount?: number;
  subscriptionId?: string;
}

export interface Subscription {
  id?: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  packageId: string;
  vehicles: SelectedVehicleForBooking[];
  status: 'active' | 'expired' | 'completed' | 'cancelled';
  totalWashes: number;
  usedWashes: number;
  remainingWashes: number;
  expiresAt: any;
  createdAt: any;
  paymentId?: string;
}

export interface BookingDocument extends BookingDetails {
  id?: string;
  refId: string;
  paymentMethod: string;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  createdAt: any;
  updatedAt: any;
}
