"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FileText, Layers, Image as ImageIcon, CheckCircle2, ChevronLeft, Send, PenTool } from "lucide-react";

export default function NewComplaint() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (status === "loading") return <div className="p-8 text-white">Loading...</div>;
  if (session?.user.role !== "RESIDENT") {
    return <div className="p-8 text-white">Access denied. Only residents can raise complaints.</div>;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        router.push("/complaints");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to submit complaint");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="complaints-full-page text-white flex flex-col min-h-screen bg-[#06141d] font-sans">
      {/* SECONDARY NAVBAR */}
      <div className="bg-[#232f3e] text-white px-4 py-2 flex items-center gap-4 text-[13px] font-medium shadow-md z-30">
        <Link
          href="/complaints"
          className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
        >
          <ChevronLeft size={16} /> Back to Complaints
        </Link>
        <div className="h-4 w-px bg-slate-600"></div>
        <span className="font-bold border-b-2 border-white pb-0.5">Raise a Complaint</span>
      </div>

      {/* Hero Banner */}
      <section
        className="relative bg-[#0b2236] h-40 md:h-48 overflow-hidden shrink-0 flex items-center justify-center border-b border-[#112a42]"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop')", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[#041a2d]/50" />

        <div className="relative z-10 max-w-2xl text-center px-4">
          <h2 className="font-satoshi text-4xl font-bold text-white mb-2 drop-shadow-sm">
            Raise a Complaint
          </h2>
          <p className="text-sm text-slate-100 drop-shadow-sm">
            Submit a new maintenance request or issue. Ensure all required fields are filled out accurately.
          </p>
        </div>
      </section>

      {/* SECTION DIVIDER */}
      <div className="h-[2px] w-full bg-[#04434b] z-40" />

      {/* Main Content / Form Container */}
      <main className="flex-1 relative p-6 lg:p-8 flex justify-center items-start bg-white text-slate-800">
        <div className="relative z-10 w-full max-w-4xl">
          
          <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="text-left flex-1">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Complaint Entry</h2>
              <p className="text-base text-slate-700 mb-1">
                Fill out the details of your issue below.
              </p>
              <p className="text-sm text-cyan-700">
                Note: Attaching a photo helps us resolve the issue faster.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-500"></span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#1a53a1] mb-5">
                Issue Details
              </p>
              
              <div className="space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-2" htmlFor="title">
                    Title
                  </label>
                  <div className="relative flex items-stretch w-full h-10 rounded-[4px] overflow-hidden border border-slate-300 focus-within:border-[#F5A623] focus-within:ring-[2px] focus-within:ring-[#F5A623] transition-none bg-white shadow-sm group">
                    <input
                      type="text"
                      id="title"
                      name="title"
                      required
                      placeholder="Brief description of the issue"
                      className="flex-1 w-full outline-none pl-3 pr-12 text-[15px] text-slate-800 placeholder:text-slate-400 bg-transparent relative z-10"
                    />
                    <div className="absolute right-0 top-0 bottom-0 w-10 bg-[#febd69] flex items-center justify-center border-l border-slate-300 shrink-0 pointer-events-none z-10 group-hover:bg-[#f3a847] transition-colors">
                      <FileText size={16} className="text-[#333333]" strokeWidth={2.5} />
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-2" htmlFor="category">
                    Category
                  </label>
                  <div className="relative flex items-stretch w-full h-10 rounded-[4px] overflow-hidden border border-slate-300 focus-within:border-[#F5A623] focus-within:ring-[2px] focus-within:ring-[#F5A623] transition-none bg-white shadow-sm group cursor-pointer">
                    <select
                      id="category"
                      name="category"
                      required
                      defaultValue=""
                      className="absolute inset-0 w-full h-full appearance-none outline-none pl-3 pr-11 text-[15px] text-slate-800 bg-transparent cursor-pointer z-20"
                    >
                      <option value="" disabled>Select a category</option>
                      <option value="Plumbing">Plumbing</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Carpentry">Carpentry</option>
                      <option value="Cleaning">Cleaning</option>
                      <option value="Security">Security</option>
                      <option value="Other">Other</option>
                    </select>
                    <div className="absolute right-0 top-0 bottom-0 w-10 bg-[#febd69] flex items-center justify-center border-l border-slate-300 shrink-0 pointer-events-none z-10 group-hover:bg-[#f3a847] transition-colors">
                      <Layers size={16} className="text-[#333333]" strokeWidth={2.5} />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[13px] font-bold text-slate-700 mb-2" htmlFor="description">
                    Detailed Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={5}
                    required
                    placeholder="Describe the issue in detail..."
                    className="w-full bg-white text-slate-800 px-3 py-2.5 rounded-[4px] border border-slate-300 focus:outline-none focus:border-[#F5A623] focus:ring-[2px] focus:ring-[#F5A623] transition-none text-[15px] placeholder:text-slate-400 resize-none min-h-[100px] shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Photo Attachment */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#1a53a1] mb-4">
                Attachment <span className="text-slate-400 font-normal lowercase">(optional)</span>
              </p>
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-2" htmlFor="photo">
                  Upload Photo
                </label>
                <div className="relative flex items-stretch w-full h-10 rounded-[4px] overflow-hidden border border-slate-300 focus-within:border-[#F5A623] focus-within:ring-[2px] focus-within:ring-[#F5A623] transition-none bg-white shadow-sm group">
                  <input
                    type="file"
                    id="photo"
                    name="photo"
                    accept="image/*"
                    className="flex-1 w-full outline-none pl-3 pr-12 py-2 text-[13px] text-slate-800 bg-transparent relative z-10 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#1a53a1] file:text-white hover:file:bg-[#112a52] file:cursor-pointer cursor-pointer"
                  />
                  <div className="absolute right-0 top-0 bottom-0 w-10 bg-[#febd69] flex items-center justify-center border-l border-slate-300 shrink-0 pointer-events-none z-10 group-hover:bg-[#f3a847] transition-colors">
                    <ImageIcon size={16} className="text-[#333333]" strokeWidth={2.5} />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Operations */}
            <div className="flex flex-wrap items-center justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={loading}
                className="px-6 py-2.5 rounded-md border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors bg-white shadow-sm"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="bg-[#011f3d] hover:bg-[#02315e] disabled:opacity-60 border-none text-white font-medium px-6 py-2.5 rounded-md flex items-center space-x-2 transition-all duration-300 active:scale-95 shadow-md min-w-[160px] justify-center"
              >
                <Send size={14} />
                <span>{loading ? "Submitting..." : "Submit Complaint"}</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
