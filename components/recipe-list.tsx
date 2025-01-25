"use client";

import RecipeTable from "@/components/recipe-table";
import { Button } from "@/components/ui/button";
import { syncRecipesFromWebflow } from "@/actions/webflow";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RecipeWithIdAndCreatedOn } from "@/types";

export function RecipeList({
  initialRecipes,
}: {
  initialRecipes: RecipeWithIdAndCreatedOn[];
}) {
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      const result = await syncRecipesFromWebflow();
      if (result.success) {
        router.refresh();
      } else {
        console.error(result.error);
      }
    } catch (error) {
      console.error("Error syncing recipes:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Recipes</h1>
        <Button onClick={handleSync} disabled={isSyncing}>
          {isSyncing ? "Syncing..." : "Sync from Webflow"}
        </Button>
      </div>
      <RecipeTable recipes={initialRecipes} />
    </div>
  );
}
