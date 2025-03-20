import { InferenceClient } from "@huggingface/inference";
import { HUGGINGFACE_TOKEN } from "$env/static/private";

const inference = new InferenceClient(HUGGINGFACE_TOKEN);
const model = "Salesforce/blip-image-captioning-base";

// Utility function to fetch an image and return its Blob
async function fetchImageAsBlob(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch image from ${url} (Status: ${response.status})`
    );
  }
  return response.blob();
}

// Function to get the image caption using the inference client
export async function predictDescriptor(image: File) {
  const imageUrl = URL.createObjectURL(image);

  try {
    const imageBlob = await fetchImageAsBlob(imageUrl);
    const result = await inference.imageToText({
      model,
      data: imageBlob,
    });
    return result;
  } catch (error) {
    console.error("Error during image caption prediction:", error);
    throw error;
  }
}
