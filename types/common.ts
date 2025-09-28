export type Timestamp = string;

export type UserRole = 'BUYER' | 'SELLER' | 'ADMIN';
export type UserType = 'INDIVIDUAL' | 'FLEET';

export interface SignupFormData {
  // Step 1: Role Selection
  role: UserRole;
  userType: UserType;
  
  // Step 2: Basic Info
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  
  // Step 3: Contact Info
  phoneNumber: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  
  // Step 4: Company Info (for fleet users)
  companyName?: string;
}
