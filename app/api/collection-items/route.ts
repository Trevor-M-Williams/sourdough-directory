import { NextRequest, NextResponse } from "next/server";
import { WebflowClient } from "webflow-api";

const client = new WebflowClient({
  accessToken: process.env.WEBFLOW_API_KEY!,
});

const domain = "https://www.allthingssour.com";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  if (url.origin !== domain) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  try {
    const data = await client.collections.items.listItemsLive(
      process.env.WEBFLOW_COLLECTION_ID!,
      {
        limit: 100,
        sortBy: "name",
        sortOrder: "asc",
      }
    );

    const items = data.items;

    if (!items) {
      return NextResponse.json({ error: "No items found" }, { status: 404 });
    }

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error searching collection items:", error);
    throw new Error("Failed to search collection items");
  }
}
