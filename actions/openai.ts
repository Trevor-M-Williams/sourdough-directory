"use server";

import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { createWebflowItem } from "./webflow";
import { generateImage } from "./leonardo";
const openai = new OpenAI();

enum Category {
  BasicLoaves = "Basic Loaves",
  FlavoredAndSpecialityLoaves = "Flavored and Specialty Loaves",
  CookingAndBaking = "Cooking and Baking",
  International = "International",
}

const RecipeSchema = z.object({
  name: z.string(),
  category: z.nativeEnum(Category),
  ingredients: z.array(z.string()),
  instructions: z.array(z.string()),
  prepTime: z.string(),
  cookTime: z.string(),
  servings: z.number(),
  calories: z.number(),
});

export async function generateRecipe(recipeName: string) {
  console.log("Generating recipe for:", recipeName);

  // Run recipe and image generation in parallel
  const [recipeCompletion, imageResponse] = await Promise.all([
    openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Generate a detailed recipe with the provided schema format. Include the estimated calories per serving.",
        },
        {
          role: "user",
          content: `Generate a recipe for ${recipeName}`,
        },
      ],
      response_format: zodResponseFormat(RecipeSchema, "recipe"),
    }),
    generateImage(recipeName),
  ]);

  const recipe = recipeCompletion.choices[0].message.parsed;
  if (!recipe) throw new Error("Failed to generate recipe");
  const formattedRecipe = formatRecipe(recipe);

  const webflowResponse = await createWebflowItem({
    name: formattedRecipe.name,
    slug: formattedRecipe.name.toLowerCase().replace(/\s+/g, "-"),
    category: formattedRecipe.category,
    ingredients: formattedRecipe.ingredients,
    instructions: formattedRecipe.instructions,
    prepTime: formattedRecipe.prepTime,
    cookTime: formattedRecipe.cookTime,
    servings: formattedRecipe.servings,
    calories: formattedRecipe.calories,
    imageUrl: imageResponse,
  });

  if (!webflowResponse.success) {
    throw new Error("Failed to create Webflow item");
  }

  return {
    success: true,
    message: `Recipe for ${recipe.name} created successfully`,
  };
}

function formatRecipe(recipe: z.infer<typeof RecipeSchema>) {
  const ingredientsList = recipe.ingredients
    .map((ingredient) => `* ${ingredient}`)
    .join("\n");

  const instructionsList = recipe.instructions
    .map((step, index) => `${index + 1}. ${step}`)
    .join("\n");

  return {
    ...recipe,
    ingredients: ingredientsList,
    instructions: instructionsList,
  };
}
