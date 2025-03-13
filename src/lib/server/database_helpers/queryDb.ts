import type { Database } from "$lib/type/supabase";

export async function getClothings(supabase: supabaseFull, user_id: string) {
  const { data, error } = await supabase
    .from("clothings")
    .select("*")
    .eq("user_id", user_id)
    .order("last_modified", { ascending: false });

  if (error) {
    throw new Error("Error fetching clothes: " + error.message);
  }
  return data;
}

export async function getOutfits(supabase: supabaseFull, user_id: string) {
  const { data, error } = await supabase
    .from("outfits")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Error fetching clothes: " + error.message);
  }
  return data;
}

export async function getTryOns(supabase: supabaseFull, user_id: string) {
  const { data, error } = await supabase
    .from("try_on_sessions")
    .select("*")
    .eq("user_id", user_id);
  // .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Error fetching try ons: " + error.message);
  }
  return data;
}

export interface FieldPair<
  TableName extends keyof Database["public"]["Tables"]
> {
  originalUrlKey: keyof TableRow<TableName>;
  signedUrlKey: keyof TableRow<TableName>;
  expiryKey: keyof TableRow<TableName>;
}

type TableRow<TableName extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][TableName]["Row"];

export const getDataWithSignedUrls = async <
  TableName extends keyof Database["public"]["Tables"]
>(
  supabase: supabaseFull,
  items: TableRow<TableName>[],
  bucket: string,
  fieldPairs: FieldPair<TableName>[]
): Promise<TableRow<TableName>[]> => {
  if (!items || items.length === 0) return items;

  const currentTime = new Date();

  // Process each field pair separately
  for (const pair of fieldPairs) {
    const { originalUrlKey, signedUrlKey, expiryKey } = pair;

    // Filter items that need new signed URLs for this particular field pair
    const itemsNeedingNewURLs = items.filter((item) => {
      const signedUrl = item[signedUrlKey];
      const expiry = item[expiryKey] as string | null;
      return !signedUrl || !expiry || new Date(expiry) < currentTime;
    });

    if (itemsNeedingNewURLs.length === 0) continue;

    // Extract original URLs
    const originalUrls = itemsNeedingNewURLs.map(
      // convert to string
      (item) => item[originalUrlKey] as string
    );

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrls(originalUrls, 3600);

    if (error || !data) {
      console.error(
        `Error generating signed URLs for field ${String(originalUrlKey)}:`,
        error?.message
      );
      // Continue to the next field pair if signing fails for this one
      continue;
    }

    // Update each item with its corresponding signed URL and expiry time
    itemsNeedingNewURLs.forEach((item, index) => {
      // Assert that the value for signedUrlKey is a string or null
      (item as Record<typeof signedUrlKey, string | null>)[signedUrlKey] =
        data[index]?.signedUrl || null;
      // Assert that the value for expiryKey is a string (ISO date)
      (item as Record<typeof expiryKey, string>)[expiryKey] = new Date(
        Date.now() + 3600 * 1000
      ).toISOString();
    });
  }

  return items;
};
