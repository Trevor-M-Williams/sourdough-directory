import { generateRecipe } from "@/actions/openai";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { recipes } from "@/db/schema";
import { RecipeCategory } from "@/types";

import OpenAI from "openai";
const openai = new OpenAI();

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const categories = Object.values(RecipeCategory);

export async function GET() {
  try {
    const randomCategory =
      categories[Math.floor(Math.random() * categories.length)];

    const existingRecipes = await db.query.recipes.findMany({
      columns: { name: true },
    });
    const existingNames = existingRecipes.map((r) => r.name);

    const prompt = `
        Generate a unique recipe ${randomCategory} sourdough recipe.
        Here are the existing recipes to avoid duplicates: ${existingNames.join(", ")}.
        Return only the name of the recipe.
    `;

    const result = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const recipeName = result.choices[0].message.content;

    if (!recipeName) {
      throw new Error("Failed to generate recipe name");
    }

    const { success, recipe, id } = await generateRecipe(recipeName);

    if (!success || !recipe || !id) {
      throw new Error("Failed to generate recipe");
    }

    await db.insert(recipes).values({
      id: crypto.randomUUID(),
      webflowId: id,
      name: recipe.name,
      slug: recipe.name.toLowerCase().replace(/\s+/g, "-"),
      category: randomCategory,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      servings: recipe.servings,
      calories: recipe.calories,
      imageUrl: recipe.imageUrl,
      createdOn: new Date(),
      lastUpdated: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Recipe generated and saved",
    });
  } catch (error) {
    console.error("Error generating recipe:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate recipe" },
      { status: 500 }
    );
  }
}
