import { ServiceType, PaymentMethod } from '../models/booking.model';

export const COMPANY = {
  name: 'Solnet Limo',
  tagline: 'Elite Transportation Service',
  slogan: 'Create an Elegant Impression & a Memory for the Lifetime!',
  phone: '970-473-1479',
  phoneHref: 'tel:9704731479',
  email: 'hello@solnetlimo.com',
  emailHref: 'mailto:hello@solnetlimo.com',
  availability: '24/7 Service',
} as const;

export const SERVICE_TYPES: ServiceType[] = [
  'Wedding',
  'Prom',
  'Homecoming',
  'Graduation',
  'Birthday',
  'Anniversary',
  'Conference',
  'Airport Transportation',
  'Hotel Transportation',
  'Restaurant Transportation',
  'Club Transportation',
  'Theater Transportation',
  'Cinema Transportation',
  'Cruise Transportation',
  'Downtown Transportation',
  'Medical Center Transportation',
  'Anywhere to Anywhere',
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  'Visa',
  'Mastercard',
  'American Express',
  'Discover',
  'Cash App',
  'Zelle',
];

export const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Services', path: '/services' },
  { label: 'Fleet', path: '/fleet' },
  { label: 'Booking', path: '/booking' },
  { label: 'Contact', path: '/contact' },
  { label: 'FAQ', path: '/faq' },
] as const;

export const FAQ_ITEMS = [
  {
    question: 'How do I book a limo?',
    answer: 'You can book online through our booking form, call us at 970-473-1479, or email us at hello@solnetlimo.com. We are available 24/7 to assist you.',
  },
  {
    question: 'How far in advance should I book?',
    answer: 'We recommend booking at least 24-48 hours in advance for most services. For weddings, proms, and special events, booking 2-4 weeks ahead ensures availability.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept Visa, Mastercard, American Express, Discover, Cash App, and Zelle for your convenience.',
  },
  {
    question: 'Do you track flights for airport pickups?',
    answer: 'Yes! We track your flight in real time to adjust for delays or early arrivals, ensuring we are there when you land.',
  },
  {
    question: 'Is the service available 24/7?',
    answer: 'Absolutely. Solnet Limo operates 24 hours a day, 7 days a week, including holidays.',
  },
  {
    question: 'Can I request a specific vehicle?',
    answer: 'Yes, you can select your preferred vehicle type when booking. Vehicle availability is subject to confirmation.',
  },
  {
    question: 'What areas do you serve?',
    answer: 'We serve the local area and beyond — from airport runs to cross-city trips. As our slogan says, we go Anywhere to Anywhere!',
  },
  {
    question: 'Is there a cancellation policy?',
    answer: 'Please contact us as soon as possible if you need to cancel or modify your booking. We understand plans change and will work with you.',
  },
  {
    question: 'Are your drivers professional and licensed?',
    answer: 'All our chauffeurs are fully licensed, background-checked, experienced professionals who prioritize your safety and comfort.',
  },
  {
    question: 'Can I make special requests?',
    answer: 'Of course. You can include special requests in the notes field when booking — we will do our best to accommodate them.',
  },
] as const;
