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

export type ClothingWithTryOnsType = Awaited<
  ReturnType<typeof getClothingWithTryOns>
>;

export async function getClothingWithTryOns(
  supabase: supabaseFull,
  user_id: string
) {
  const response = supabase
    .from("clothings")
    .select(
      "name, categories_id, brands_id, materials_id, front_image_url, back_image_url, signed_front, signed_back, expiry_front, expiry_back, try_on_sessions(try_on_url, signed_try_on, signed_expiry), brands(name), categories(name), materials(name), colors(name)"
    )
    .eq("user_id", user_id)
    .order("last_modified", { ascending: false });

  const { data, error } = await response; // maybe remove await to make it non-blocking

  if (error) {
    throw new Error("Error fetching clothes: " + error.message);
  }

  const processedData = await Promise.all(
    data.map((item) => resolveSignedUrls(item, supabase))
  );
  return processedData;
}

export async function getOutfits(supabase: supabaseFull, user_id: string) {
  const { data, error } = await supabase
    .from("outfits")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Error fetching outfits: " + error.message);
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

interface UrlMappingConfig {
  bucket: string;
  signedField: string;
  expiryField: string;
  defaultExpiry: number;
}

const urlMappings: { [key: string]: UrlMappingConfig } = {
  front_image_url: {
    bucket: "clothings",
    signedField: "signed_front",
    expiryField: "expiry_front",
    defaultExpiry: 3600,
  },
  back_image_url: {
    bucket: "clothings",
    signedField: "signed_back",
    expiryField: "expiry_back",
    defaultExpiry: 3600,
  },
  try_on_url: {
    bucket: "tryon",
    signedField: "signed_try_on",
    expiryField: "signed_expiry",
    defaultExpiry: 3600,
  },
};

async function resolveSignedUrls<T extends Record<string, unknown>>(
  obj: T,
  supabase: supabaseFull
): Promise<T> {
  for (const key in urlMappings) {
    if (Object.hasOwn(obj, key) && typeof obj[key] === "string") {
      const config = urlMappings[key];
      const now = new Date();
      const signedField = config.signedField;
      const expiryField = config.expiryField;

      const filePath = obj[key];
      const storedSignedUrl = obj[signedField];
      const storedExpiry = obj[expiryField] as string | null;

      let needNewUrl = true;
      if (storedSignedUrl && storedExpiry) {
        if (new Date(storedExpiry) > now) {
          needNewUrl = false;
        }
      }

      if (needNewUrl) {
        const { data, error } = await supabase.storage
          .from(config.bucket)
          .createSignedUrl(filePath, config.defaultExpiry);

        if (error || !data) {
          console.error(
            `Error generating signed URLs for field ${String(filePath)}:`,
            error?.message
          );
          continue;
        }

        // Update the object with the new signed URL and expiry time.
        (obj as Record<string, unknown>)[signedField] = data.signedUrl;

        // Set the new expiry as current time (in seconds) plus default expiry
        (obj as Record<string, unknown>)[expiryField] = new Date(
          Date.now() + config.defaultExpiry * 1000
        ).toISOString();
      }
    }
  }

  // Recursively process any nested objects or arrays
  for (const key in obj) {
    if (Array.isArray(obj[key])) {
      obj[key] = await Promise.all(
        obj[key].map((item) =>
          typeof item === "object" && item !== null
            ? resolveSignedUrls(item as Record<string, unknown>, supabase)
            : item
        )
      );
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      obj[key] = await resolveSignedUrls(
        obj[key] as Record<string, unknown>,
        supabase
      );
    }
  }

  return obj;
}
