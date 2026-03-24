import toast from "react-hot-toast";

export async function copyTextToClipboard(text: string, successMessage = "Copied to clipboard"): Promise<boolean> {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    toast.success(successMessage);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      toast.success(successMessage);
      return true;
    } catch {
      toast.error("Could not copy — copy manually");
      return false;
    }
  }
}
