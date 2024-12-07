import { NextRequest, NextResponse } from "next/server";
import { WebflowClient } from "webflow-api";

const client = new WebflowClient({
  accessToken: process.env.WEBFLOW_API_KEY!,
});

const options = {
  status: 200,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  },
};

export async function OPTIONS() {
  return NextResponse.json({}, options);
}

export async function GET(request: NextRequest) {
  const domain = "https://www.allthingssour.com";

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
