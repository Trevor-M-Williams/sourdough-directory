export interface RecipeImage {
  fileId: string;
  url: string;
  alt: string | null;
}

export interface RecipeFieldData {
  category: string; // not RecipeCategory because webflow returns the id of the category
  servings: number;
  calories: number;
  name: string;
  ingredients: string;
  instructions: string;
  "prep-time-2": string;
  "cook-time": string;
  image: RecipeImage;
  slug: string;
}

export interface RecipeData {
  id: string;
  cmsLocaleId: string;
  lastPublished: string;
  lastUpdated: string;
  createdOn: string;
  isArchived: boolean;
  isDraft: boolean;
  fieldData: RecipeFieldData;
}

export interface Recipe {
  name: string;
  slug: string;
  category: string;
  ingredients: string;
  instructions: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  calories: number;
  imageUrl: string;
}

export interface RecipeWithIdAndCreatedOn extends Recipe {
  id: string;
  webflowId: string;
  createdOn: Date;
  lastUpdated: Date;
}

export enum RecipeCategory {
  Bread = "Bread",
  CookingAndBaking = "Cooking and Baking",
  International = "International",
}
