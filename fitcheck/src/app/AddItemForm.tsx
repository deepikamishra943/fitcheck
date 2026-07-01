"use client";
// =============================================================================
// FILE: app/add-item/AddItemForm.tsx
// =============================================================================
// This is the frontend form component. The "use client" directive at the top
// tells Next.js this component runs in the browser (not on the server), which
// is required because we're using React hooks (useState) and browser events.
//
// How it connects to the backend:
//   - The form's onSubmit handler collects all field values into a FormData object.
//   - It calls the `addItem` Server Action directly (imported like a regular function).
//   - Next.js secretly handles the secure HTTP call to the server for you.
//   - We use a `status` state machine to show the user what's happening at all times.
//
// Plug this into your existing v0.dev design:
//   - Replace the <input> and <select> elements with your own styled components.
//   - Keep the `name` attributes identical — they are what the Server Action reads.
//   - Keep the `ref`, `onSubmit`, and button `disabled` logic intact.
// =============================================================================

import { useRef, useState } from "react";
import { addItem } from "@/app/actions/addItem";

// --- Types -------------------------------------------------------------------

// A simple state machine for the form's lifecycle.
// Using a union type (instead of multiple booleans) prevents impossible states
// like `isLoading: true` and `isError: true` being true simultaneously.
type FormStatus =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "success"; itemId: string }
  | { state: "error"; message: string };

// --- Component ---------------------------------------------------------------

export default function AddItemForm() {
  // `status` drives everything: the button label, error messages, and success UI.
  const [status, setStatus] = useState<FormStatus>({ state: "idle" });

  // A ref to the <form> element so we can call formRef.current.reset() after
  // a successful submit — this clears all fields without a page reload.
  const formRef = useRef<HTMLFormElement>(null);

  // ── handleSubmit ──────────────────────────────────────────────────────────
  // Called when the user clicks the submit button. We use onSubmit on the
  // <form> element (not onClick on the button) so keyboard submission (Enter)
  // also works.
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    // Prevent the browser's default form submission (which would reload the page)
    event.preventDefault();

    // Switch to loading state immediately — this disables the button and shows
    // "Uploading..." so the user knows something is happening.
    setStatus({ state: "loading" });

    try {
      // Build a FormData object directly from the <form> DOM element.
      // This automatically collects every <input>, <select>, and <textarea>
      // that has a `name` attribute — including the file input.
      const formData = new FormData(event.currentTarget);

      // Call the Server Action. Next.js serialises formData, sends it to the
      // server, runs addItem(), then returns the typed result back here.
      const result = await addItem(formData);

      if (result.success) {
        // ✅ Happy path: clear the form and show a success message.
        formRef.current?.reset();
        setStatus({ state: "success", itemId: result.itemId });
      } else {
        // ⚠️ Known error returned from the Server Action (e.g. missing field,
        // file too large). Show the specific message from the server.
        setStatus({ state: "error", message: result.error });
      }
    } catch (unexpectedError) {
      // 🔥 Unexpected error (network failure, unhandled exception on server).
      // Log the full error for debugging, show a safe generic message to user.
      console.error("[FitCheck] Unexpected error submitting form:", unexpectedError);
      setStatus({
        state: "error",
        message: "Something went wrong on our end. Please try again in a moment.",
      });
    }
  }

  // ── Derived UI values ─────────────────────────────────────────────────────
  const isLoading = status.state === "loading";

  // The button label changes to reflect the current state.
  const buttonLabel = isLoading ? "Uploading..." : "Add to Wardrobe ✨";

  // ==========================================================================
  // RENDER
  // ==========================================================================
  // Swap the plain HTML elements below for your v0.dev styled components.
  // The only things you MUST keep:
  //   ✅ `ref={formRef}` on the <form>
  //   ✅ `onSubmit={handleSubmit}` on the <form>
  //   ✅ `name="..."` attributes matching the Server Action field names
  //   ✅ `name="image"` and `type="file"` on the file input
  //   ✅ `disabled={isLoading}` on the submit button
  // ==========================================================================
  return (
    <form ref={formRef} onSubmit={handleSubmit} style={{ maxWidth: 480 }}>
      <h2>Add New Item to FitCheck</h2>

      {/* ── Item Name ──────────────────────────────────────────────────────── */}
      <div>
        <label htmlFor="name">Item Name *</label>
        <input
          id="name"
          name="name"                  
          type="text"
          placeholder='e.g. "Lucknowi Chikankari Kurti"'
          required
          disabled={isLoading}
        />
      </div>

      {/* ── Category ───────────────────────────────────────────────────────── */}
      {/* Values here must match the CHECK constraint in your 'items' table    */}
      <div>
        <label htmlFor="category">Category *</label>
        <select
          id="category"
          name="category"              
          required
          disabled={isLoading}
        >
          <option value="">Select a category…</option>
          {/* ── Western ── */}
          <optgroup label="Western">
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
            <option value="shoes">Shoes</option>
          </optgroup>
          {/* ── Indian / Fusion ── */}
          <optgroup label="Indian / Fusion">
            <option value="kurti_kurta">Kurti / Kurta</option>
            <option value="traditional_bottom">Traditional Bottom</option>
            <option value="dupatta_stole">Dupatta / Stole</option>
          </optgroup>
        </select>
      </div>

      {/* ── Sub-category ───────────────────────────────────────────────────── */}
      <div>
        <label htmlFor="sub_category">Sub-category *</label>
        <input
          id="sub_category"
          name="sub_category"           
          type="text"
          placeholder='e.g. "palazzo", "crop top", "sneakers", "juttis"'
          required
          disabled={isLoading}
        />
      </div>

      {/* ── Fabric (optional) ──────────────────────────────────────────────── */}
      <div>
        <label htmlFor="fabric">Fabric (optional)</label>
        <input
          id="fabric"
          name="fabric"               
          type="text"
          placeholder='e.g. "cotton", "silk", "georgette", "denim"'
          disabled={isLoading}
        />
      </div>

      {/* ── Image Upload ───────────────────────────────────────────────────── */}
      {/* The `name` here MUST be "image" — that's what the Server Action      */}
      {/* reads with formData.get("image")                                     */}
      <div>
        <label htmlFor="image">Photo of Item *</label>
        <input
          id="image"
          name="image"                  
          type="file"
          accept="image/jpeg,image/png,image/webp"  
          required
          disabled={isLoading}
        />
        <small>JPEG, PNG or WEBP · Max 5 MB</small>
      </div>

      {/* ── Submit Button ──────────────────────────────────────────────────── */}
      {/* `disabled` during loading prevents double-submits                    */}
      <button type="submit" disabled={isLoading}>
        {buttonLabel}
      </button>

      {/* ── Feedback: Error ────────────────────────────────────────────────── */}
      {status.state === "error" && (
        <div role="alert" style={{ color: "red", marginTop: 12 }}>
          <strong>Error:</strong> {status.message}
          {/* Let the user try again without a full page reload */}
          <button
            type="button"
            onClick={() => setStatus({ state: "idle" })}
            style={{ marginLeft: 8 }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Feedback: Success ──────────────────────────────────────────────── */}
      {status.state === "success" && (
        <div role="status" style={{ color: "green", marginTop: 12 }}>
          ✅ Item added to your wardrobe!
          {/* Allow adding another item without navigating away */}
          <button
            type="button"
            onClick={() => setStatus({ state: "idle" })}
            style={{ marginLeft: 8 }}
          >
            Add Another
          </button>
        </div>
      )}
    </form>
  );
}