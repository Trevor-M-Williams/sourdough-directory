import { generateRecipe } from "@/actions/openai";
import { NextResponse } from "next/server";
import { db } from "@/db";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const categories = ["Bread", "Cooking and Baking", "International"];

export async function GET() {
  try {
    const randomCategory =
      categories[Math.floor(Math.random() * categories.length)];

    const existingRecipes = await db.query.recipes.findMany({
      columns: { name: true },
    });
    const existingNames = existingRecipes.map((r) => r.name);

    const prompt = `Generate a unique ${randomCategory} recipe. Here are the existing recipes to avoid duplicates: ${existingNames.join(", ")}.`;

    const result = await generateRecipe(prompt);

    if (!result.success) {
      throw new Error(result.message);
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (error) {
    console.error("Error generating recipe:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate recipe" },
      { status: 500 }
    );
  }
}
