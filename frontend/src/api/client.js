const getErrorMessage = (data, fallback) =>
  data?.message || data?.error || data?.errors?.[0]?.message || fallback;

export const apiRequest = async (baseUrl, path, options = {}) => {
  let response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      credentials: "include",
      ...options,
    });
  } catch {
    throw new Error("Unable to reach the server");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(getErrorMessage(data, `Request failed (${response.status})`));
  return data;
};
