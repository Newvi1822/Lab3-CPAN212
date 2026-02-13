const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const TIMEOUT = 10000; // 10 second timeout

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    throw error;
  }
}

async function handleJson(res) {
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await res.json() : null;

  if (!res.ok) {
    const message =
      (body && (body.error || body.message)) ||
      `Request failed with status ${res.status}`;
    const details = body && body.details ? body.details : null;
    const errors = body && body.errors ? body.errors : null;
    
    const err = new Error(message);
    err.status = res.status;
    err.details = details;
    err.errors = errors;
    throw err;
  }

  return body;
}

// Health check
export async function health() {
  const res = await fetchWithTimeout(`${BASE}/health`);
  return handleJson(res);
}

// Get all incidents (with optional archived filter)
export async function listIncidents(includeArchived = false) {
  const url = includeArchived 
    ? `${BASE}/api/incidents?includeArchived=true`
    : `${BASE}/api/incidents`;
  const res = await fetchWithTimeout(url);
  return handleJson(res);
}

// Get incident by ID
export async function getIncident(id) {
  const res = await fetchWithTimeout(`${BASE}/api/incidents/${encodeURIComponent(id)}`);
  return handleJson(res);
}

// Create a new incident
export async function createIncident(payload) {
  const res = await fetchWithTimeout(`${BASE}/api/incidents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return handleJson(res);
}

// Update incident status
export async function changeIncidentStatus(id, status) {
  const res = await fetchWithTimeout(`${BASE}/api/incidents/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
  return handleJson(res);
}

// Bulk CSV upload
export async function bulkUploadCsv(file) {
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetchWithTimeout(`${BASE}/api/incidents/bulk-upload`, {
    method: "POST",
    body: fd
  });

  return handleJson(res);
}

// API object for convenience
export const api = {
  health,
  getIncidents: listIncidents,
  getIncident,
  createIncident,
  updateStatus: changeIncidentStatus,
  bulkUpload: bulkUploadCsv
};