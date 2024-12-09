"use server";

import { Recipe } from "@/types";
import { WebflowClient } from "webflow-api";

const client = new WebflowClient({
  accessToken: process.env.WEBFLOW_API_KEY!,
});

export async function createWebflowItem(recipe: Recipe) {
  try {
    await client.collections.items.createItemLive(
      process.env.WEBFLOW_COLLECTION_ID!,
      {
        isArchived: false,
        isDraft: false,
        fieldData: {
          name: recipe.name,
          slug: recipe.slug,
          category: recipe.category,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          "prep-time-2": recipe.prepTime,
          "cook-time": recipe.cookTime,
          servings: recipe.servings,
          calories: recipe.calories,
          image: recipe.imageUrl,
        },
      }
    );

    return { success: true };
  } catch (error) {
    console.error("Error creating Webflow item:", error);
    return { success: false, error };
  }
}

export async function getCollectionDetails() {
  const collection = await client.collections.get(
    process.env.WEBFLOW_COLLECTION_ID!
  );

  return collection;
}
