"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      if (session.user.role === "ADMIN") {
        router.push("/dashboard");
      } else {
        router.push("/complaints");
      }
    }
  }, [session, status, router]);

  if (status === "loading" || status === "authenticated") {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center text-center" style={{ minHeight: "70vh" }}>
      <h1 className="mb-4" style={{ fontSize: "3rem", fontWeight: "800", background: "linear-gradient(to right, #3b82f6, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        Society Maintenance Tracker
      </h1>
      <p className="mb-8" style={{ fontSize: "1.25rem", color: "var(--text-secondary)", maxWidth: "600px" }}>
        A premium platform for residents and admins to easily track, manage, and resolve maintenance complaints.
      </p>
      <div className="flex gap-4">
        <Link href="/login" className="btn btn-primary" style={{ fontSize: "1.1rem", padding: "0.75rem 2rem" }}>
          Login
        </Link>
        <Link href="/register" className="btn btn-secondary" style={{ fontSize: "1.1rem", padding: "0.75rem 2rem" }}>
          Register
        </Link>
      </div>
    </div>
  );
}
