"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Registration failed");
      }

      router.push("/login");
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center" style={{ minHeight: "70vh" }}>
      <div className="glass-panel" style={{ width: "100%", maxWidth: "450px", padding: "2rem" }}>
        <h1 className="text-center mb-6" style={{ fontSize: "1.5rem", fontWeight: "600" }}>
          Create an Account
        </h1>
        {error && (
          <div className="mb-4 text-center badge-danger" style={{ padding: "0.5rem", borderRadius: "8px" }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input type="text" id="name" name="name" className="form-input" required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input type="email" id="email" name="email" className="form-input" required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input type="password" id="password" name="password" className="form-input" required minLength={6} />
          </div>
          <div className="form-group mb-6">
            <label className="form-label" htmlFor="role">Role</label>
            <select id="role" name="role" className="form-select" required>
              <option value="RESIDENT">Resident</option>
              <option value="ADMIN">Admin</option>
            </select>
            <p className="mt-1" style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
              *For demo purposes, you can choose to be an Admin.
            </p>
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <p className="text-center mt-4" style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          Already have an account? <Link href="/login" style={{ color: "var(--primary)" }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
