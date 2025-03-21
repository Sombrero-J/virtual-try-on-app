import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ parent }) => {

  // streaming promises from layout.server.ts
  const parentData = parent();
  const title = "Home"; //this is for the layout title
  return { parentData, title: title };
};
