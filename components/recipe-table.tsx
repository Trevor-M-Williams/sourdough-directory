"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown } from "lucide-react";
import { RecipeWithIdAndCreatedOn } from "@/types";

type SortKey = "name" | "createdOn";
type SortOrder = "asc" | "desc";

export default function RecipeTable({
  recipes,
}: {
  recipes: RecipeWithIdAndCreatedOn[];
}) {
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

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

  return (
    <div className="max-w-5xl mx-auto py-10">
      <Table>
        <TableCaption>A list of delicious recipes</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-28"></TableHead>
            <TableHead>
              <div
                className="flex items-center cursor-pointer"
                onClick={() => toggleSort("name")}
              >
                Name
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
            <TableRow key={recipe.id} className="text-lg hover:bg-gray-100">
              <TableCell>
                <Image
                  src={recipe.imageUrl}
                  alt={recipe.name}
                  height={80}
                  width={80}
                  className="rounded-sm object-cover"
                />
              </TableCell>
              <TableCell className="font-medium text-xl">
                {recipe.name}
              </TableCell>
              <TableCell className="text-right">
                {recipe.createdOn.split("T")[0]}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
