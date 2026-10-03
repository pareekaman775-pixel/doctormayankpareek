const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

export const API_URL = (
  configuredApiUrl ||
  (import.meta.env.DEV ? "http://localhost:5000" : "")
).replace(/\/+$/, "");

export class ApiRequestError extends Error {
  readonly kind: "configuration" | "connection" | "invalid-response";

  constructor(
    message: string,
    kind: "configuration" | "connection" | "invalid-response",
    cause?: unknown
  ) {
    super(message, { cause });
    this.name = "ApiRequestError";
    this.kind = kind;
  }
}

export const assertApiUrlConfigured = (): void => {
  if (!API_URL) {
    throw new ApiRequestError(
      "The API URL is not configured. Set VITE_API_URL in the frontend deployment environment.",
      "configuration"
    );
  }
};

export const apiFetch = async (
  path: string,
  options: RequestInit
): Promise<Response> => {
  assertApiUrlConfigured();

  const normalizedPath = `/${path.replace(/^\/+/, "")}`;

  try {
    return await fetch(`${API_URL}${normalizedPath}`, options);
  } catch (error) {
    const originalMessage = error instanceof Error
      ? error.message
      : String(error);

    throw new ApiRequestError(
      `Unable to reach the backend. It may be unavailable or blocked by CORS/network settings. Original error: ${originalMessage}`,
      "connection",
      error
    );
  }
};

export const readApiResponse = async <T>(
  response: Response
): Promise<T> => {
  try {
    return await response.json() as T;
  } catch (error) {
    const originalMessage = error instanceof Error
      ? error.message
      : String(error);

    throw new ApiRequestError(
      `The backend returned an invalid JSON response (HTTP ${response.status}). Original error: ${originalMessage}`,
      "invalid-response",
      error
    );
  }
};