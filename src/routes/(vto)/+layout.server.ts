import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({
  locals: { user, session },
  cookies,
}) => {
  return {
    user,
    session,
    cookies: cookies.getAll(),
  };
};
