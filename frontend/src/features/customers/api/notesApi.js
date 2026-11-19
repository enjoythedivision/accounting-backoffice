import { API_URL } from "../../../api/config.js";

export async function getNotes(customerId) {
  const response = await fetch(`${API_URL}/customers/${customerId}/notes`, {
    credentials: "include",
  });

  if (!response.ok) throw new Error("Could not load notes.");

  return response.json();
}

export async function createNote(customerId, content) {
  const response = await fetch(`${API_URL}/customers/${customerId}/notes`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) throw new Error("Could not save the note.");

  return response.json();
}

export async function deleteNote(customerId, noteId) {
  const response = await fetch(`${API_URL}/customers/${customerId}/notes/${noteId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) throw new Error("Could not delete the note.");
}
