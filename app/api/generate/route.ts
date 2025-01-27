import { NextResponse } from "next/server";
import { db } from "@/db";
import { recipes } from "@/db/schema";
import { RecipeCategory } from "@/types";
import { Recipe } from "@/types";
import { WebflowClient } from "webflow-api";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

const client = new WebflowClient({
  accessToken: process.env.WEBFLOW_API_KEY!,
});

const openai = new OpenAI();

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const RecipeSchema = z.object({
  name: z.string(),
  category: z.nativeEnum(RecipeCategory),
  ingredients: z.array(z.string()),
  instructions: z.array(z.string()),
  prepTime: z.string(),
  cookTime: z.string(),
  servings: z.number(),
  calories: z.number(),
  imageUrl: z.string().optional(),
});

function getWeightedRandomCategory(): RecipeCategory {
  const random = Math.random();

  if (random < 0.1) {
    return RecipeCategory.International;
  } else if (random < 0.55) {
    return RecipeCategory.Bread;
  } else {
    return RecipeCategory.CookingAndBaking;
  }
}

export async function GET() {
  try {
    const randomCategory = getWeightedRandomCategory();

    const recipeName = await generateRecipeName(randomCategory);

    const { recipe, id } = await generateRecipe(recipeName);

    if (!recipe || !id) {
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

async function generateRecipeName(category: RecipeCategory): Promise<string> {
  const existingRecipes = await db.query.recipes.findMany({
    columns: { name: true },
  });
  const existingNames = existingRecipes.map((r) => r.name);

  const prompt = `
      Generate a unique recipe ${category} sourdough recipe.
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

  return recipeName;
}

async function createWebflowItem(recipe: Recipe) {
  try {
    // Normalize the string to decompose the special characters, then remove diacritics and non-alphanumeric chars
    const normalizedSlug = recipe.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric chars with hyphens
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

    const response = await client.collections.items.createItemLive(
      process.env.WEBFLOW_COLLECTION_ID!,
      {
        isArchived: false,
        isDraft: false,
        fieldData: {
          name: recipe.name,
          slug: normalizedSlug,
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

    return response;
  } catch (error) {
    console.error("Error creating Webflow item:", error);
    throw error;
  }
}

async function generateRecipe(recipeName: string) {
  console.log("Generating recipe for:", recipeName);

  try {
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
    const formattedRecipe = formatRecipe(recipe, imageResponse);

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
      imageUrl: formattedRecipe.imageUrl,
    });

    if (!webflowResponse) {
      throw new Error("Failed to create Webflow item");
    }

    formattedRecipe.imageUrl = webflowResponse?.fieldData?.image;

    return {
      id: webflowResponse.id,
      recipe: formattedRecipe,
    };
  } catch (error) {
    console.error("Error generating recipe:", error);
    throw error;
  }
}

function formatRecipe(recipe: z.infer<typeof RecipeSchema>, imageUrl: string) {
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
    imageUrl,
  };
}

async function generateImage(prompt: string) {
  console.log("Generating image for:", prompt);

  try {
    const postUrl = "https://cloud.leonardo.ai/api/rest/v1/generations";
    const postOptions = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${process.env.LEONARDO_API_KEY}`,
      },
      body: JSON.stringify({
        alchemy: true,
        width: 1024,
        height: 768,
        modelId: "b24e16ff-06e3-43eb-8d33-4416c2d75876",
        num_images: 1,
        presetStyle: "DYNAMIC",
        prompt,
      }),
    };

    const postResponse = await fetch(postUrl, postOptions);

    if (!postResponse.ok) {
      throw new Error(
        `Failed to initiate image generation: ${postResponse.statusText}`
      );
    }

    const postData = await postResponse.json();

    if (!postData?.sdGenerationJob?.generationId) {
      throw new Error("Failed to get generation ID from Leonardo AI");
    }

    const generationId = postData.sdGenerationJob.generationId;

    const getUrl = `https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`;
    const getOptions = {
      method: "GET",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${process.env.LEONARDO_API_KEY}`,
      },
      cache: "no-store" as RequestCache,
    };

    let attempts = 0;
    let imageData;
    const maxAttempts = 12;
    const delay = 5000;

    while (attempts < maxAttempts) {
      const getResponse = await fetch(getUrl, getOptions);

      if (!getResponse.ok) {
        throw new Error(
          `Failed to check image generation status: ${getResponse.statusText}`
        );
      }

      imageData = await getResponse.json();

      const generatedImages = imageData?.generations_by_pk?.generated_images;

      if (generatedImages?.[0]?.url) {
        console.log("Image generation complete");
        return generatedImages[0].url;
      }

      attempts++;
      console.log(
        `Waiting for image generation, attempt ${attempts}/${maxAttempts}`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    throw new Error("Image generation timed out");
  } catch (error) {
    console.error("Error in image generation:", error);
    throw error;
  }
}
