import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { createNote } from "../api/notesApi.js";
export default function AddNote() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const handleAddNote = async e => {
    e.preventDefault();
    if (!note.trim()) return;
    try {
      await createNote(id, note.trim());
      navigate(`/customer/${id}`);
    } catch { setError("Could not save your note. Please try again."); }
  };
  return <div className="customer-form">
    <Link className="customer__back" to={`/customer/${id}`}>← Back to customer</Link>
    <h1>Add note</h1>
    <form onSubmit={handleAddNote}>
      <div className="form-group"><label htmlFor="note">Account note</label><textarea id="note" required value={note} onChange={e => setNote(e.target.value)} placeholder="Write a note about this account…" /></div>
      {error && <p role="alert">{error}</p>}
      <div className="form-actions"><button className="btn btn-primary" type="submit">Save note</button><Link className="btn btn-secondary" to={`/customer/${id}`}>Cancel</Link></div>
    </form>
  </div>;
}
