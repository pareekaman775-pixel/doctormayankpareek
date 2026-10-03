export const API_URL = (import.meta.env.VITE_API_URL || "")
  .trim()
  .replace(/\/+$/, "");

export const assertApiUrlConfigured = (): void => {
  if (!API_URL) {
    throw new Error(
      "The API URL is not configured. Set VITE_API_URL in the deployment environment."
    );
  }
};