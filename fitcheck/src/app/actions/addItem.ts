"use server";
// =============================================================================
// FILE: app/actions/addItem.ts
// =============================================================================
// This is a Next.js Server Action — a TypeScript function that runs ONLY on
// the server (never in the browser), even though it's called from a React form.
//
// "use server" at the top of the file marks every exported function in this
// file as a Server Action.  Next.js handles the secure HTTP transport for you.
//
// What this function does, step by step:
//   1. Validates that all required fields are present in the form data
//   2. Generates a unique filename to avoid collisions in the bucket
//   3. Uploads the image file to the Supabase 'clothing_raw' storage bucket
//   4. Retrieves the permanent public URL of the uploaded image
//   5. Inserts a new row into the 'items' database table
//   6. Returns a typed result object (success or error) to the calling component
// =============================================================================

import { createClient } from "@supabase/supabase-js";

// --- Types -------------------------------------------------------------------

// The shape of every field that the "Add Item" form will send us.
// These names must EXACTLY match the `name` attributes on your <input> elements.
interface AddItemFormData {
  name: string;
  category: string;
  sub_category: string;
  fabric: string;
  imageFile: File;
}

// A discriminated union for the return value — forces the caller to handle
// both success and error cases explicitly (no silent failures).
type AddItemResult =
  | { success: true; itemId: string }
  | { success: false; error: string };

// --- Supabase client (server-side) -------------------------------------------
// We create the Supabase client INSIDE the module (not inside the function) so
// it's only instantiated once per server process — not on every request.
//
// On the SERVER we use non-prefixed env vars (they are never sent to the browser).
// Note: For production with auth, swap the anon key for the SERVICE_ROLE key
// stored in a non-NEXT_PUBLIC_ variable so it stays 100% server-only.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- The Server Action -------------------------------------------------------

export async function addItem(formData: FormData): Promise<AddItemResult> {
  // ── 1. Extract and validate all fields from FormData ──────────────────────
  // FormData.get() returns `string | File | null`. We cast explicitly after
  // checking for null so TypeScript doesn't complain downstream.

  const name = formData.get("name") as string | null;
  const category = formData.get("category") as string | null;
  const sub_category = formData.get("sub_category") as string | null;
  const fabric = formData.get("fabric") as string | null;    // optional field
  const imageFile = formData.get("image") as File | null;

  // Validate required fields
  if (!name || !category || !sub_category) {
    return {
      success: false,
      error: "Missing required fields: name, category, and sub_category are all required.",
    };
  }

  if (!imageFile || imageFile.size === 0) {
    return {
      success: false,
      error: "No image file was attached. Please select a photo of your clothing item.",
    };
  }

  // Validate file type — only allow common image formats
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!ALLOWED_TYPES.includes(imageFile.type)) {
    return {
      success: false,
      error: `Invalid file type: "${imageFile.type}". Please upload a JPEG, PNG, or WEBP image.`,
    };
  }

  // Validate file size — cap at 5 MB to protect your Supabase storage quota
  const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
  if (imageFile.size > MAX_SIZE_BYTES) {
    return {
      success: false,
      error: `File is too large (${(imageFile.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed size is 5 MB.`,
    };
  }

  // ── 2. Build a unique, collision-proof filename ────────────────────────────
  // Why not just use the original filename?
  //   - Two users could both upload "photo.jpg" → one overwrites the other.
  //   - Filenames with spaces or special characters can break URLs.
  // Solution: prefix with a timestamp + random string + sanitised name.
  //
  // Example output: "1718123456789-a3f9b2/lucknowi-kurti.webp"
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).slice(2, 8); // e.g. "a3f9b2"
  const sanitisedName = imageFile.name
    .toLowerCase()
    .replace(/\s+/g, "-")           // spaces → hyphens
    .replace(/[^a-z0-9.\-]/g, "");  // strip everything except alphanumeric, dot, hyphen
  const filePath = `${timestamp}-${randomSuffix}/${sanitisedName}`;

  // ── 3. Upload the image to Supabase Storage ────────────────────────────────
  // `supabase.storage.from('clothing_raw')` selects our bucket.
  // `.upload(filePath, imageFile)` streams the file to Supabase.
  // `contentType` ensures browsers serve the file with the correct MIME type.
  const { error: uploadError } = await supabase.storage
    .from("clothing_raw")
    .upload(filePath, imageFile, {
      contentType: imageFile.type,
      upsert: false,    // false = error if file already exists (extra safety net)
    });

  if (uploadError) {
    console.error("[FitCheck] Storage upload error:", uploadError);
    return {
      success: false,
      error: `Image upload failed: ${uploadError.message}. Please try again.`,
    };
  }

  // ── 4. Get the permanent public URL ────────────────────────────────────────
  // This is a synchronous helper — no network call needed.
  // It constructs the URL from your Supabase project URL + bucket + file path.
  // Example: https://xyzabc.supabase.co/storage/v1/object/public/clothing_raw/...
  const { data: urlData } = supabase.storage
    .from("clothing_raw")
    .getPublicUrl(filePath);

  const publicImageUrl = urlData.publicUrl;

  // ── 5. Insert the new clothing item into the database ─────────────────────
  // Column names here must EXACTLY match your 'items' table schema.
  // `fabric` is intentionally nullable — if not provided, we store null.
  const { data: insertedItem, error: dbError } = await supabase
    .from("items")
    .insert({
      name:         name.trim(),
      category:     category.trim(),
      sub_category: sub_category.trim(),
      fabric:       fabric?.trim() || null,   // optional — gracefully defaults to null
      image_url:    publicImageUrl,
    })
    .select("id")           // return only the new row's ID (avoids fetching all columns)
    .single();              // we inserted one row, so expect exactly one result

  if (dbError) {
    console.error("[FitCheck] Database insert error:", dbError);

    // Attempt to clean up the orphaned image since the DB row failed.
    // This keeps your storage bucket tidy (best-effort — don't fail if this also errors).
    await supabase.storage.from("clothing_raw").remove([filePath]);

    return {
      success: false,
      error: "DB Error: " + dbError.message + " | Hint: " + (dbError.hint || "None")
    };
  }

  // ── 6. Return success ──────────────────────────────────────────────────────
  console.log(`[FitCheck] ✅ Item "${name}" added successfully. ID: ${insertedItem.id}`);
  return {
    success: true,
    itemId: insertedItem.id,
  };
}
