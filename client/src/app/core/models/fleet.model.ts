export interface FleetVehicle {
  _id: string;
  name: string;
  image: string;
  passengers: number;
  luggage: number;
  features: string[];
  description: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
