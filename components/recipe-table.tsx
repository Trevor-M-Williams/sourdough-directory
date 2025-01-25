"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown } from "lucide-react";
import { RecipeWithIdAndCreatedOn } from "@/types";

type SortKey = "name" | "createdOn" | "category";
type SortOrder = "asc" | "desc";

export default function RecipeTable({
  recipes,
}: {
  recipes: RecipeWithIdAndCreatedOn[];
}) {
  const router = useRouter();
  const [sortKey, setSortKey] = useState<SortKey>("createdOn");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const sortedRecipes = [...recipes].sort((a, b) => {
    if (a[sortKey] < b[sortKey]) return sortOrder === "asc" ? -1 : 1;
    if (a[sortKey] > b[sortKey]) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const handleRowClick = (recipeId: string) => {
    router.push(`/dashboard/recipes/${recipeId}`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <div
                className="flex items-center cursor-pointer"
                onClick={() => toggleSort("name")}
              >
                Name
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead>
              <div
                className="flex items-center cursor-pointer"
                onClick={() => toggleSort("category")}
              >
                Category
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="w-32">
              <div
                className="flex items-center cursor-pointer justify-end"
                onClick={() => toggleSort("createdOn")}
              >
                Created At
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRecipes.map((recipe) => (
            <TableRow
              key={recipe.id}
              className="text-base hover:bg-gray-100 cursor-pointer"
              onClick={() => handleRowClick(recipe.id)}
            >
              <TableCell className="font-medium">{recipe.name}</TableCell>
              <TableCell>{recipe.category}</TableCell>
              <TableCell className="text-right">
                {recipe.createdOn instanceof Date
                  ? recipe.createdOn.toLocaleDateString()
                  : new Date(recipe.createdOn).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
