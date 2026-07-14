// Thin wrapper over the backend. Paths are relative so the Vite proxy handles the host.

export async function getTodaysChallenge() {
  const res = await fetch("/api/challenge/today");
  if (!res.ok) throw new Error(`Failed to load challenge (${res.status})`);
  return res.json();
}

export async function submitAudio(file) {
  const form = new FormData();
  form.append("audio", file);
  const res = await fetch("/api/submit", { method: "POST", body: form });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Submission failed (${res.status}): ${detail}`);
  }
  return res.json();
}
