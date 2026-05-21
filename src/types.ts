/**
 * DanyaBooking Type Definitions
 */

export interface LatLng {
  lat: number;
  lng: number;
}

export type UserRole = 'farmer' | 'owner' | 'admin';

export interface UserProfile {
  fullName: string;
  mobileNumber: string;
  village: string;
  taluk: string;
  district: string;
  state: string;
  completeAddress: string;
  profilePhoto?: string;
  aadhaarNumber?: string;
  referralCode?: string;
  rewardPoints: number;
  savedSign?: string; // Base64
}

export interface MachinePhotos {
  before?: string; // base64
  during?: string; // base64
  after?: string; // base64
}

export interface CropPrice {
  cropName: string; // e.g. "Togari", "Jola"
  pricePerAcre: number;
  pricePerHour?: number;
}

export interface Review {
  id: string;
  farmerName: string;
  rating: number; // 1-5
  comment: string;
  date: string;
  photo?: string;
}

export interface Machine {
  id: string;
  name: string;
  type: string; // e.g., "Combuster Rashi Machine", "Harvester", "De-husker"
  vehicleNumber: string;
  ownerName: string;
  ownerMobile: string;
  ownerId: string;
  aadhaarVerified: boolean;
  photos: string[]; // Base64 or placeholder URLs
  availabilityStatus: 'online' | 'offline'; // maps to owner sharing status
  basePricing: CropPrice[];
  minCharge: number;
  travelCharges: number;
  rating: number;
  location: LatLng;
  reviews: Review[];
}

export interface Signatures {
  farmerSignature?: string; // Base64
  ownerSignature?: string; // Base64
}

export type BookingStatus = 
  | 'pending'       // just created
  | 'accepted'      // owner accepted
  | 'rejected'      // owner rejected
  | 'started'       // owner heading to farmer/started work
  | 'photo_uploaded' // owner uploaded work photos
  | 'completed'     // owner completed work, signature requested & invoice compiled
  | 'payment_pending' // waiting for payment and screenshot upload
  | 'verify_pending' // screenshot uploaded, owner verification pending
  | 'paid';         // payment verified, transaction closed

export interface Booking {
  id: string;
  invoiceNumber?: string;
  farmerId: string;
  farmerName: string;
  farmerMobile: string;
  village: string;
  taluk: string;
  district: string;
  state: string;
  address: string;
  landmark: string;
  cropType: string;
  acres: number;
  preferredDate: string;
  preferredTime: string;
  
  machineId: string;
  machineName: string;
  vehicleNumber: string;
  ownerName: string;
  ownerMobile: string;
  ownerId: string;
  
  // Dynamic Pricing determined at accept/setup time
  ratePerAcre: number;
  travelCharges: number;
  minCharge: number;
  totalAmount: number;
  
  status: BookingStatus;
  
  // Real-time tracking attributes
  farmerLocation: LatLng;
  machineLocation: LatLng;
  distanceKm: number; // calculated
  etaMinutes: number; // estimated time of arrival
  
  // Screenshot upload details
  paymentMethod?: string;
  transactionId?: string;
  screenshotUrl?: string; // Base64
  paymentAmount?: number;
  paymentDateTime?: string;
  rejectionReason?: string;
  
  // Signatures
  signatures?: Signatures;
  
  // Photos of the work
  workPhotos?: MachinePhotos;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface WeatherData {
  temperature: number;
  condition: string;
  rainForecast: string; // e.g., "15% chance of light drizzle", "No Rain"
  windSpeed: number; // km/h
  humidity: number; // %
  harvestRecommendation: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  suggestions?: string[];
  voiceUrl?: string; // base64 or representation for speech
  audioResponse?: string; // Base64 raw audio standard for playback
}

export interface ActivityLog {
  id: string;
  userId: string;
  role: UserRole;
  action: string;
  timestamp: string;
}
