export interface FleetVehicle {
  _id: string;
  name: string;
  /** URL-friendly slug used to derive the image path: assets/images/fleet/<slug>/<slug>.jpg */
  slug?: string;
  /** Primary image path — used when slug is not available (e.g. API vehicles) */
  image: string;
  /** CSS object-fit for the card image — defaults to 'cover' if unset */
  imageFit?: 'cover' | 'contain';
  passengers: number;
  luggage: number;
  features: string[];
  description: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export const FALLBACK_FLEET: FleetVehicle[] = [
  {
    _id: 'local-1',
    name: 'Premium Black SUV',
    slug: 'black-suv',
    image: 'assets/images/fleet/black-suv/black-suv.jpg',
    passengers: 6,
    luggage: 6,
    description: 'Our flagship premium black SUV offers unmatched comfort and style for any occasion. Featuring leather seating, climate control, and premium amenities.',
    features: ['Leather Seats', 'Climate Control', 'Premium Sound System', 'Wi-Fi Available', 'USB Charging', 'Tinted Windows', 'Professional Chauffeur'],
    isActive: true,
    sortOrder: 1,
    createdAt: '',
    updatedAt: '',
  },
  {
    _id: 'local-2',
    name: 'Executive Stretch Limousine',
    slug: 'stretch-limo',
    image: 'assets/images/fleet/stretch-limo/stretch-limo.jpg',
    passengers: 10,
    luggage: 6,
    description: 'The classic stretch limousine for weddings, proms, and special events. Luxury bar, ambient lighting, and premium entertainment system included.',
    features: ['Luxury Bar', 'Ambient Lighting', 'Entertainment System', 'Leather Seating', 'Climate Control', 'Privacy Partition', 'Professional Chauffeur'],
    isActive: true,
    sortOrder: 2,
    createdAt: '',
    updatedAt: '',
  },
  {
    _id: 'local-3',
    name: 'Luxury Sedan',
    slug: 'luxury-sedan',
    image: 'assets/images/fleet/luxury-sedan/luxury-sedan.jpg',
    passengers: 4,
    luggage: 4,
    description: 'Ideal for executive airport transfers and business travel. Discreet, comfortable, and professionally appointed.',
    features: ['Premium Leather', 'Quiet Cabin', 'Wi-Fi Available', 'USB Charging', 'Bottled Water', 'Professional Chauffeur'],
    isActive: true,
    sortOrder: 3,
    createdAt: '',
    updatedAt: '',
  },
  {
    _id: 'local-4',
    name: 'Luxury Van / Sprinter',
    slug: 'luxury-van',
    image: 'assets/images/fleet/luxury-van/luxury-van.jpg',
    imageFit: 'contain',
    passengers: 14,
    luggage: 14,
    description: 'Perfect for group transportation, corporate events, and large parties. Spacious, comfortable, and professionally equipped.',
    features: ['Captain Chairs', 'Climate Control', 'Entertainment System', 'USB Charging', 'Ample Luggage Space', 'Professional Chauffeur'],
    isActive: true,
    sortOrder: 4,
    createdAt: '',
    updatedAt: '',
  },
];
