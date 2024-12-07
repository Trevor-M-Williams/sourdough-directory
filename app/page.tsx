"use client";

import { Button } from "@/components/ui/button";
import { generateRecipe } from "@/actions/openai";
import { useState } from "react";
import { getCollectionDetails } from "@/actions/webflow";
import { testWebflowUpload } from "@/actions/webflow";

type CollectionField = {
  id: string;
  isEditable: boolean;
  isRequired: boolean;
  type: string;
  slug: string;
  displayName: string;
  validations: {
    options:
      | {
          name: string;
          id: string;
        }[]
      | null;
  };
};

export default function Home() {
  const [recipeName, setRecipeName] = useState("");
  const [collection, setCollection] = useState<any>(null);

  const handleGetCollectionDetails = async () => {
    const collection = await getCollectionDetails();
    console.log(collection.fields);
    setCollection(collection);
  };

  const handleGenerateRecipe = async () => {
    try {
      if (!recipeName.trim()) return;

      const { success, message } = await generateRecipe(recipeName);
      if (!success) {
        throw new Error(message);
      }
      console.log(message);
    } catch (error) {
      console.error("Error generating recipe:", error);
    }
  };

  return (
    <main className="p-4 flex flex-col gap-4 w-full max-w-md mx-auto">
      <input
        type="text"
        value={recipeName}
        onChange={(e) => setRecipeName(e.target.value)}
        placeholder="Enter recipe name"
        className="border p-2 rounded mr-2"
      />
      <Button onClick={handleGenerateRecipe}>Generate Recipe</Button>
      <Button onClick={handleGetCollectionDetails}>
        Get Collection Details
      </Button>
      <Button onClick={() => testWebflowUpload()}>Test Upload</Button>
      {collection && (
        <div>
          {collection.fields.map((field: CollectionField) => (
            <div key={field.id}>
              {field.displayName}: {field.slug}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
