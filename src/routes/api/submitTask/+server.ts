import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";
import { BEAUTY_API } from "$env/static/private";

export const POST: RequestHandler = async ({ request }) => {
  const formData = await request.formData();
  const fullBodyImageFile = formData.get("fullBodyImageFile") as File | null;
  const clothingImageFile = formData.get("clothingImageFile") as File | null;
  const category = formData.get("category") as string | null;

  if (!fullBodyImageFile || !clothingImageFile || !category) {
    return new Response(
      JSON.stringify({ message: "All form fields are required." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const fullBodyImageName = fullBodyImageFile.name;
  const clothingImageName = clothingImageFile.name;

  let fullBodyData: Buffer;
  let clothingData: Buffer;
  try {
    fullBodyData = Buffer.from(await fullBodyImageFile.arrayBuffer());
    clothingData = Buffer.from(await clothingImageFile.arrayBuffer());
  } catch (err) {
    console.error("Error converting files to Buffer:", err);
    return new Response(
      JSON.stringify({ message: "Error processing uploaded files." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Create the task
  const taskCreationResult = await createTask(
    fullBodyImageName,
    clothingImageName,
    category
  );
  console.log("Task creation result:", taskCreationResult);
  if (!taskCreationResult.success) {
    return new Response(
      JSON.stringify({
        message: taskCreationResult.error || "Task creation failed.",
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { task_uuid, user_img_url, cloth_img_url } = taskCreationResult;

  if (user_img_url) {
    const fullBodyUploadResult = await uploadFullBodyImage(
      user_img_url,
      fullBodyData
    );
    console.log("Full body upload result:", fullBodyUploadResult);
    if (!fullBodyUploadResult.success) {
      return new Response(
        JSON.stringify({ message: "Failed at uploading body image." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  if (cloth_img_url) {
    const clothingUploadResult = await uploadClothingImage(
      cloth_img_url,
      clothingData
    );
    console.log("Clothing upload result:", clothingUploadResult);
    if (!clothingUploadResult.success) {
      return new Response(
        JSON.stringify({ message: "Failed at uploading clothing image." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  if (task_uuid) {
    const { success, error } = await submitTask(task_uuid);
    if (!success)
      return new Response(
        JSON.stringify({
          message: error || "Task submission failed.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
  }

  return json({task_uuid});
};

async function createTask(
  fullBodyImageName: string,
  clothingImageName: string,
  category: string
): Promise<{
  success: boolean;
  task_uuid?: string;
  user_img_url?: string;
  cloth_img_url?: string;
  error?: string;
}> {
  const categoryItems = [
    "Upper Body",
    "Lower Body",
    "Dresses",
    "Full Body",
    "Hair",
  ];
  const categoryNum = categoryItems.indexOf(category) + 1;

  if (categoryNum === 0) {
    return { success: false, error: "Invalid category provided." };
  }

  const payload = {
    user_img_name: fullBodyImageName,
    cloth_img_name: clothingImageName,
    category: categoryNum.toString(),
    watermark: 2,
  };

  try {
    const response = await fetch("https://heybeauty.ai/api/create-task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${BEAUTY_API}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return {
        success: false,
        error: "Response Failure: Create Try On Request Failed.",
      };
    }

    const data = await response.json();
    if (data.code !== 0) {
      return { success: false, error: "API Error: " + data.message };
    }

    const { uuid, user_img_url, cloth_img_url } = data.data;
    console.log("User Image URL:", user_img_url);
    console.log("Cloth Image URL:", cloth_img_url);

    return { success: true, task_uuid: uuid, user_img_url, cloth_img_url };
  } catch (error) {
    console.error("Error creating task:", error);
    return { success: false, error: "Exception occurred while creating task." };
  }
}

async function uploadFullBodyImage(
  user_img_url: string,
  fullBodyData: Buffer
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(user_img_url, {
      method: "PUT",
      headers: {
        "Content-Type": "image/jpeg",
      },
      body: fullBodyData,
    });

    if (!response.ok) {
      return {
        success: false,
        error: "Response Failure: Upload Full Body Image Failed.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error uploading full body image:", error);
    return {
      success: false,
      error: "Exception occurred while uploading full body image.",
    };
  }
}

// Upload Clothing Image: Accepts the URL and file Buffer.
async function uploadClothingImage(
  cloth_img_url: string,
  clothingData: Buffer
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(cloth_img_url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/octet-stream",
      },
      body: clothingData,
    });

    if (!response.ok) {
      return {
        success: false,
        error: "Response Failure: Upload Clothing Image Failed.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error uploading clothing image:", error);
    return {
      success: false,
      error: "Exception occurred while uploading clothing image.",
    };
  }
}

async function submitTask(
  task_uuid: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  const payload = { task_uuid };
  try {
    const response = await fetch("https://heybeauty.ai/api/submit-task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${BEAUTY_API}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return { success: false, error: "Response Failure: Submit Task Failed." };
    }

    const data = await response.json();
    if (data.code !== 0) {
      return { success: false, error: "API Error: " + data.message };
    }

    return { success: true, message: task_uuid };
  } catch (error) {
    console.error("Error submitting task:", error);
    return {
      success: false,
      error: "Exception occurred while submitting task.",
    };
  }
}
