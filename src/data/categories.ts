import { CategoryDefinition } from '../types';

export const CATEGORIES: CategoryDefinition[] = [
  {
    id: 'housing',
    name: 'Housing & Rent',
    icon: 'Home',
    color: '#0284c7', // sky-600
    defaultNecessity: 'need',
    subcategories: ['Rent', 'Mortgage', 'Property Tax', 'Home Maintenance', 'HOA Fees'],
  },
  {
    id: 'groceries',
    name: 'Groceries & Essentials',
    icon: 'ShoppingBag',
    color: '#059669', // emerald-600
    defaultNecessity: 'need',
    subcategories: ['Supermarket', 'Organic Food', 'Produce', 'Household Supplies', 'Pantry'],
  },
  {
    id: 'dining',
    name: 'Dining & Food Delivery',
    icon: 'Utensils',
    color: '#ea580c', // orange-600
    defaultNecessity: 'want',
    subcategories: ['Restaurants', 'Fast Food', 'Coffee Shops', 'Bars & Pubs', 'Food Delivery'],
  },
  {
    id: 'utilities',
    name: 'Utilities & Bills',
    icon: 'Zap',
    color: '#eab308', // yellow-500
    defaultNecessity: 'need',
    subcategories: ['Electricity', 'Water & Gas', 'Internet & Wi-Fi', 'Mobile Phone', 'Trash'],
  },
  {
    id: 'transportation',
    name: 'Transportation',
    icon: 'Car',
    color: '#4f46e5', // indigo-600
    defaultNecessity: 'need',
    subcategories: ['Gas & Fuel', 'Rideshare & Taxis', 'Public Transit', 'Auto Insurance', 'Parking & Tolls'],
  },
  {
    id: 'subscriptions',
    name: 'Subscriptions & Tech',
    icon: 'Tv',
    color: '#7c3aed', // violet-600
    defaultNecessity: 'want',
    subcategories: ['Streaming Video', 'Music', 'Cloud Storage', 'Software & Apps', 'Gym & Fitness'],
  },
  {
    id: 'shopping',
    name: 'Shopping & Retail',
    icon: 'Tag',
    color: '#db2777', // pink-600
    defaultNecessity: 'want',
    subcategories: ['Clothing & Apparel', 'Electronics', 'Home Goods', 'Personal Accessories', 'Gifts'],
  },
  {
    id: 'healthcare',
    name: 'Healthcare & Wellness',
    icon: 'HeartPulse',
    color: '#dc2626', // red-600
    defaultNecessity: 'need',
    subcategories: ['Pharmacy & Meds', 'Doctor Visits', 'Dental', 'Vision', 'Health Insurance'],
  },
  {
    id: 'entertainment',
    name: 'Entertainment & Leisure',
    icon: 'Film',
    color: '#8b5cf6', // purple-500
    defaultNecessity: 'want',
    subcategories: ['Movies & Concerts', 'Gaming', 'Books & Media', 'Hobbies', 'Events & Sports'],
  },
  {
    id: 'travel',
    name: 'Travel & Vacations',
    icon: 'Plane',
    color: '#0d9488', // teal-600
    defaultNecessity: 'want',
    subcategories: ['Flights', 'Lodging & Hotels', 'Car Rentals', 'Vacation Dining', 'Excursions'],
  },
  {
    id: 'financial',
    name: 'Financial & Savings',
    icon: 'TrendingUp',
    color: '#16a34a', // green-600
    defaultNecessity: 'savings_investment',
    subcategories: ['Emergency Fund', 'Index Funds & Stocks', 'Crypto', 'Retirement / 401k', 'Loan Repayment'],
  },
  {
    id: 'other',
    name: 'Miscellaneous',
    icon: 'HelpCircle',
    color: '#64748b', // slate-500
    defaultNecessity: 'want',
    subcategories: ['General', 'Fees & Charges', 'Charity & Donations', 'Uncategorized'],
  },
];

export const CATEGORY_NAMES = CATEGORIES.map((c) => c.name);

export function getCategoryMeta(categoryName: string) {
  const match = CATEGORIES.find(
    (c) => c.name.toLowerCase() === categoryName.toLowerCase() || c.id === categoryName.toLowerCase()
  );
  if (match) return match;
  return {
    id: 'other',
    name: categoryName || 'Miscellaneous',
    icon: 'HelpCircle',
    color: '#64748b',
    defaultNecessity: 'want' as const,
    subcategories: ['General'],
  };
}
