require('./config/env');
const connectDB = require('./config/db');
const AdminUser = require('./models/AdminUser');
const Service = require('./models/Service');
const FleetVehicle = require('./models/FleetVehicle');
const PricingSetting = require('./models/PricingSetting');

const services = [
  { title: 'Wedding', description: 'Make your special day unforgettable with our premium wedding transportation. Arrive in style with our elegant fleet.', icon: 'favorite', sortOrder: 1 },
  { title: 'Prom', description: 'Arrive at prom in style. Create memories that last a lifetime with our luxurious prom limo service.', icon: 'star', sortOrder: 2 },
  { title: 'Homecoming', description: 'Celebrate homecoming in luxury. We ensure a safe, stylish, and memorable night for you and your friends.', icon: 'school', sortOrder: 3 },
  { title: 'Graduation', description: 'Mark your milestone with elegance. Our graduation transportation adds class to your special achievement.', icon: 'workspace_premium', sortOrder: 4 },
  { title: 'Birthday', description: 'Turn your birthday into a VIP experience. Celebrate in style with our premium birthday party transportation.', icon: 'cake', sortOrder: 5 },
  { title: 'Anniversary', description: 'Celebrate your love with elegance. Our anniversary transportation creates a romantic and memorable evening.', icon: 'diamond', sortOrder: 6 },
  { title: 'Conference', description: 'Professional corporate transportation for conferences, meetings, and business events. Punctual, reliable, and executive-class.', icon: 'business_center', sortOrder: 7 },
  { title: 'Airport Transportation', description: 'Stress-free airport pickups and drop-offs. We track your flight and ensure on-time, comfortable transportation.', icon: 'flight', sortOrder: 8 },
  { title: 'Hotel Transportation', description: 'Seamless hotel transfers with door-to-door service. Your comfort is our priority from arrival to departure.', icon: 'hotel', sortOrder: 9 },
  { title: 'Restaurant Transportation', description: 'Arrive at your favorite restaurant in style. Perfect for date nights, business dinners, and special occasions.', icon: 'restaurant', sortOrder: 10 },
  { title: 'Club Transportation', description: 'Safe, stylish transportation to and from the club. Party with confidence knowing your ride is secured.', icon: 'nightlife', sortOrder: 11 },
  { title: 'Theater Transportation', description: 'Enjoy your evening at the theater without parking worries. Arrive relaxed and ready for the performance.', icon: 'theater_comedy', sortOrder: 12 },
  { title: 'Cinema Transportation', description: 'Make movie night special. Comfortable transportation to the cinema for a complete luxury experience.', icon: 'local_movies', sortOrder: 13 },
  { title: 'Cruise Transportation', description: 'Reliable cruise terminal transportation. We handle your luggage and ensure you never miss your departure.', icon: 'directions_boat', sortOrder: 14 },
  { title: 'Downtown Transportation', description: 'Explore the city in style. Our downtown transportation service is perfect for sightseeing and city tours.', icon: 'location_city', sortOrder: 15 },
  { title: 'Medical Center Transportation', description: 'Compassionate and reliable medical center transportation. We prioritize your comfort during health appointments.', icon: 'local_hospital', sortOrder: 16 },
  { title: 'Anywhere to Anywhere', description: 'Whatever your destination, we get you there. No trip is too far or too near — we go anywhere you need.', icon: 'explore', sortOrder: 17 },
];

const fleet = [
  {
    name: 'Premium Black SUV',
    slug: 'black-suv',
    image: 'assets/images/fleet/black-suv/black-suv.jpg',
    passengers: 6,
    luggage: 6,
    description: 'Our flagship premium black SUV offers unmatched comfort and style for any occasion. Featuring leather seating, climate control, and premium amenities.',
    features: ['Leather Seats', 'Climate Control', 'Premium Sound System', 'Wi-Fi Available', 'USB Charging', 'Tinted Windows', 'Professional Chauffeur'],
    sortOrder: 1,
  },
  {
    name: 'Executive Stretch Limousine',
    slug: 'stretch-limo',
    image: 'assets/images/fleet/stretch-limo/stretch-limo.jpg',
    passengers: 10,
    luggage: 6,
    description: 'The classic stretch limousine for weddings, proms, and special events. Luxury bar, ambient lighting, and premium entertainment system included.',
    features: ['Luxury Bar', 'Ambient Lighting', 'Entertainment System', 'Leather Seating', 'Climate Control', 'Privacy Partition', 'Professional Chauffeur'],
    sortOrder: 2,
  },
  {
    name: 'Luxury Sedan',
    slug: 'luxury-sedan',
    image: 'assets/images/fleet/luxury-sedan/luxury-sedan.jpg',
    passengers: 4,
    luggage: 4,
    description: 'Ideal for executive airport transfers and business travel. Discreet, comfortable, and professionally appointed.',
    features: ['Premium Leather', 'Quiet Cabin', 'Wi-Fi Available', 'USB Charging', 'Bottled Water', 'Professional Chauffeur'],
    sortOrder: 3,
  },
  {
    name: 'Luxury Van / Sprinter',
    slug: 'luxury-van',
    image: 'assets/images/fleet/luxury-van/luxury-van.jpg',
    imageFit: 'contain',
    passengers: 14,
    luggage: 14,
    description: 'Perfect for group transportation, corporate events, and large parties. Spacious, comfortable, and professionally equipped.',
    features: ['Captain Chairs', 'Climate Control', 'Entertainment System', 'USB Charging', 'Ample Luggage Space', 'Professional Chauffeur'],
    sortOrder: 4,
  },
];

const seed = async () => {
  await connectDB();

  // Clear existing data
  await Service.deleteMany({});
  await FleetVehicle.deleteMany({});

  // Seed services
  for (const svc of services) {
    await Service.create(svc);
  }
  console.log(`Seeded ${services.length} services`);

  // Seed fleet
  for (const vehicle of fleet) {
    await FleetVehicle.create(vehicle);
  }
  console.log(`Seeded ${fleet.length} fleet vehicles`);

  // Seed pricing settings if none exist
  const existingPricing = await PricingSetting.findOne({ isActive: true });
  if (!existingPricing) {
    await PricingSetting.create({
      mileageThreshold: 30,
      shortDistanceRate: 6,
      longDistanceRate: 3,
      currency: 'USD',
      isActive: true,
      updatedBy: 'seed',
    });
    console.log('Pricing settings seeded: threshold=30mi, short=$6/mi, long=$3/mi');
  } else {
    console.log('Pricing settings already exist, skipping.');
  }

  // Create admin user if not exists.
  // Pass the initial password via ADMIN_SEED_PASSWORD env var:
  //   ADMIN_SEED_PASSWORD='YourStrongPassword!' node src/seed.js
  const adminPassword = process.env.ADMIN_SEED_PASSWORD;
  if (!adminPassword) {
    console.error('ADMIN_SEED_PASSWORD env var is required to seed the admin user.');
    console.error('  Usage: ADMIN_SEED_PASSWORD="YourStrongPassword!" node src/seed.js');
    process.exit(1);
  }

  const existingAdmin = await AdminUser.findOne({ email: 'admin@solnetlimo.com' });
  if (!existingAdmin) {
    await AdminUser.create({
      name: 'Solomon',
      email: 'admin@solnetlimo.com',
      password: adminPassword,
      role: 'superadmin',
    });
    console.log('Admin user created: admin@solnetlimo.com');
    console.log('IMPORTANT: Change the admin password after first login!');
  } else {
    console.log('Admin user already exists, skipping.');
  }

  console.log('Seed complete!');
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
