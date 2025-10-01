export interface VehicleMake {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface VehicleType {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FuelType {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ListingType = 'RENT' | 'SELL';
export type VehicleStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'PUBLISHED' | 'SUSPENDED' | 'ARCHIVED';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface Vehicle {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  sellerId: string;
  makeId?: number;
  typeId?: number;
  fuelTypeId?: number;
  
  // Basic Vehicle Info
  modelName?: string;
  year?: number;
  vinNumber?: string;
  pricePerDay: number;
  description?: string;
  isActive: boolean;
  
  // Approval Workflow
  status: VehicleStatus;
  submittedAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  publishedAt?: Date;
  isPublished: boolean;
  currentApprovalId?: string;
  
  // Registration & Status
  isRegistered: boolean;
  odometer?: number;
  enginePower?: string;
  emissionClass?: string;
  transmission?: string;
  towbarType?: string;
  numberOfSeats?: number;
  numberOfKeys?: number;
  vehicleStatus?: string;
  isImported: boolean;
  firstRegistration?: Date;
  trafficDate?: Date;
  lastInspection?: Date;
  inspectionValidTo?: Date;
  annualTax?: number;
  annualTaxPaidTo?: Date;
  annualRoadFee?: number;
  category?: string;
  
  // Dimensions & Weights
  kerbWeight?: number;
  grossVehicleWeight?: number;
  maxLoadWeight?: number;
  allowedLoadWeight?: number;
  maxTrailerWeight?: number;
  maxCombinedWeight?: number;
  length?: number;
  width?: number;
  height?: number;
  cargoCompartmentLength?: number;
  axleDistance?: string;
  
  // Features & Equipment
  hasAC: boolean;
  hasACC: boolean;
  hasCentralLock: boolean;
  hasElectricWindows: boolean;
  hasABS: boolean;
  hasDigitalTachograph: boolean;
  hasTailLift: boolean;
  hasDieselHeater: boolean;
  hasSunroof: boolean;
  hasRefrigerator: boolean;
  hasCoffeeMachine: boolean;
  hasExtraLights: boolean;
  hasTruxWildbar: boolean;
  hasCompartmentHeater: boolean;
  
  // Condition & Location
  usageInfo?: string;
  knownRemarks?: string;
  serviceHistory?: string;
  startDriveStatus?: string;
  city?: string;
  region?: string;
  
  // Environmental
  carbonFootprint?: number;
  
  // Media
  images: string[];
  videoTourUrl?: string;
  
  // Other
  auctionId?: string;
  reservationPrice?: number;
  vatStatus?: string;
  listingType: ListingType;
  
  // Relations
  make?: VehicleMake;
  type?: VehicleType;
  fuelType?: FuelType;
  currentApproval?: VehicleApproval;
  approvals?: VehicleApproval[];
  availabilities?: VehicleAvailability[];
}

export interface VehicleApproval {
  id: string;
  vehicleId: string;
  reviewerId?: string;
  status: ApprovalStatus;
  comments?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  vehicle?: Vehicle;
  reviewer?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface VehicleAvailability {
  id: string;
  vehicleId: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
  isBooked: boolean;
  bookingId?: string;
  price?: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  vehicle?: Vehicle;
  booking?: Booking;
}

export interface Booking {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  vehicleId: string;
  buyerId: string;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  isPaid: boolean;
  isActive: boolean;
  status: BookingStatus;
  
  // Relations
  vehicle?: Vehicle;
  buyer?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Payment {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  bookingId: string;
  amount: number;
  paymentStatus: PaymentStatus;
  isActive: boolean;
  stripePaymentIntentId?: string;
}

// Form types for creating/updating
export interface CreateVehicleMakeData {
  name: string;
}

export interface CreateVehicleTypeData {
  name: string;
}

export interface CreateFuelTypeData {
  name: string;
}

export interface CreateVehicleData {
  // Basic Info
  makeId?: number;
  typeId?: number;
  fuelTypeId?: number;
  modelName?: string;
  year?: number;
  vinNumber?: string;
  pricePerDay: number;
  description?: string;
  listingType: ListingType;
  
  // Registration & Status
  isRegistered?: boolean;
  odometer?: number;
  enginePower?: string;
  emissionClass?: string;
  transmission?: string;
  towbarType?: string;
  numberOfSeats?: number;
  numberOfKeys?: number;
  vehicleStatus?: string;
  isImported?: boolean;
  firstRegistration?: Date;
  trafficDate?: Date;
  lastInspection?: Date;
  inspectionValidTo?: Date;
  annualTax?: number;
  annualTaxPaidTo?: Date;
  annualRoadFee?: number;
  category?: string;
  
  // Dimensions & Weights
  kerbWeight?: number;
  grossVehicleWeight?: number;
  maxLoadWeight?: number;
  allowedLoadWeight?: number;
  maxTrailerWeight?: number;
  maxCombinedWeight?: number;
  length?: number;
  width?: number;
  height?: number;
  cargoCompartmentLength?: number;
  axleDistance?: string;
  
  // Features & Equipment
  hasAC?: boolean;
  hasACC?: boolean;
  hasCentralLock?: boolean;
  hasElectricWindows?: boolean;
  hasABS?: boolean;
  hasDigitalTachograph?: boolean;
  hasTailLift?: boolean;
  hasDieselHeater?: boolean;
  hasSunroof?: boolean;
  hasRefrigerator?: boolean;
  hasCoffeeMachine?: boolean;
  hasExtraLights?: boolean;
  hasTruxWildbar?: boolean;
  hasCompartmentHeater?: boolean;
  
  // Condition & Location
  usageInfo?: string;
  knownRemarks?: string;
  serviceHistory?: string;
  startDriveStatus?: string;
  city?: string;
  region?: string;
  
  // Environmental
  carbonFootprint?: number;
  
  // Media
  images?: string[];
  videoTourUrl?: string;
  
  // Other
  auctionId?: string;
  reservationPrice?: number;
  vatStatus?: string;
}

export interface CreateBookingData {
  vehicleId: string;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
}

export interface ApprovalActionData {
  status: ApprovalStatus;
  comments?: string;
}

export interface SetAvailabilityData {
  vehicleId: string;
  date: Date;
  timeSlots: {
    startTime: Date;
    endTime: Date;
    isAvailable: boolean;
    price?: number;
  }[];
}

export interface SubmitForApprovalData {
  vehicleId: string;
}

// Utility types for restricted editing
export interface RestrictedVehicleFields {
  // Fields that cannot be edited once approved
  readonly makeId?: number;
  readonly typeId?: number;
  readonly fuelTypeId?: number;
  readonly modelName?: string;
  readonly year?: number;
  readonly vinNumber?: string;
  readonly images?: string[];
  
  // Fields that can always be edited
  pricePerDay: number;
  description?: string;
  usageInfo?: string;
  knownRemarks?: string;
  serviceHistory?: string;
  city?: string;
  region?: string;
}

export interface VehicleStatusInfo {
  status: VehicleStatus;
  canEdit: boolean;
  canSubmit: boolean;
  canPublish: boolean;
  canSetAvailability: boolean;
  restrictedFields: string[];
  statusMessage: string;
}