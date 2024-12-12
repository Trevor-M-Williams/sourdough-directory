import { notFound } from "next/navigation";
import Image from "next/image";
import { getRecipeById } from "@/actions/webflow";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function RecipePage({ params }: PageProps) {
  const recipe = await getRecipeById(params.id);

  if (!recipe) {
    notFound();
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8 mb-8">
        <div className="relative aspect-[5/3]">
          {recipe.imageUrl && (
            <Image
              src={recipe.imageUrl}
              alt={recipe.name}
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          )}
        </div>
        <div>
          <div className="mb-6">
            <h1 className="text-3xl font-bold ">{recipe.name}</h1>
            <div className="flex gap-2 items-center">
              <p>{new Date(recipe.createdOn).toLocaleDateString()}</p>
              <p>•</p>
              {/* <p>{recipe.category}</p> */}
              <p>Bread (maybe)</p>
            </div>
          </div>
          <div className="grid gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Ingredients</h2>
              <ul className="list-disc pl-5">
                {recipe.ingredients
                  .split("*")
                  .filter((ingredient) => ingredient.trim() !== "")
                  .map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                  ))}
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Instructions</h2>
              <p className="whitespace-pre-wrap">{recipe.instructions}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
