"use server";

import { Recipe, RecipeWithIdAndCreatedOn } from "@/types";
import { WebflowClient } from "webflow-api";

const client = new WebflowClient({
  accessToken: process.env.WEBFLOW_API_KEY!,
});

export async function getRecipeById(id: string) {
  const recipeData = await client.collections.items.getItemLive(
    process.env.WEBFLOW_COLLECTION_ID!,
    id
  );

  if (!recipeData.fieldData) {
    return null;
  }

  const recipe: RecipeWithIdAndCreatedOn = {
    id: recipeData.id || "",
    createdOn: recipeData.createdOn || "",
    name: recipeData.fieldData.name || "",
    slug: recipeData.fieldData.slug || "",
    category: recipeData.fieldData.category || "",
    ingredients: recipeData.fieldData.ingredients || "",
    instructions: recipeData.fieldData.instructions || "",
    prepTime: recipeData.fieldData["prep-time-2"] || "",
    cookTime: recipeData.fieldData["cook-time"] || "",
    servings: recipeData.fieldData.servings || 0,
    calories: recipeData.fieldData.calories || 0,
    imageUrl: recipeData.fieldData.image.url || "",
  };

  return recipe;
}

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
