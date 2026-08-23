"use client";

import { useEffect, useState, use } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

type ComplaintHistory = {
  id: string;
  status: string;
  note: string | null;
  createdAt: string;
};

type Complaint = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  photoUrl: string | null;
  createdAt: string;
  user: { name: string; email: string };
  history: ComplaintHistory[];
};

export default function ComplaintDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data: session } = useSession();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);

  // Update state for Admin
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [note, setNote] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchComplaint = async () => {
    try {
      const res = await fetch(`/api/complaints/${resolvedParams.id}`);
      if (res.ok) {
        const data = await res.json();
        setComplaint(data);
        setStatus(data.status);
        setPriority(data.priority);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, [resolvedParams.id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await fetch(`/api/complaints/${resolvedParams.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, priority, note }),
      });
      if (res.ok) {
        setNote("");
        fetchComplaint(); // Refresh data
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!complaint) return <p>Complaint not found.</p>;

  return (
    <div className="container" style={{ maxWidth: "900px" }}>
      <div className="flex justify-between items-center mb-6">
        <h1 style={{ fontSize: "2rem", fontWeight: "700" }}>{complaint.title}</h1>
        <div className="flex gap-2">
          <span className={`badge badge-${complaint.priority === 'High' ? 'danger' : complaint.priority === 'Medium' ? 'warning' : 'success'}`}>
            Priority: {complaint.priority}
          </span>
          <span className={`badge badge-${complaint.status === 'Resolved' ? 'success' : complaint.status === 'Open' ? 'danger' : 'info'}`}>
            Status: {complaint.status}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-6" style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "2rem" }}>
        
        {/* Left Column: Details & Updates */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="glass-panel" style={{ padding: "1.5rem" }}>
            <div className="flex justify-between mb-4 pb-4" style={{ borderBottom: "1px solid var(--card-border)" }}>
              <div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Category</p>
                <p style={{ fontWeight: "500" }}>{complaint.category}</p>
              </div>
              <div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Reported By</p>
                <p style={{ fontWeight: "500" }}>{complaint.user.name}</p>
              </div>
              <div>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Date</p>
                <p style={{ fontWeight: "500" }}>{new Date(complaint.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            
            <h3 className="mb-2" style={{ fontSize: "1.1rem", fontWeight: "600" }}>Description</h3>
            <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, color: "var(--text-secondary)" }}>
              {complaint.description}
            </p>

            {complaint.photoUrl && (
              <div className="mt-6">
                <h3 className="mb-2" style={{ fontSize: "1.1rem", fontWeight: "600" }}>Attached Photo</h3>
                <div style={{ position: "relative", width: "100%", height: "300px", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                  <img 
                    src={complaint.photoUrl} 
                    alt="Complaint attachment" 
                    style={{ objectFit: "cover", width: "100%", height: "100%" }}
                  />
                </div>
              </div>
            )}
          </div>

          {session?.user.role === "ADMIN" && (
            <div className="glass-panel" style={{ padding: "1.5rem" }}>
              <h3 className="mb-4" style={{ fontSize: "1.25rem", fontWeight: "600" }}>Update Status</h3>
              <form onSubmit={handleUpdate}>
                <div className="flex gap-4 mb-4">
                  <div className="form-group w-full" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="status">Status</label>
                    <select id="status" className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                  <div className="form-group w-full" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="priority">Priority</label>
                    <select id="priority" className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>
                <div className="form-group mb-4">
                  <label className="form-label" htmlFor="note">Note (Optional, recorded in history)</label>
                  <textarea id="note" className="form-textarea" rows={2} value={note} onChange={(e) => setNote(e.target.value)}></textarea>
                </div>
                <button type="submit" className="btn btn-primary" disabled={updating}>
                  {updating ? "Updating..." : "Update Complaint"}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Column: History */}
        <div>
          <div className="glass-panel" style={{ padding: "1.5rem" }}>
            <h3 className="mb-4" style={{ fontSize: "1.25rem", fontWeight: "600" }}>History</h3>
            <div className="flex flex-col gap-4 relative" style={{ paddingLeft: "1rem", borderLeft: "2px solid var(--card-border)" }}>
              {complaint.history.map((h, i) => (
                <div key={h.id} style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: "-1.4rem", top: "0.2rem", width: "12px", height: "12px", borderRadius: "50%", background: "var(--primary)" }}></div>
                  <p style={{ fontWeight: "600", fontSize: "0.9rem" }}>{h.status}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
                    {new Date(h.createdAt).toLocaleString()}
                  </p>
                  {h.note && (
                    <p style={{ fontSize: "0.875rem", background: "rgba(0,0,0,0.2)", padding: "0.5rem", borderRadius: "4px", marginTop: "0.5rem" }}>
                      {h.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
