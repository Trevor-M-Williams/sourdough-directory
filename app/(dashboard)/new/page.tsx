"use client";

import { Button } from "@/components/ui/button";
import { generateRecipe, generateRecipeIdeas } from "@/actions/openai";
import { RecipeCategory } from "@/types";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { BookText, Lightbulb } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export const maxDuration = 300;

export default function Home() {
  const [recipeName, setRecipeName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<RecipeCategory>(
    RecipeCategory.Bread
  );
  const [recipeIdeas, setRecipeIdeas] = useState<string[]>([]);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [selectedForm, setSelectedForm] = useState<
    "single" | "multiple" | null
  >(null);

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

  const handleGenerateIdeas = async () => {
    try {
      setIsGeneratingIdeas(true);
      const result = await generateRecipeIdeas(selectedCategory);
      if (result.success) {
        setRecipeIdeas(result.ideas);
      }
    } catch (error) {
      console.error("Error generating recipe ideas:", error);
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  return (
    <main className="h-screen p-4 flex flex-col gap-4 w-full max-w-md mx-auto">
      <div className="h-full flex flex-col items-center justify-center">
        {!selectedForm ? (
          <FormStart setSelectedForm={setSelectedForm} />
        ) : (
          <div className="relative">
            <Button
              variant="ghost"
              className="absolute -top-2 left-0"
              onClick={() => setSelectedForm(null)}
            >
              ← Back
            </Button>

            {selectedForm === "single" ? (
              <FormSingle
                recipeName={recipeName}
                setRecipeName={setRecipeName}
                handleGenerateRecipe={handleGenerateRecipe}
              />
            ) : (
              <FormMultiple
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                handleGenerateIdeas={handleGenerateIdeas}
                isGeneratingIdeas={isGeneratingIdeas}
                recipeIdeas={recipeIdeas}
                setRecipeIdeas={setRecipeIdeas}
                setSelectedForm={setSelectedForm}
              />
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function FormStart({
  setSelectedForm,
}: {
  setSelectedForm: (form: "single" | "multiple") => void;
}) {
  return (
    <div className="flex gap-4">
      <Card
        className="p-6 cursor-pointer hover:border-primary transition-colors flex items-center justify-center"
        onClick={() => setSelectedForm("single")}
      >
        <div className="flex flex-col items-center text-center">
          <BookText className="w-12 h-12 mb-2" />
          <h2 className="font-semibold">Generate Single Recipe</h2>
        </div>
      </Card>

      <Card
        className="p-6 cursor-pointer hover:border-primary transition-colors flex items-center justify-center"
        onClick={() => setSelectedForm("multiple")}
      >
        <div className="flex flex-col items-center text-center">
          <Lightbulb className="w-12 h-12 mb-2" />
          <h2 className="font-semibold">Generate Multiple Recipes</h2>
        </div>
      </Card>
    </div>
  );
}

type FormProps = {
  recipeName: string;
  setRecipeName: (recipeName: string) => void;
  handleGenerateRecipe: () => void;
};

function FormSingle({
  recipeName,
  setRecipeName,
  handleGenerateRecipe,
}: FormProps) {
  return (
    <div className="pt-8 space-y-4">
      <h2 className="text-lg font-semibold">Generate Single Recipe</h2>
      <div className="space-y-2">
        <Label htmlFor="recipe-name">Recipe Name</Label>
        <Input
          id="recipe-name"
          value={recipeName}
          onChange={(e) => setRecipeName(e.target.value)}
          placeholder="Enter recipe name"
        />
      </div>
      <Button onClick={handleGenerateRecipe}>Generate Recipe</Button>
    </div>
  );
}

function FormMultiple({
  selectedCategory,
  isGeneratingIdeas,
  recipeIdeas,
  setSelectedForm,
  setSelectedCategory,
  setRecipeIdeas,
  handleGenerateIdeas,
}: {
  selectedCategory: RecipeCategory;
  isGeneratingIdeas: boolean;
  recipeIdeas: string[];
  setSelectedForm: (form: "single" | "multiple" | null) => void;
  setSelectedCategory: (category: RecipeCategory) => void;
  setRecipeIdeas: (recipeIdeas: string[]) => void;
  handleGenerateIdeas: () => void;
}) {
  const [selectedIdeas, setSelectedIdeas] = useState<string[]>([]);
  const [isGeneratingRecipes, setIsGeneratingRecipes] = useState(false);

  const handleIdeaToggle = (idea: string) => {
    setSelectedIdeas((prev) =>
      prev.includes(idea) ? prev.filter((i) => i !== idea) : [...prev, idea]
    );
  };

  const handleGenerateSelectedRecipes = async () => {
    if (selectedIdeas.length === 0) return;

    setIsGeneratingRecipes(true);
    try {
      await Promise.all(
        selectedIdeas.map((recipeName) => generateRecipe(recipeName))
      );
    } catch (error) {
      console.error("Error generating recipes:", error);
    } finally {
      setIsGeneratingRecipes(false);
      setSelectedIdeas([]);
      setRecipeIdeas([]);
      setSelectedForm(null);
    }
  };

  const categoryOptions = ["Bread", "Cooking and Baking", "International"];

  return (
    <div className="pt-8">
      <h2 className="text-lg font-semibold mb-2">Generate Recipe Ideas</h2>

      {recipeIdeas.length === 0 ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={selectedCategory}
              onValueChange={(value) =>
                setSelectedCategory(value as RecipeCategory)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleGenerateIdeas} disabled={isGeneratingIdeas}>
            {isGeneratingIdeas ? "Generating..." : "Generate Ideas"}
          </Button>
        </div>
      ) : (
        <div className="mt-4">
          <ul className="space-y-2">
            {recipeIdeas.map((idea, index) => (
              <li key={index} className="flex items-center gap-2">
                <Checkbox
                  id={`idea-${index}`}
                  checked={selectedIdeas.includes(idea)}
                  onCheckedChange={() => handleIdeaToggle(idea)}
                />
                <Label htmlFor={`idea-${index}`} className="text-base">
                  {idea}
                </Label>
              </li>
            ))}
          </ul>

          <Button
            onClick={handleGenerateSelectedRecipes}
            disabled={isGeneratingRecipes || selectedIdeas.length === 0}
            className="mt-4"
          >
            {isGeneratingRecipes
              ? "Generating Recipes..."
              : `Generate ${selectedIdeas.length} Recipe${
                  selectedIdeas.length !== 1 ? "s" : ""
                }`}
          </Button>
        </div>
      )}
    </div>
  );
}
