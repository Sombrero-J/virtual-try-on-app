import type { RequestHandler } from "./$types";
import { BEAUTY_API } from "$env/static/private";

const POLLING_INTERVAL_MS = 5000; 
const MAX_POLLING_ATTEMPTS = 8;

export const POST: RequestHandler = async ({ request }) => {
  try {
    const {taskID} = await request.json();
    let result = await tryOnResult(taskID);
    if (!result.success) {
      // Early return if initial API call fails
      return new Response(JSON.stringify({ error: result.error }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    let currentStatus = result.status;
    console.log("Initial Status:", currentStatus);

    let attempts = 0;
    // Poll until the task is either "successed" or "failed"
    while (currentStatus !== "successed" && currentStatus !== "failed") {
      if (attempts++ >= MAX_POLLING_ATTEMPTS) {
        console.error("Polling timed out after maximum attempts");
        return new Response(JSON.stringify({ error: "Task timed out" }), {
          status: 408, // Request Timeout
          headers: { "Content-Type": "application/json" }
        });
      }

      await delay(POLLING_INTERVAL_MS);

      result = await tryOnResult(taskID);
      if (!result.success) {
        return new Response(JSON.stringify({ error: result.error }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      currentStatus = result.status;
      console.log("Polled Status:", currentStatus);
    }

    if (currentStatus === "successed") {
      const tryonUrl = result.data;
      console.log("Task succeeded with URL:", tryonUrl);
      return new Response(JSON.stringify({ url: tryonUrl }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
      
    } else if (currentStatus === "failed") {
      const errorMsg = result.data || "Task failed without error details.";
      console.error("Task failed with error:", errorMsg);
      return new Response(JSON.stringify({ error: errorMsg }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Fallback for any unforeseen errors
    return new Response(JSON.stringify({ error: "Unknown task status." }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Unexpected error in load function:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const tryOnResult = async (task_uuid: string): Promise<{ success: boolean; status?: string; data?: string; error?: string }> => {
  try {
    const payload = { task_uuid };
    const response = await fetch(`https://heybeauty.ai/api/get-task-info`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${BEAUTY_API}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error("Fetch error with status", response.status);
      return {
        success: false,
        error: `Failed to fetch task info, status code: ${response.status}`
      };
    }

    const data = await response.json();
    if (data.code !== 0) {
      console.error("API responded with error:", data.message);
      return {
        success: false,
        error: `API Error: ${data.message}`
      };
    }

    console.log("Try On Result:", data);
    const status = data.data.status;

    return {
      success: true,
      status,
      data: data.data.tryon_img_url || data.data.err_msg,
    };
  } catch (error) {
    console.error("Error during tryOnResult fetch:", error);
    return {
      success: false,
      error: `Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`
    };
  }
};
