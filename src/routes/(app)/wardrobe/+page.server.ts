import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ parent }) => {

  // streaming promises from layout.server.ts
  const title = "Wardrobe"; //this is for the layout title
  const parentData = parent();

  return { parentData, title: title };
};