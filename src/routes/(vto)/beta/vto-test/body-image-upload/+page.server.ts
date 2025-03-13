import { type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({parent}) => {
  const data = await parent();
  return {data}
};

export const actions: Actions = {
  flag: async ({ locals }) => {
    locals.uploadedBody = true;
    return { success: true };
  },
};
