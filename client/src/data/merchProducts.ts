export interface DeliveryOption {
  id: 'campus-pickup' | 'soham-dhule' | 'vaibhav-amalner' | 'pan-india';
  name: string;
  shortName: string;
  locationTag: string;
  charge: number;
  agent: string;
  badge: string;
  description: string;
}

export const deliveryOptions: DeliveryOption[] = [
  {
    id: 'campus-pickup',
    name: 'Self-Pickup from SVKM IOT Dhule Campus',
    shortName: 'Campus Pickup (SVKM IOT Dhule)',
    locationTag: 'SVKM IOT DHULE CAMPUS',
    charge: 0,
    agent: 'SCD Dhule Organizing Desk',
    badge: 'FREE PICKUP (₹0)',
    description: 'Collect your order directly from SVKM IOT / STME Campus, Dhule with zero delivery charges.'
  },
  {
    id: 'soham-dhule',
    name: 'Hand delivered by AWS SBGL Soham Chaudhari (ONLY IN DHULE)',
    shortName: 'Hand Delivery by Soham (Dhule)',
    locationTag: 'ONLY IN DHULE',
    charge: 199,
    agent: 'Soham Chaudhari (AWS SBGL)',
    badge: 'DHULE SPECIAL',
    description: 'Direct personal hand delivery within Dhule city limits by AWS Student Builder Group Leader Soham Chaudhari.'
  },
  {
    id: 'vaibhav-amalner',
    name: 'Hand delivered by AWS SBCL Vaibhav Chaudhari (ONLY IN AMALNER)',
    shortName: 'Hand Delivery by Vaibhav (Amalner)',
    locationTag: 'ONLY IN AMALNER',
    charge: 199,
    agent: 'Vaibhav Chaudhari (AWS SBCL)',
    badge: 'AMALNER SPECIAL',
    description: 'Direct personal hand delivery in Amalner by AWS Student Builder Campus Leader Vaibhav Chaudhari.'
  },
  {
    id: 'pan-india',
    name: 'NORMAL DELIVERY (PAN INDIA)',
    shortName: 'Normal Delivery (Pan India)',
    locationTag: 'ALL OVER INDIA',
    charge: 99,
    agent: 'Standard Courier Dispatch',
    badge: 'PAN INDIA COURIER',
    description: 'Fast track postal/courier shipping across all states and postal pin codes in India.'
  }
];

export interface MerchProduct {
  id: 'bag' | 'welcome-kit' | 'combo';
  aliases: string[];
  title: string;
  shortTitle: string;
  tagline: string;
  price: number;
  mrp: number;
  originalPrice?: number;
  savings?: number;
  discountPercentage: number;
  badge: string;
  isPopular?: boolean;
  rating: number;
  reviewsCount: number;
  description: string;
  images: string[];
  highlights: string[];
  specs: { name: string; value: string }[];
  inclusions: string[];
}

export const merchProducts: MerchProduct[] = [
  {
    id: 'bag',
    aliases: ['1', 'bag-bottle', 'scd-bag', 'paddock-bag', 'bag-only'],
    title: 'SCD 2026 Official Bag + Bottle',
    shortTitle: 'Official Bag + Bottle',
    tagline: 'Compact 10L Racing Livery Bag + Cloud Builder Sipper Bottle',
    price: 249,
    mrp: 499,
    discountPercentage: 50,
    badge: 'BAG + BOTTLE',
    rating: 4.9,
    reviewsCount: 142,
    description:
      'The official AWS Student Community Day Dhule 2026 compact 10L paddock bag paired with an exclusive SCD builder sipper bottle. Engineered with durable, lightweight water-resistant canvas, a sleek compartment for tablets and diaries, reinforced seams, and custom racing livery aesthetics for daily commuting, college, and builder essentials.',
    images: [
      '/merch-store/bag/bag01.jpeg',
      '/merch-store/bag/bag02.jpeg',
      '/merch-store/bag/bag03.jpeg'
    ],
    highlights: [
      'Compact 10L lightweight everyday paddock bag',
      'Dedicated compartment for tablet, iPad, diary & notebooks',
      'Official SCD 2026 builder sipper bottle included',
      'Official AWS SCD Dhule 2026 racing livery silkscreen print',
      'Ergonomic dual shoulder straps with reinforced load points',
      'Main zip compartment for gadgets, cables, charger & daily swag'
    ],
    specs: [
      { name: 'Bag Material', value: 'High-Density Water-Resistant Polyester Canvas' },
      { name: 'Bottle', value: 'SCD 2026 Builder Sipper Bottle' },
      { name: 'Capacity', value: '10 Liters (Compact Daypack / Daily Essentials)' },
      { name: 'Closure', value: 'Heavy-Duty Dual Metal Zippers' },
      { name: 'Livery / Print', value: 'AWS SCD Dhule 2026 Special Edition' },
      { name: 'Tablet / Device Fit', value: 'Fits Tablets, iPads, Books & Small Laptops' },
      { name: 'Edition', value: 'Post-Event Collector Batch' }
    ],
    inclusions: [
      '1x Official AWS SCD Dhule 2026 10L Paddock Bag',
      '1x SCD 2026 Builder Sipper Bottle',
      'Official Authenticity & Quality Assurance Tag'
    ]
  },
  {
    id: 'welcome-kit',
    aliases: ['2', 'kit', 'welcomekit', 'swag-kit', 'welcome-kit-only'],
    title: 'SCD 2026 Official Welcome Kit',
    shortTitle: 'Official Welcome Kit',
    tagline: 'Folder File, Diary, 10 F1 Theme Stickers Sheet, Keychain & Lanyard',
    price: 149,
    mrp: 299,
    discountPercentage: 50,
    badge: 'FULL SWAG KIT',
    rating: 4.95,
    reviewsCount: 218,
    description:
      'The exclusive SCD Dhule 2026 welcome swag pack. Includes the official document folder file, cloud architect diary notebook, sticker sheet featuring 10 premium F1 & AWS racing theme inspired stickers, custom SCD metal keychain, and high-density woven lanyard.',
    images: [
      '/merch-store/welcome-kit/welcome-kit00.jpeg',
      '/merch-store/welcome-kit/welcome-kit01.jpeg',
      '/merch-store/welcome-kit/welcome-kit02.jpeg',
      '/merch-store/welcome-kit/welcome-kit03.jpeg'
    ],
    highlights: [
      'Official SCD Dhule 2026 Document & Certificate Folder File',
      'Hardcover Cloud Architect technical diary / notebook',
      'Sticker sheet with 10 premium F1 theme inspired racing decals',
      'SCD Dhule 2026 custom metal keepsake keychain',
      'High-density woven racing paddock lanyard with custom clip',
      'Bonus community builder collectible cards & partner perks'
    ],
    specs: [
      { name: 'Folder File', value: 'Heavy-duty SCD 2026 document holder' },
      { name: 'Diary', value: 'Hardbound technical grid notebook' },
      { name: 'Sticker Sheet', value: '10 Premium F1 racing & AWS decals' },
      { name: 'Keychain', value: 'Die-cast metal SCD 2026 keychain' },
      { name: 'Lanyard', value: 'High-density woven nylon lanyard' },
      { name: 'Edition', value: 'Official SCD Dhule 2026 Keepsake' }
    ],
    inclusions: [
      '1x Official SCD 2026 Folder File',
      '1x Cloud Architect Hardcover Diary',
      '1x Sticker Sheet (10 Premium F1 Inspired Decals)',
      '1x SCD Dhule 2026 Metal Keychain',
      '1x High-Density Woven Paddock Lanyard',
      '1x Community Collector Surprise Perks'
    ]
  },
  {
    id: 'combo',
    aliases: ['3', 'bundle', 'welcomekit-bag', 'combo-pack', 'all-in-one'],
    title: 'SCD 2026 Official Bag + Welcome Kit Combo',
    shortTitle: 'Official Bag + Welcome Kit Combo',
    tagline: 'Bag, Bottle, Folder File, Diary, 10 F1 Stickers, Keychain & Lanyard',
    price: 349,
    originalPrice: 398,
    mrp: 699,
    discountPercentage: 50,
    savings: 49,
    badge: 'BEST VALUE // ALL-IN-ONE',
    isPopular: true,
    rating: 5.0,
    reviewsCount: 380,
    description:
      'The ultimate AWS Student Community Day Dhule 2026 all-in-one commemorative package! Receive the complete heavy-duty Paddock Bag, Builder Sipper Bottle, and the entire Official Welcome Kit (Folder File, Hardbound Diary, 10 F1 Theme Inspired Premium Stickers Sheet, SCD Keychain, and Woven Lanyard) at a special discounted bundle price.',
    images: [
      '/merch-store/Combomerch01.png',
      '/merch-store/welcome-kit/welcome-kit00.jpeg',
      '/merch-store/bag/bag01.jpeg',
      '/merch-store/welcome-kit/welcome-kit01.jpeg',
      '/merch-store/bag/bag02.jpeg',
      '/merch-store/welcome-kit/welcome-kit02.jpeg',
      '/merch-store/bag/bag03.jpeg',
      '/merch-store/welcome-kit/welcome-kit03.jpeg'
    ],
    highlights: [
      '100% Complete Collection: Paddock Bag, Bottle & Full Swag Kit',
      'Special bundle pricing: ₹349 only (Instant ₹49 saving vs separate items)',
      'Compact 10L paddock bag with tablet/diary sleeve + builder sipper bottle',
      'Official SCD Document Folder File & Hardbound Cloud Architect Diary',
      'Sticker sheet with 10 premium F1 theme inspired decals',
      'SCD Dhule 2026 metal keychain & high-density woven lanyard',
      'Consolidated safe dispatch in a single package'
    ],
    specs: [
      { name: 'Bundle Contents', value: 'Bag + Bottle + Full Welcome Kit (7+ Items)' },
      { name: 'Bundle Savings', value: 'Save ₹49 vs Individual items (₹349 vs ₹398)' },
      { name: 'Total Collectibles', value: 'All 7 Official SCD 2026 Swag Items' },
      { name: 'Packaging', value: 'Consolidated safe dispatch pack' },
      { name: 'Edition', value: 'Full SCD 2026 Collector Drop' }
    ],
    inclusions: [
      '1x Official SCD 2026 Compact 10L Paddock Bag',
      '1x SCD 2026 Builder Sipper Bottle',
      '1x Official SCD 2026 Document Folder File',
      '1x Cloud Architect Hardbound Diary',
      '1x Sticker Sheet (10 Premium F1 Theme Inspired Decals)',
      '1x SCD Dhule 2026 Metal Keychain',
      '1x High-Density Woven Paddock Lanyard',
      'Special bundle discount applied (Save ₹49 instantly)'
    ]
  }
];

export function findProductById(id: string | undefined): MerchProduct {
  if (!id) return merchProducts[0];
  const cleanId = id.toLowerCase().trim();
  const matched = merchProducts.find(
    (p) => p.id === cleanId || p.aliases.includes(cleanId)
  );
  return matched || merchProducts[0];
}
