import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createCustomer } from "../api/customersApi.js";

export default function AddNewCustomer() {
  const [name, setName] = useState("");
  const [fee, setFee] = useState("");
  const navigate = useNavigate();

  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!name.trim()) return;
    if (!fee) return;

    try {
      await createCustomer({
        name: name.trim(),
        monthlyFee: Number(fee),
      });

      navigate("/");
    } catch {
      setError("Could not save the customer. Check your connection and try again.");
    }
  }

  return (
    <div className="customer-form">
      <Link className="back-link" to="/">
        ← Back to customers
      </Link>
      <h1>Add New Customer</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Customer Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter customer name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="fee">Monthly Fee</label>
          <input
            id="fee"
            type="number"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            placeholder="Enter customer fee"
          />
        </div>

        {error && <p role="alert">{error}</p>}

        <button className="btn btn-primary" type="submit">
          Add Customer
        </button>
      </form>
    </div>
  );
}
