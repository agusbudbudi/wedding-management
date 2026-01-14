export type Souvenir = {
  id: string;
  event_id: string;
  name: string;
  description?: string;
  stock: number;
  icon: string;
  color: string;
  category_restrictions?: string[]; // Array of categories, if null then all allowed
  created_at: string;
};

export interface RedeemedGuest {
  id: string;
  name: string;
  category: string;
  souvenir_name: string;
  souvenir_icon?: string;
  souvenir_color?: string;
  souvenir_redeemed_at: string;
  souvenir_redeemed_quantity: number;
  redeemed_by_name: string;
}

export type CreateSouvenirParams = {
  event_id: string;
  name: string;
  description?: string;
  stock: number;
  icon: string;
  color: string;
  category_restrictions?: string[];
};

export type UpdateSouvenirParams = Partial<CreateSouvenirParams>;
