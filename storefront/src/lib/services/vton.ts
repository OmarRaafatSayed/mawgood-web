// storefront/src/lib/services/vton.ts
import { Client } from "@gradio/client";

const GRADIO_SPACE = "yisol/IDM-VTON";
const TIMEOUT_MS = 180000;

interface VTonResult {
  success: boolean;
  resultUrl?: string;
  error?: string;
}

export async function virtualTryOn(
  personImage: File,
  garmentImage: File
): Promise<VTonResult> {
  try {
    const client = await Client.connect(GRADIO_SPACE);

    const personInput = {
      background: personImage,
      layers: [],
      composite: null,
    };

    // Use predict() which returns a Promise directly
    const result = await Promise.race([
      client.predict("/tryon", [
        personInput,
        garmentImage,
        "",
        true,
        false,
        30,
        42,
      ]),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("TIMEOUT")), TIMEOUT_MS)
      ),
    ]);

    const output = result.data[0];

    if (output && typeof output === "object" && "url" in output && output.url) {
      return { success: true, resultUrl: String(output.url) };
    }
    if (output && typeof output === "object" && "path" in output && output.path) {
      return { success: true, resultUrl: String(output.path) };
    }
    if (typeof output === "string" && output.length > 0) {
      return { success: true, resultUrl: output };
    }

    return {
      success: false,
      error: "الموديل لم يرجع نتيجة",
    };
  } catch (error: unknown) {
    const err = error as { message?: string };
    const message = err.message || "";

    if (message === "TIMEOUT") {
      return {
        success: false,
        error: "الموديل مشغول حالياً، حاول مرة أخرى بعد دقيقة",
      };
    }

    return {
      success: false,
      error: message || "حدث خطأ أثناء معالجة الصور",
    };
  }
}
