export async function getStorageItemURL(
  bucket: string,
  filePath: string,
  supabase: supabaseFull
) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filePath, 60);

  if (error) {
    console.error("Error downloading image: ", error.message);
    return null;
  }

  return data.signedUrl;
}
