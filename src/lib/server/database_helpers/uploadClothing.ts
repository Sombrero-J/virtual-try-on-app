// import { uploadToStorage } from "./uploadToStorage";

// export async function uploadClothing(
//   id: string,
//   imageFile: File,
//   user_id: string,
//   supabase: supabaseFull
// ) {
//   try {
//     const filePath = await uploadToStorage(
//       "test",
//       imageFile.name,
//       imageFile,
//       supabase,
//       user_id,
//     );
//     const data = await saveToClothingsAndWardrobesTables(
//       id,
//       filePath,
//       supabase
//     );
//     return data;
//   } catch (error) {
//     throw new Error("Error uploading clothing: " + error);
//   }
// }

// // async function uploadImageToStorage(
// //   id: string,
// //   file: File,
// //   supabase: SupabaseClient
// // ) {
// //   const timestamp = Date.now();
// //   const fileName = `${timestamp}_${file.name}`;

// //   const { data, error } = await supabase.storage
// //     .from("test")
// //     .upload(`${id}/${fileName}`, file);

// //   if (error) {
// //     throw new Error("Error uploading image: " + error.message);
// //   }

// //   return data.path; // Returns the file path in the storage
// // }

// async function saveToClothingsAndWardrobesTables(
//   id: string,
//   filePath: string,
//   supabase: supabaseFull
// ) {
//   const { data, error } = await supabase.rpc("upload_clothings", {
//     file_path: filePath,
//     user_id: id,
//   });
//   if (error) {
//     throw new Error("Error uploading clothings to database: " + error.message);
//   }
//   return data;
// }
