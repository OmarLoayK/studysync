const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

async function request(path, { body, method = "POST", user } = {}) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (user) {
    headers.Authorization = `Bearer ${await user.getIdToken()}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error ?? "Something went wrong.");
  }

  return payload;
}

export function createCheckoutSession(user, tier = "premium") {
  return request("/api/billing/create-checkout-session", { user, body: { tier } });
}

export function createPortalSession(user) {
  return request("/api/billing/create-portal-session", { user });
}

export function syncBillingStatus(user) {
  return request("/api/billing/status", { user });
}

export function generateAiResult(user, body) {
  return request("/api/ai/generate", { user, body });
}
