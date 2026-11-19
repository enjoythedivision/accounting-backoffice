import { API_URL } from "../../../api/config.js";

export async function getCustomers(archived = false) {
  const response = await fetch(`${API_URL}/customers?archived=${archived}`, {
    credentials: "include",
  });

  if (!response.ok) throw new Error("Could not load customers.");

  return response.json();
}

export async function getCustomer(id) {
  const response = await fetch(`${API_URL}/customers/${id}`, {
    credentials: "include",
  });

  if (!response.ok) throw new Error("Could not load the customer.");

  return response.json();
}

export async function createCustomer(customer) {
  const response = await fetch(`${API_URL}/customers`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(customer),
  });

  if (!response.ok) throw new Error("Could not save the customer.");

  return response.json();
}

export async function updateCustomer(id, customer) {
  const response = await fetch(`${API_URL}/customers/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(customer),
  });

  if (!response.ok) throw new Error("Could not save the changes.");

  return response.json();
}

export async function archiveCustomer(id) {
  const response = await fetch(`${API_URL}/customers/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) throw new Error("Could not archive the customer.");
  // This endpoint returns no data, so there is no response.json().
}

export async function restoreCustomer(id) {
  const response = await fetch(`${API_URL}/customers/${id}/restore`, {
    method: "PATCH",
    credentials: "include",
  });

  if (!response.ok) throw new Error("Could not restore the customer.");
}
