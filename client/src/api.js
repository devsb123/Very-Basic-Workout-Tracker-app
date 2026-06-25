async function request(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  getSets: (tab) => request(`/api/sets?tab=${encodeURIComponent(tab)}`),
  addSet: (body) =>
    request("/api/sets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  deleteSet: (id) => request(`/api/sets/${id}`, { method: "DELETE" }),

  getRuns: () => request("/api/runs"),
  addRun: (body) =>
    request("/api/runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  deleteRun: (id) => request(`/api/runs/${id}`, { method: "DELETE" }),
};
