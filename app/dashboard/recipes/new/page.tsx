"use client";

import { Card } from "@/components/ui/card";
import { BookText } from "lucide-react";

export const maxDuration = 300;

export default function NewRecipePage() {
  const handleGenerateRecipe = async () => {
    console.log("Generating recipe");
    try {
      const response = await fetch("/api/generate");

      if (!response.ok) {
        throw new Error(`Failed to fetch recipe: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error("Error generating recipe:", error);
    }
  };

  return (
    <main className="h-screen p-4 flex flex-col gap-4 w-full max-w-md mx-auto">
      <div className="h-full flex flex-col items-center justify-center">
        <Card
          className="p-6 cursor-pointer hover:border-primary transition-colors flex items-center justify-center"
          onClick={handleGenerateRecipe}
        >
          <div className="flex flex-col items-center text-center">
            <BookText className="w-12 h-12 mb-2" />
            <h2 className="font-semibold">Generate Single Recipe</h2>
          </div>
        </Card>
      </div>
    </main>
  );
}
