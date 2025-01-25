"use server";

import { db } from "@/db";
import { eq } from "drizzle-orm";
import { recipes } from "@/db/schema";
import { Recipe, RecipeWithIdAndCreatedOn } from "@/types";
import { WebflowClient } from "webflow-api";

const client = new WebflowClient({
  accessToken: process.env.WEBFLOW_API_KEY!,
});

export async function getRecipeById(id: string) {
  const recipeData = await db.query.recipes.findFirst({
    where: eq(recipes.id, id),
  });

  if (!recipeData) {
    return null;
  }

  const recipe: RecipeWithIdAndCreatedOn = {
    id: recipeData.id || "",
    webflowId: recipeData.id || "",
    createdOn: new Date(recipeData.createdOn || Date.now()),
    lastUpdated: new Date(recipeData.lastUpdated || Date.now()),
    name: recipeData.name || "",
    slug: recipeData.slug || "",
    category: recipeData.category || "",
    ingredients: recipeData.ingredients || "",
    instructions: recipeData.instructions || "",
    prepTime: recipeData.prepTime || "",
    cookTime: recipeData.cookTime || "",
    servings: recipeData.servings || 0,
    calories: recipeData.calories || 0,
    imageUrl: recipeData.imageUrl || "",
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

export async function searchRecipes(query: string) {
  try {
    const recipes = await db.query.recipes.findMany({
      where: (recipes, { ilike }) => ilike(recipes.name, `%${query}%`),
      orderBy: (recipes, { asc }) => [asc(recipes.name)],
      limit: 5,
    });

    return recipes;
  } catch (error) {
    console.error("Error searching recipes:", error);
    return [];
  }
}

export async function syncRecipesFromWebflow() {
  try {
    const data = await client.collections.items.listItemsLive(
      process.env.WEBFLOW_COLLECTION_ID!,
      {
        limit: 100,
        sortBy: "name",
        sortOrder: "asc",
      }
    );

    if (!data.items) {
      throw new Error("No items found in Webflow");
    }

    for (const webflowRecipe of data.items) {
      if (!webflowRecipe.fieldData || !webflowRecipe.id) continue;

      const existingRecipe = await db.query.recipes.findFirst({
        where: eq(recipes.webflowId, webflowRecipe.id),
      });

      const recipeData = {
        webflowId: webflowRecipe.id,
        name: webflowRecipe.fieldData.name || "",
        slug: webflowRecipe.fieldData.slug || "",
        category: webflowRecipe.fieldData.category || "",
        ingredients: webflowRecipe.fieldData.ingredients || "",
        instructions: webflowRecipe.fieldData.instructions || "",
        prepTime: webflowRecipe.fieldData["prep-time-2"] || "",
        cookTime: webflowRecipe.fieldData["cook-time"] || "",
        servings: Number(webflowRecipe.fieldData.servings) || 0,
        calories: Number(webflowRecipe.fieldData.calories) || 0,
        imageUrl: webflowRecipe.fieldData.image?.url || "",
        createdOn: new Date(webflowRecipe.createdOn || Date.now()),
        lastUpdated: new Date(),
      };

      if (existingRecipe) {
        await db
          .update(recipes)
          .set(recipeData)
          .where(eq(recipes.webflowId, webflowRecipe.id));
      } else {
        await db.insert(recipes).values({
          id: crypto.randomUUID(),
          ...recipeData,
        });
      }
    }

    return { success: true, message: `Synced ${data.items.length} recipes` };
  } catch (error) {
    console.error("Error syncing recipes:", error);
    return { success: false, error: "Failed to sync recipes" };
  }
}
