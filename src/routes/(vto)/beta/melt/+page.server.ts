import type { PageServerLoad } from "./$types";
import type { Actions } from "@sveltejs/kit";
import { detectLabels } from "$lib/server/aws/rekognition";
import { predictDescriptor } from "$lib/server/huggingface/inference";
import { describeImage } from "$lib/server/openai/openai";
export const load: PageServerLoad = async () => {
  return {};
};

export const actions: Actions = {
  detect: async ({ request }) => {
    try {
      // Extract form data
      const formData = await request.formData();
      const image = formData.get("image") as File;

      // Validate input
      if (!image) {
        return { success: false, error: "No image file provided." };
      }

      // Ensure the file is a valid image type
      if (!image.type.startsWith("image/")) {
        return {
          success: false,
          error: "Invalid file type. Please upload an image.",
        };
      }

      const maxSizeMB = 4;
      if (image.size > maxSizeMB * 1024 * 1024) {
        return {
          success: false,
          error: `File size exceeds ${maxSizeMB}MB. Please upload a smaller image.`,
        };
      }

      const res = await detectLabels(image);
      console.log(res);

      // Ensure AWS response contains Labels
      if (!res || !res.Labels) {
        return {
          success: false,
          error: "Failed to process the image. Please try again later.",
        };
      }

      return {
        success: true,
        labels: res.Labels,
        properties: res.ImageProperties,
      };
    } catch (error) {
      console.error("Error in detect function:", error);

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
      };
    }
  },
  predict: async ({ request }) => {
    const formData = await request.formData();
    const image = formData.get("image") as File;

    const result = await predictDescriptor(image);
    console.log("From server: ", result);
    return { success: true, result };
  },
  chatgpt: async ({ request }) => {
    const formData = await request.formData();
    const image = formData.get("image") as File;
    const imageNodeBuffer = Buffer.from(await image.arrayBuffer());
    const base64Image = imageNodeBuffer.toString("base64");

    const result = await describeImage(base64Image);
    return { success: true, result };
  },
  select: async ({ request }) => {
    const formData = await request.formData();
    const color = formData.get("color") as string;
    console.log("From server: ", color);
    return { success: true, color };
  },
};
