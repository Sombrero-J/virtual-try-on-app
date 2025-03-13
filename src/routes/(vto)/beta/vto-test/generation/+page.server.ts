import type { PageServerLoad, Actions } from "./$types";
import { fail, redirect } from "@sveltejs/kit";
import { uploadToStorage } from "$lib/server/database_helpers/storage";
import { BEAUTY_API } from "$env/static/private";
import { json } from "@sveltejs/kit";

export const load: PageServerLoad = async () => {
  return {};
};

export const actions: Actions = {
  tryon: async ({ request }) => {
    const formData = await request.formData();
    const fullBodyImageFile = formData.get("fullBodyImageFile") as File | null;
    const clothingImageFile = formData.get("clothingImageFile") as File | null;
    const category = formData.get("category") as string | null;

    if (!fullBodyImageFile || !clothingImageFile || !category) {
      return { success: false, message: "All form fields are required." };
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
      return { success: false, message: "Error processing image files." };
    }

    const data = await createTask(
      fullBodyImageName,
      clothingImageName,
      category
    );
    console.log(data);

    // Create the task
    const { success, task_uuid, user_img_url, cloth_img_url, error } =
      await createTask(fullBodyImageName, clothingImageName, category);
    console.log("Task creation result:", success);
    if (!success) return fail(400, { message: error });

    if (user_img_url) {
      // Upload the full body image
      const fullBodyUploadResult = await uploadFullBodyImage(
        user_img_url,
        fullBodyData
      );
      console.log("Full body upload result:", fullBodyUploadResult);
      if (!fullBodyUploadResult.success)
        return fail(400, { message: "Failed at uploading body image" });
    }

    if (cloth_img_url) {
      // Upload the clothing image
      console.log("Uploading clothing image");
      const clothingUploadResult = await uploadClothingImage(
        cloth_img_url,
        clothingData
      );
      console.log("Clothing upload result:", clothingUploadResult);
      if (!clothingUploadResult.success)
        return fail(400, { message: "Failed at uploading clothing image" });
    }

    if (task_uuid) {
      const { success, error } = await submitTask(task_uuid);
      if (!success) return fail(400, { message: error });
    }
    return json(task_uuid);
  },
  save: async ({ request, locals: { safeGetSession, supabase }, url }) => {
    // if user is not signed in, redirect them to login page, after that save the image to their profile
    const { session, user } = await safeGetSession();

    if (!session || !user) {
      const redirectTo = `${url.pathname}?autoSave=true`;
      redirect(303, `/auth/login?redirectTo=${encodeURIComponent(redirectTo)}`);
      // http://localhost:5173/auth/login?redirectTo=%2Fbeta%2Fvto-test%2Fgeneration-11%3FautoSave%3Dtrue
    }

    const formData = await request.formData();

    const taskID = formData.get("taskID") as string;

    const timestamp = Date.now();
    const modelName = `${timestamp}-${user.id}-model`;
    const tryonName = `${timestamp}-${user.id}-tryon`;

    const clothingFile = formData.get("clothingFile") as File;
    const clothingName = clothingFile.name;
    const modelFile = formData.get("modelFile") as File;

    const tryon = formData.get("tryonUrl") as string;
    const tryonFile = await getImageData(tryon, `taileo_tryon_${user.id}`);

    const MAX_SIZE = 15 * 1024 * 1024;
    if (checkFileSize([clothingFile, modelFile, tryonFile], MAX_SIZE)) {
      const clothingPath = await uploadToStorage(
        "clothings",
        clothingName,
        clothingFile,
        supabase,
        user.id
      );
      const modelPath = await uploadToStorage(
        "models",
        modelName,
        modelFile,
        supabase,
        user.id
      );
      const tryonPath = await uploadToStorage(
        "tryon",
        tryonName,
        tryonFile,
        supabase,
        user.id
      );

      // 2. Get public URLs for each uploaded file
      // const clothingUrl = await getStorageItemURL(
      //   "clothings",
      //   clothingPath,
      //   supabase
      // );
      // const modelUrl = await getStorageItemURL("models", modelPath, supabase);
      // const tryonUrl = await getStorageItemURL("tryon", tryonPath, supabase);

      // if (!clothingUrl || !modelUrl || !tryonUrl) {
      //   return fail(400, { message: "Save error: storage" });
      // }

      // 3. Call the RPC function to create database entries
      const { data, error } = await supabase.rpc("save_try_on_to_wardrobe", {
        p_user_id: user.id,
        p_clothing_name: clothingName,
        p_task_id: taskID,
        p_clothing_image_url: clothingPath,
        p_model_image_url: modelPath,
        p_try_on_image_url: tryonPath,
      });

      // 4. If the database operation fails, roll back by deleting all uploaded files
      if (error) {
        const buckets = [
          { bucket: "clothings", path: clothingPath },
          { bucket: "models", path: modelPath },
          { bucket: "tryon", path: tryonPath },
        ];

        for (const { bucket, path } of buckets) {
          const { error: delError } = await supabase.storage
            .from(bucket)
            .remove([path]);
          if (delError) {
            console.error(
              `Failed to delete orphaned file from ${bucket}: ${delError.message}`
            );
          }
        }
        console.log("Error saving: " + error + "Rollback storage success.");
        return fail(400, { message: "Save error. " + error });
      }

      // what is data? return clothing ID in database so we can goto wardrobe/clothingID
      return { success: true, data: data };
    } else {
      return { success: false, message: "File(s) exceeded maximum size." };
    }
  },
};

function checkFileSize(files: File[], maxSize: number): boolean {
  return files.every((file) => file.size < maxSize);
}

async function getImageData(
  imageOrigin: string,
  filename: string
): Promise<File> {
  const res = await fetch(imageOrigin);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type });
}

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
