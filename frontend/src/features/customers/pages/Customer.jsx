import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./Customer.scss";
import PaymentGrid from "../components/PaymentGrid.jsx";
import { getCustomer, archiveCustomer } from "../api/customersApi.js";
import { getNotes, deleteNote } from "../api/notesApi.js";
import { setPaymentStatus } from "../api/paymentsApi.js";

export default function Customer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [notes, setNotes] = useState([]);
  const [savingPayment, setSavingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear); //get current year + set state for current year
  const years = [];
  for (let year = 2024; year <= currentYear; year++) {
    years.push(year);
  }

  useEffect(() => {
    async function fetchCustomer() {
      try {
        const data = await getCustomer(id);
        setCustomer(data);
      } catch (error) {
        console.error("Failed to fetch customer:", error);
        setCustomer(null);
      } finally {
        setLoading(false);
      }
    }

    async function fetchNotes() {
      try {
        const data = await getNotes(id);
        setNotes(data);
      } catch (error) {
        console.error("Failed to fetch notes:", error);
      }
    }

    fetchCustomer();
    fetchNotes();
  }, [id]);

  async function handleArchive() {
    try {
      await archiveCustomer(id);

      navigate("/");
    } catch (error) {
      console.error("Failed to archive customer:", error);
    }
  }

  if (loading) {
    return <><Link className="back-link" to="/">← Back to customers</Link><h1>Loading...</h1></>;
  }

  if (!customer) {
    return <><Link className="back-link" to="/">← Back to customers</Link><h1>Customer not found</h1></>;
  }

  async function handleSetPaymentStatus(month, isPaid) {
    const year = selectedYear;

    setSavingPayment(true);
    setPaymentError("");

    try {
      const updatedPayment = await setPaymentStatus(id, year, month, isPaid);

      setCustomer((current) => {
        if (current?.id !== updatedPayment.customerId) return current;

        const otherPayments = current.payments.filter(
          (p) => p.year !== year || p.month !== month,
        );

        return { ...current, payments: [...otherPayments, updatedPayment] };
      });
    } catch {
      setPaymentError("Could not save this month. Reload the page and try again.");
    } finally {
      setSavingPayment(false);
    }
  }

  const handleDeleteNote = async (noteId) => {
    try {
      await deleteNote(id, noteId);
      setNotes((currentNotes) => currentNotes.filter((n) => n.id !== noteId));
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  return (
    <div className="customer">
      <div className="customer__header">
        <Link className="customer__back" to={customer.isArchived ? "/?archived=true" : "/"}>
          ← Back to customer list
        </Link>

        <h1>{customer.name}</h1>

        <div className="customer__actions">
          <Link
            className="btn btn-secondary"
            to={`/customer/${customer.id}/edit`}
          >
            Edit
          </Link>

          {!customer.isArchived && <button
            className="btn btn-danger"
            onClick={() => setShowArchiveModal(true)}
          >
            Archive
          </button>}
        </div>
        <p className="customer__fee">€{Number(customer.monthlyFee).toFixed(2)} per month</p>
      </div>

      <div className="customer__sheet">
        <div className="customer__notes">
          <div className="notes__heading"><h2>Account notes</h2><Link to={`/customer/${customer.id}/addnote`}>+ Add note</Link></div>
          {notes.length === 0 && <p className="page-description">No notes on this account yet.</p>}
          {notes.map((n) => (
            <div key={n.id} className="note">
              {n.content}{" "}
              <button
                onClick={() => handleDeleteNote(n.id)}
                className="delete__note"
              >
                Delete note
              </button>
            </div>
          ))}
        </div>

        <div className="sheet__title">
          <h2>Payment Tracker</h2>

          <select
            aria-label="Payment year"
            disabled={savingPayment}
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <span className="status__badges">
            <span>
              <span className="complete"></span> Complete
            </span>
            <span>
              <span className="incomplete"></span> Pending
            </span>
          </span>
        </div>

        <div className="sheet__grid">
          {paymentError && <p role="alert">{paymentError}</p>}
          <PaymentGrid
            customer={customer}
            year={selectedYear}
            onSetPaid={handleSetPaymentStatus}
            saving={savingPayment}
          />
        </div>
      </div>

      {showArchiveModal && (
        <div className="modal">
          <div className="modal__content">
            <h2>Archive customer?</h2>
            <p>Are you sure you want to archive {customer.name}?</p>

            <div className="modal__actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowArchiveModal(false)}
              >
                Cancel
              </button>

              <button className="btn btn-danger" onClick={handleArchive}>
                Yes, archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
