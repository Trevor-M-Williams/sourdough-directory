import { db } from "@/db";
import { desc } from "drizzle-orm";
import { recipes } from "@/db/schema";
import { RecipeList } from "@/components/recipe-list";

export default async function Page() {
  const dbRecipes = await db.query.recipes.findMany({
    orderBy: [desc(recipes.createdOn)],
  });

  return <RecipeList initialRecipes={dbRecipes} />;
}
