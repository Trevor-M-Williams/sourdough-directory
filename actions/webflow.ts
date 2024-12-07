"use server";

import { WebflowClient } from "webflow-api";

const client = new WebflowClient({
  accessToken: process.env.WEBFLOW_API_KEY!,
});

export async function createWebflowItem(recipe: {
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
}) {
  const {
    name,
    slug,
    category,
    ingredients,
    instructions,
    prepTime,
    cookTime,
    servings,
    calories,
    imageUrl,
  } = recipe;
  try {
    await client.collections.items.createItemLive(
      process.env.WEBFLOW_COLLECTION_ID!,
      {
        isArchived: false,
        isDraft: false,
        fieldData: {
          name,
          slug,
          category,
          ingredients,
          instructions,
          "prep-time-2": prepTime,
          "cook-time": cookTime,
          servings,
          calories,
          image: imageUrl,
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

export async function testWebflowUpload() {
  const uuid = crypto.randomUUID();
  const exampleRecipe = {
    name: "Test Recipe",
    slug: `test-${uuid}`,
    category: "Flavored and Specialty Loaves",
    ingredients: "- 1 cup of water\n- 1 cup of sugar",
    instructions: "1. Mix the water and sugar\n2. Enjoy!",
    prepTime: "10 minutes",
    cookTime: "5 minutes",
    servings: 1,
    calories: 100,
    imageUrl:
      "https://cdn.leonardo.ai/users/e2f88b6f-e0f5-4d0a-82b4-1846ce35bdda/generations/59c27b8e-4494-471f-abb0-91fede57e933/Leonardo_Lightning_XL_Pumpkin_Spice_Sourdough_0.jpg",
  };

  await createWebflowItem(exampleRecipe);
}
