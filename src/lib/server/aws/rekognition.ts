import {
  DetectLabelsCommand,
  type DetectLabelsCommandInput,
} from "@aws-sdk/client-rekognition";

import { client } from "$lib/server/aws/rekognitionClient";

export async function detectLabelsFromFile(file: File) {
  const arrayBuffer = await file.arrayBuffer(); // Convert File to ArrayBuffer
  const imageBytes = new Uint8Array(arrayBuffer);
  return imageBytes;
}

export const detectLabels = async (file: File) => {
  try {
    const bytes = await detectLabelsFromFile(file);

    const input: DetectLabelsCommandInput = {
      // DetectLabelsRequest
      Image: {
        // Image
        Bytes: bytes,
      },
      MaxLabels: 3,
    //   MinConfidence: 85,
      Features: ["GENERAL_LABELS", "IMAGE_PROPERTIES"],
      Settings: {
        // DetectLabelsSettings
        GeneralLabels: {
          LabelCategoryInclusionFilters: ["Apparel and Accessories"],
        },
        ImageProperties: {
          MaxDominantColors: 1,
        },
      },
    };

    const command = new DetectLabelsCommand(input);
    const response = await client.send(command);
    return response;
  } catch (error) {
    console.error("Communication failure: " + error);
  }
};
