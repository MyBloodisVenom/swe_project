/** Map HTTP failures to clear UI copy; prefers API `{ error: string }` when present. */
export function pickErrorMessage(status, body) {
  const fromApi = body && typeof body.error === "string" && body.error.trim();
  if (fromApi) return fromApi;

  if (status === 0) {
    return "Can't reach the server. Start the API (see README) and check your network.";
  }
  switch (status) {
    case 400:
      return "Invalid request.";
    case 401:
      return "Session expired — please sign in again.";
    case 403:
      return "You don't have permission for this action.";
    case 404:
      return "Not found.";
    case 409:
      return "Conflict — this would overlap another block or duplicate data.";
    case 422:
      return "Invalid data.";
    case 429:
      return "Too many requests — try again in a moment.";
    default:
      if (status >= 500) return "Server error — try again later.";
      return `Something went wrong (${status}).`;
  }
}

export class ApiError extends Error {
  constructor(message, status, options = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.networkError = !!options.networkError;
  }
}

async function parseJson(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function apiFetch(path, { token, method = "GET", body } = {}) {
  let res;
  try {
    res = await fetch(path, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    const offline = typeof navigator !== "undefined" && navigator.onLine === false;
    throw new ApiError(
      offline
        ? "You're offline. Reconnect and try again."
        : "Can't reach the server — is the API running on the expected port?",
      0,
      { networkError: true }
    );
  }

  if (res.status === 204) return null;

  const data = await parseJson(res);
  if (res.ok) return data;

  throw new ApiError(pickErrorMessage(res.status, data), res.status, { networkError: false });
}
