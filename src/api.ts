const configuredApiBaseUrl = import.meta.env.VITE_API_URL?.trim();

const apiBaseUrl = (
  configuredApiBaseUrl ||
  (import.meta.env.DEV ? "http://localhost:5000" : "")
).replace(/\/+$/, "");

export const apiUrl = (path: string): string => {
  if (!apiBaseUrl) {
    throw new Error(
      "The API URL is not configured. Set VITE_API_URL in the deployment environment."
    );
  }

  return `${apiBaseUrl}/${path.replace(/^\/+/, "")}`;
};