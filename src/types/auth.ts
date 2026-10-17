export interface FarmerUser {
  id: string;
  googleId?: string;
  name: string;
  email: string;
  role: string;
  location: string;
  avatarUrl: string;
  isVerified: boolean;
  acres: number;
}
