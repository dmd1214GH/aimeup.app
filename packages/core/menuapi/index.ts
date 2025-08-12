export type MenuCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink';

export type MenuItem = {
  id: string;
  name: string;
  description?: string;
  category: MenuCategory;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
};

export type MenuPlan = {
  id: string;
  name: string;
  description?: string;
  items: MenuItem[];
  totalCalories: number;
  createdAt: Date;
  userId: string;
};