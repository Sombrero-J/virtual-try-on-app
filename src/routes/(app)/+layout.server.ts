import type { LayoutServerLoad } from "./$types";
import {
  getClothingWithTryOns,
} from "$lib/server/database_helpers/queryDb";

import { fail } from "@sveltejs/kit";

export const load: LayoutServerLoad = async ({
  locals: { supabase, user, session },
  cookies,
}) => {
  if (!session || !user) {
    return fail(401, { clothes: [], tryOns: [], user: null });
  }

  const clothingsWithTryOns = getClothingWithTryOns(supabase, user.id);

  return {
    clothingsWithTryOns,
    user,
    session,
    cookies: cookies.getAll(),
  };
};