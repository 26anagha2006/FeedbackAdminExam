
import { useEffect, useState } from "react";
import "./App.css";

const API = "https://feedback-admin-api-2ma1.onrender.com/api/feedback";

function App() {
  const [feedback, setFeedback] = useState([]);
  const [page, setPage] = useState(false);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    courseName: "",
    courseDuration: "",
    comments: "",
    rating: "5"
  });

  async function loadFeedback() {
    try {
      const res = await fetch(API);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not load feedback");
      setFeedback(data);
    } catch (err) {
      setMessage(err.message);
    }
  }

  useEffect(() => {
    loadFeedback();
  }, []);

  function addFeedback() {
    setEditing(null);
    setForm({
      courseName: "",
      courseDuration: "",
      comments: "",
      rating: "5"
    });
    setMessage("");
    setPage(true);
  }

  function editFeedback(item) {
    setEditing(item._id);
    setForm({
      courseName: item.courseName,
      courseDuration: item.courseDuration,
      comments: item.comments,
      rating: String(item.rating)
    });
    setMessage("");
    setPage(true);
  }

  async function submitFeedback(e) {
    e.preventDefault();
    try {
      const res = await fetch(editing ? `${API}/${editing}` : API, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, rating: Number(form.rating) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Save failed");

      setPage(false);
      setEditing(null);
      setMessage("Feedback saved successfully!");
      await loadFeedback();
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function deleteFeedback(id) {
    if (!window.confirm("Delete this feedback?")) return;
    try {
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");
      setMessage("Feedback deleted successfully!");
      await loadFeedback();
    } catch (err) {
      setMessage(err.message);
    }
  }

  const average = feedback.length
    ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
    : "0.0";

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>Feed<span>Back.</span></h2>
        <p className="muted">ADMIN PANEL</p>
        <button className={!page ? "nav active" : "nav"} onClick={() => setPage(false)}>
          ▦ Dashboard
        </button>
        <button className="nav" onClick={addFeedback}>＋ Add Feedback</button>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h1>{page ? (editing ? "Update Feedback" : "Add Feedback") : "Dashboard"}</h1>
            <p>Manage course feedback efficiently</p>
          </div>
          <button className="primary" onClick={addFeedback}>+ Add Feedback</button>
        </header>

        {message && <div className="notice">{message}</div>}

        {!page ? (
          <>
            <section className="cards">
              <div className="stat"><p>Total Feedback</p><h2>{feedback.length}</h2></div>
              <div className="stat"><p>Average Rating</p><h2>★ {average}/5</h2></div>
              <div className="stat"><p>Courses Reviewed</p><h2>{new Set(feedback.map(f => f.courseName.toLowerCase())).size}</h2></div>
            </section>

            <section className="panel">
              <h2>Course Feedback</h2>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Course ID</th>
                      <th>Course Name</th>
                      <th>Course Duration</th>
                      <th>Overall Rating</th>
                      <th>Comments</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedback.map(f => (
                      <tr key={f._id}>
                        <td>{f._id.slice(-6).toUpperCase()}</td>
                        <td>{f.courseName}</td>
                        <td>{f.courseDuration}</td>
                        <td className="rating">★ {f.rating}/5</td>
                        <td>{f.comments}</td>
                        <td>
                          <button className="edit" onClick={() => editFeedback(f)}>Update</button>{" "}
                          <button className="delete" onClick={() => deleteFeedback(f._id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                    {!feedback.length && (
                      <tr><td colSpan="6" className="empty">No feedback yet. Add your first record.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : (
          <section className="form-panel">
            <h2>{editing ? "Update Feedback" : "Add New Feedback"}</h2>
            <form onSubmit={submitFeedback}>
              <label>Course Name</label>
              <input required value={form.courseName} onChange={e => setForm({ ...form, courseName: e.target.value })} placeholder="Enter course name" />

              <label>Course Duration</label>
              <input required value={form.courseDuration} onChange={e => setForm({ ...form, courseDuration: e.target.value })} placeholder="e.g. 6 weeks" />

              <label>Feedback Comments</label>
              <textarea required rows="4" value={form.comments} onChange={e => setForm({ ...form, comments: e.target.value })} placeholder="Write comments..." />

              <label>Feedback Rating</label>
              <select value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })}>
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Very Good</option>
                <option value="3">3 - Good</option>
                <option value="2">2 - Fair</option>
                <option value="1">1 - Poor</option>
              </select>

              <div className="form-actions">
                <button className="primary">{editing ? "Update Feedback" : "Submit Feedback"}</button>
                <button type="button" className="cancel" onClick={() => setPage(false)}>Cancel</button>
              </div>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
