"use client";

import { useEffect, useState } from "react";
import { searchRecipes } from "@/actions/webflow";
import { RecipeWithIdAndCreatedOn } from "@/types";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [recipes, setRecipes] = useState<RecipeWithIdAndCreatedOn[]>([]);
  const searchParams = useSearchParams();
  const hostname = searchParams.get("hostname");

  useEffect(() => {
    if (!query) {
      setRecipes([]);
      return;
    }

    const debounceTimeout = setTimeout(async () => {
      const recipes = await searchRecipes(query);
      setRecipes(recipes);
    }, 200);

    return () => clearTimeout(debounceTimeout);
  }, [query]);

  return (
    <main className="h-screen w-full flex flex-col p-8 pb-2">
      <div className="w-full mb-2">
        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a recipe"
        />
      </div>
      <div className="space-y-4 -mr-6 pr-6 pt-2 grow overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#d5d8c0]">
        {recipes.map((recipe) => (
          <Link
            key={recipe.id}
            href={`https://${hostname}/recipes/${recipe.slug}`}
            target="_top"
            className="flex items-center gap-4 p-2 hover:bg-[#e5e7d5] rounded-lg transition-colors duration-200"
          >
            <div className="relative aspect-[4/3] w-1/3 shrink-0">
              <Skeleton className="absolute w-full h-full -z-10" />
              <Image
                src={recipe.imageUrl}
                alt={recipe.name}
                width={400}
                height={300}
                className="rounded-md object-cover"
              />
            </div>

            <div className="flex flex-col gap-8">
              <div className="text-3xl">{recipe.name}</div>
              <div className="flex items-center gap-2">
                <div className="text-sm bg-[#FFB934] border rounded-md px-2 py-1">
                  {recipe.prepTime}
                </div>
                <div className="text-sm bg-[#FFB934] border rounded-md px-2 py-1">
                  {recipe.calories} Calories
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
