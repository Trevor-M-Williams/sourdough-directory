"use server";

export async function generateImage(prompt: string) {
  console.log("Generating image");

  const postUrl = "https://cloud.leonardo.ai/api/rest/v1/generations";
  const postOptions = {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization: `Bearer ${process.env.LEONARDO_API_KEY}`,
    },
    body: JSON.stringify({
      alchemy: true,
      width: 1024,
      height: 768,
      modelId: "b24e16ff-06e3-43eb-8d33-4416c2d75876",
      num_images: 1,
      presetStyle: "DYNAMIC",
      prompt,
    }),
  };

  const postResponse = await fetch(postUrl, postOptions);

  if (!postResponse.ok) {
    throw new Error(`Failed to generate image: ${postResponse.statusText}`);
  }

  const postData = await postResponse.json();
  const generationId = postData.sdGenerationJob.generationId;

  const getUrl = `https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`;
  const getOptions = {
    method: "GET",
    headers: {
      accept: "application/json",
      authorization: `Bearer ${process.env.LEONARDO_API_KEY}`,
    },
  };
  let attempts = 0;
  let imageData;
  const delay = 5000;

  while (attempts < 10) {
    const getResponse = await fetch(getUrl, getOptions);
    imageData = await getResponse.json();

    const generatedImages = imageData.generations_by_pk.generated_images;

    if (generatedImages && generatedImages[0] && generatedImages[0].url) {
      console.log("Image generation complete");
      break;
    }

    attempts++;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  return imageData.generations_by_pk.generated_images[0].url;
}
