import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getCustomer, updateCustomer } from "../api/customersApi.js";

export default function EditCustomer() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [fee, setFee] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    async function loadCustomer() {
      try {
        const customer = await getCustomer(id);
        setName(customer.name);
        setFee(customer.monthlyFee);
      } catch {
        setLoadError("Could not load the customer. Please reload the page.");
      } finally {
        setLoading(false);
      }
    }

    loadCustomer();
  }, [id]);

  if (loading) {
    return <div className="customer-form"><Link className="back-link" to={`/customer/${id}`}>← Back to customer</Link><h1>Loading...</h1></div>;
  }

  if (loadError) {
    return <div className="customer-form"><Link className="back-link" to="/">← Back to customers</Link><p role="alert">{loadError}</p></div>;
  }

  async function handleEdit(e) {
    e.preventDefault();
    setError("");

    if (!name.trim()) return;
    if (!fee) return;

    try {
      await updateCustomer(id, {
        name: name.trim(),
        monthlyFee: Number(fee),
      });

      navigate(`/customer/${id}`);
    } catch {
      setError("Could not save the changes. Check your connection and try again.");
    }
  }

  return (
    <div className="customer-form">
      <Link className="back-link" to={`/customer/${id}`}>← Back to customer</Link>
      <h1>Edit Customer Details</h1>

      <form onSubmit={handleEdit}>
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
          Save Changes
        </button>
      </form>
    </div>
  );
}
