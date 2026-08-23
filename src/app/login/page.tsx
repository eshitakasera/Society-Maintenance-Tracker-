"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="flex justify-center items-center" style={{ minHeight: "70vh" }}>
      <div className="glass-panel" style={{ width: "100%", maxWidth: "400px", padding: "2rem" }}>
        <h1 className="text-center mb-6" style={{ fontSize: "1.5rem", fontWeight: "600" }}>
          Welcome Back
        </h1>
        {error && (
          <div className="mb-4 text-center badge-danger" style={{ padding: "0.5rem", borderRadius: "8px" }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input type="email" id="email" name="email" className="form-input" required />
          </div>
          <div className="form-group mb-6">
            <label className="form-label" htmlFor="password">Password</label>
            <input type="password" id="password" name="password" className="form-input" required />
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className="text-center mt-4" style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          Don't have an account? <Link href="/register" style={{ color: "var(--primary)" }}>Register</Link>
        </p>
      </div>
    </div>
  );
}
