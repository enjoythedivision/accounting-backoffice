import { API_URL } from "../../../api/config.js";

export async function setPaymentStatus(customerId, year, month, isPaid) {
  const response = await fetch(`${API_URL}/customers/${customerId}/payments/${year}/${month}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isPaid }),
  });

  if (!response.ok) throw new Error("Could not save the payment status.");

  return response.json();
}
