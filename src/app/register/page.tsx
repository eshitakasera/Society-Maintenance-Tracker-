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
    <>
      <div 
        className="absolute z-[-1] bg-slate-100 overflow-hidden"
        style={{ width: '100vw', height: '120vh', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
      >
        <div className="absolute inset-0 grid grid-cols-2 md:grid-cols-3 opacity-80">
          <div className="bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop')" }} />
          <div className="bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800&auto=format&fit=crop')" }} />
          <div className="bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=800&auto=format&fit=crop')" }} />
          <div className="bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=800&auto=format&fit=crop')" }} />
          <div className="bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop')" }} />
          <div className="bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1530124566582-a618bc2615dc?q=80&w=800&auto=format&fit=crop')" }} />
        </div>
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative flex justify-center items-center w-full" style={{ minHeight: "calc(100vh - 120px)" }}>
        <div className="glass-panel relative z-10 shadow-2xl backdrop-blur-xl border border-white/10" style={{ width: "100%", maxWidth: "420px", padding: "2.5rem", marginTop: "2rem", marginBottom: "2rem" }}>
          <h1 className="text-center mb-6" style={{ fontSize: "1.75rem", fontWeight: "700", color: "#fff" }}>
            Create an Account
          </h1>
          {error && (
            <div className="mb-4 text-center badge-danger" style={{ padding: "0.5rem", borderRadius: "8px" }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-4">
              <label className="form-label text-slate-300" htmlFor="name">Full Name</label>
              <input type="text" id="name" name="name" className="form-input bg-black/20 text-white border-white/20 focus:border-blue-500" required />
            </div>
            <div className="form-group mb-4">
              <label className="form-label text-slate-300" htmlFor="email">Email Address</label>
              <input type="email" id="email" name="email" className="form-input bg-black/20 text-white border-white/20 focus:border-blue-500" required />
            </div>
            <div className="form-group mb-4">
              <label className="form-label text-slate-300" htmlFor="password">Password</label>
              <input type="password" id="password" name="password" className="form-input bg-black/20 text-white border-white/20 focus:border-blue-500" required />
            </div>
            <div className="form-group mb-8">
              <label className="form-label text-slate-300" htmlFor="role">I am a...</label>
              <select id="role" name="role" className="form-input bg-black/20 text-white border-white/20 focus:border-blue-500" required>
                <option value="RESIDENT" className="text-black">Resident</option>
                <option value="ADMIN" className="text-black">Society Admin</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary w-full py-3 font-semibold shadow-lg" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
          <p className="text-center mt-6" style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
            Already have an account? <Link href="/login" className="font-semibold" style={{ color: "#60a5fa" }}>Sign In</Link>
          </p>
        </div>
      </div>
    </>
  );
}
