import { Package } from './types';

export const PACKAGES: Package[] = [
  {
    id: 'basic',
    name: 'DRITZZ BASIC',
    tagline: 'Quick exterior refresh',
    price: {
      hatchback: 499,
      sedan: 499,
      suv: 599,
      muv: 599
    },
    icon: 'Droplets',
    features: [
      'Exterior Foam Wash',
      'Tyre Cleaning & Shine',
      'Doorstep Service'
    ]
  },
  {
    id: 'premium',
    name: 'DRITZZ PREMIUM',
    tagline: 'Inside & out, spotless',
    price: {
      hatchback: 699,
      sedan: 699,
      suv: 799,
      muv: 799
    },
    icon: 'Sparkles',
    features: [
      'Exterior Foam Wash',
      'Interior vacuuming',
      'Dashboard & Console detailing',
      'Tyre Cleaning & Polish',
      'Doorstep Service'
    ],
    featured: false
  },
  {
    id: 'monthly',
    name: 'DRITZZ MONTHLY SERVICE',
    tagline: '3 washes monthly + 1 exterior',
    price: {
      hatchback: 1999,
      sedan: 1999,
      suv: 2499,
      muv: 2499
    },
    icon: 'Gem',
    features: [
      '3 Washes Monthly + 1 Exterior Wash',
      'Thorough Interior Vacuum',
      'Dashboard Cleaning',
      'Tyre Polish & Shine',
      'Priority Scheduling'
    ],
    featured: true
  }
];

export const TIME_SLOTS = [
  '8:00 AM – 10:00 AM',
  '10:00 AM – 12:00 PM',
  '12:00 PM – 2:00 PM',
  '2:00 PM – 4:00 PM',
  '4:00 PM – 6:00 PM'
];
