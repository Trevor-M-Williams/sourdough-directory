import RecipeTable from "@/components/recipe-table";
import { RecipeData, RecipeWithIdAndCreatedOn } from "@/types";
import { recipesData } from "@/data/recipes";

export default async function Page() {
  // const response = await fetch("http://localhost:3000/api/collection-items");
  // const data = await response.json();

  const recipes: RecipeWithIdAndCreatedOn[] = recipesData.map(
    (item: RecipeData) => ({
      id: item.id,
      name: item.fieldData.name,
      category: item.fieldData.category,
      slug: item.fieldData.slug,
      ingredients: item.fieldData.ingredients,
      instructions: item.fieldData.instructions,
      prepTime: item.fieldData["prep-time-2"],
      cookTime: item.fieldData["cook-time"],
      servings: item.fieldData.servings,
      calories: item.fieldData.calories,
      imageUrl: item.fieldData.image.url,
      createdOn: item.createdOn,
    })
  );

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <RecipeTable recipes={recipes} />
    </div>
  );
}
