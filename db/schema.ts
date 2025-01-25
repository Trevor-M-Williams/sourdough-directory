import { pgTable, text, timestamp, integer, uuid } from "drizzle-orm/pg-core";

export const recipes = pgTable("recipes", {
  id: uuid("id").primaryKey(),
  webflowId: text("webflow_id").notNull().unique(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull(),
  ingredients: text("ingredients").notNull(),
  instructions: text("instructions").notNull(),
  prepTime: text("prep_time").notNull(),
  cookTime: text("cook_time").notNull(),
  servings: integer("servings").notNull(),
  calories: integer("calories").notNull(),
  imageUrl: text("image_url").notNull(),
  createdOn: timestamp("created_on").notNull(),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});
