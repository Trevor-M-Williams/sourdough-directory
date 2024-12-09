import RecipeTable from "@/components/recipe-table";
import { RecipeData } from "@/types";
const data = require("@/data/recipes-data.json");

export default async function Dashboard() {
  // const response = await fetch("http://localhost:3000/api/collection-items");
  // const data = await response.json();

  const recipes = data.map((item: RecipeData) => ({
    id: item.id,
    name: item.fieldData.name,
    category: item.fieldData.category,
    createdOn: item.createdOn,
    imageUrl: item.fieldData.image.url,
  }));

  return <RecipeTable recipes={recipes} />;
}
