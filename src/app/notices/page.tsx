"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Bell,
  Pin,
  PlusCircle,
  AlertTriangle,
  Loader,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
  User,
  FileText,
  X,
  Send,
} from "lucide-react";
import Link from "next/link";

type Notice = {
  id: string;
  title: string;
  content: string;
  isImportant: boolean;
  createdAt: string;
};

export default function NoticesPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user.role === "ADMIN";

  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [view, setView] = useState<"all" | "post">("all");

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isImportant, setIsImportant] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // Detail drawer
  const [activeNotice, setActiveNotice] = useState<Notice | null>(null);

  // Pagination
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/notices");
      if (!res.ok) throw new Error("Failed to fetch notices");
      const data = await res.json();
      setNotices(data);
    } catch (err: any) {
      setError(err.message || "Failed to load notices");
      setNotices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  const importantNotices = useMemo(
    () => notices.filter((n) => n.isImportant),
    [notices]
  );
  const regularNotices = useMemo(
    () => notices.filter((n) => !n.isImportant),
    [notices]
  );

  const totalFiltered = notices.length;
  const totalPages = Math.ceil(totalFiltered / pageSize) || 1;
  const pageRecords = notices.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, isImportant }),
      });

      if (res.ok) {
        setTitle("");
        setContent("");
        setIsImportant(false);
        showToast("Notice posted successfully!");
        setView("all");
        fetchNotices();
      } else {
        showToast("Failed to post notice.");
      }
    } catch (error) {
      console.error(error);
      showToast("Failed to post notice.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderToolbar = () => (
    <div className="flex flex-wrap items-center justify-between gap-3 px-8 py-2 border-b border-[#c7d7ec] bg-[#17386d] text-white text-[11px] font-semibold tracking-wide">
      <div className="flex items-center gap-4">
        <span>
          Displaying {notices.length > 0 ? (page - 1) * pageSize + 1 : 0} - {Math.min(page * pageSize, notices.length)} of {notices.length} Notices
        </span>
        <div className="hidden md:flex items-center gap-3 border-l border-white/20 pl-4 ml-1">
          <span className="flex items-center gap-1.5 text-amber-400">
            <Pin size={12} strokeWidth={3} /> {importantNotices.length} Important
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <Bell size={12} strokeWidth={3} /> {regularNotices.length} Regular
          </span>
        </div>
      </div>
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2 border-l border-white/20 pl-5 text-white">
          <span>Results per page:</span>
          <div className="relative">
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="appearance-none bg-white/10 border border-white/20 rounded px-2 py-0.5 pr-6 text-white outline-none focus:border-[#F5A623] cursor-pointer"
            >
              {[10, 20, 25, 50, 100].map((size) => (
                <option key={size} value={size} className="text-black">
                  {size}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-70"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="notices-full-page min-h-screen w-full bg-white flex flex-col">
      {/* HEADER DIVIDER */}
      <div className="h-[0.5px] w-full bg-[#F5A623] z-40" />

      {/* SECONDARY NAVBAR (TABS) */}
      <div className="bg-[#232f3e] text-white px-2 py-1 flex items-center justify-between overflow-x-auto text-[13px] font-medium shadow-md z-30">
        <div className="flex items-center gap-1">
          {isAdmin ? (
            [
              { key: "all", label: "All Notices" },
              { key: "post", label: "Post Notice" },
            ].map(({ key, label }) => {
              const active = view === key;
              return (
                <button
                  key={key}
                  onClick={() => setView(key as "all" | "post")}
                  className={`bg-transparent px-3 py-1.5 rounded-[3px] border whitespace-nowrap transition-colors outline-none font-semibold ${
                    active
                      ? "border-white text-white"
                      : "border-transparent text-white/70 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              );
            })
          ) : (
            <span className="px-3 py-1.5 font-bold">Notice Board</span>
          )}
        </div>

        {isAdmin && view === "all" && (
          <button
            onClick={() => setView("post")}
            className="px-3 py-1.5 mr-2 rounded bg-[#0fa968] text-white hover:bg-[#0c8c56] font-bold flex items-center gap-1.5"
          >
            <PlusCircle size={14} />
            + New Notice
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-y-auto bg-white flex flex-col">
          {/* BANNER */}
          <div
            className="relative w-full h-40 md:h-48 overflow-hidden flex items-center justify-center shrink-0"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')", backgroundSize: "cover", backgroundPosition: "center" }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[#041a2d]/50" />
            <div className="relative z-10 max-w-2xl text-center px-4">
              <h2 className="font-satoshi text-4xl font-bold text-white mb-2 drop-shadow-sm">
                {view === "all" ? "Notice Board" : "Post a New Notice"}
              </h2>
              <p className="text-sm text-slate-100 drop-shadow-sm">
                {view === "all"
                  ? "View all notices posted by the administration. Important notices are pinned at the top."
                  : "Create and publish a new notice for all residents."}
              </p>
            </div>
          </div>
          <div className="h-px w-full bg-[#0B7382] shrink-0" />

          {/* ==== ALL NOTICES VIEW ==== */}
          {view === "all" && (
            <div className="w-full flex-1 py-6 bg-white">
              {error && (
                <div className="mx-8 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-sm px-4 py-3 mb-6 flex items-center gap-3">
                  <AlertTriangle
                    size={18}
                    className="text-rose-600 flex-shrink-0"
                  />
                  {error}
                  <button
                    onClick={fetchNotices}
                    className="ml-auto text-sm font-semibold underline"
                  >
                    Retry
                  </button>
                </div>
              )}

              {loading && (
                <div className="mx-8 rounded-lg border border-blue-200 bg-blue-50 p-6 flex flex-col items-center justify-center gap-3 mb-6">
                  <Loader
                    size={24}
                    className="text-blue-600 animate-spin"
                  />
                  <span className="text-sm text-blue-800">
                    Loading notices...
                  </span>
                </div>
              )}

              {!error && !loading && notices.length === 0 && (
                <div className="mx-8 rounded-lg border border-dashed border-slate-300 px-5 py-10 text-center text-slate-400 text-sm">
                  No notices posted yet.
                </div>
              )}

              {!loading && notices.length > 0 && (
                <section className="mb-10">
                  <div className="mt-4 mb-2">{renderToolbar()}</div>
                  <div className="bg-indigo-50/50 text-indigo-500 font-medium text-[11px] px-4 py-2 border-y border-[#d9e4f3] flex items-center justify-end">
                    <span className="flex items-center gap-1.5"><ChevronRight size={13} className="opacity-70" /> Click on any row to see full details</span>
                  </div>
                  <div className="overflow-x-auto border-b border-[#d9e4f3]">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#eef3fb] text-[#1a3d6d] border-b-2 border-[#b9cce6]">
                          <th className="w-9 px-3 py-2.5 border-r border-[#d9e4f3] text-center">
                            #
                          </th>
                          <th className="px-3 py-2.5 font-semibold uppercase tracking-wide text-[10.5px] border-r border-[#d9e4f3] whitespace-nowrap text-left">
                            Date
                          </th>
                          <th className="px-3 py-2.5 font-semibold uppercase tracking-wide text-[10.5px] border-r border-[#d9e4f3] whitespace-nowrap text-left">
                            Title
                          </th>
                          <th className="px-3 py-2.5 font-semibold uppercase tracking-wide text-[10.5px] border-r border-[#d9e4f3] whitespace-nowrap text-left">
                            Content
                          </th>
                          <th className="px-3 py-2.5 font-semibold uppercase tracking-wide text-[10.5px] border-r border-[#d9e4f3] whitespace-nowrap text-center">
                            Priority
                          </th>
                          <th className="w-8"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {pageRecords.map((notice, idx) => (
                          <tr
                            key={notice.id}
                            onClick={() => setActiveNotice(notice)}
                            className={`group border-b border-[#e3eaf5] cursor-pointer transition-colors ${
                              idx % 2 === 0
                                ? "bg-white hover:bg-[#f4f8fd]"
                                : "bg-[#f8fafd] hover:bg-[#f4f8fd]"
                            }`}
                          >
                            <td className="w-9 border-r border-[#e3eaf5] px-3 py-2.5 text-center text-slate-500 font-medium">
                              {(page - 1) * pageSize + idx + 1}
                            </td>
                            <td className="px-3 py-2.5 border-r border-[#e3eaf5] whitespace-nowrap text-slate-700">
                              <span className="flex items-center gap-1.5">
                                <Calendar size={12} className="text-slate-400" />
                                {new Date(notice.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 border-r border-[#e3eaf5] text-slate-900 font-medium max-w-[250px]">
                              <div className="flex items-center gap-2">
                                {notice.isImportant && (
                                  <Pin size={12} className="text-amber-500 shrink-0" />
                                )}
                                <span className="truncate">{notice.title}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2.5 border-r border-[#e3eaf5] text-slate-600 max-w-[350px]">
                              <span className="truncate block">
                                {notice.content.length > 80 ? notice.content.substring(0, 80) + "…" : notice.content}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 whitespace-nowrap text-center border-r border-[#e3eaf5]">
                              {notice.isImportant ? (
                                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                                  <Pin size={10} />
                                  Important
                                </span>
                              ) : (
                                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                  Regular
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2.5 text-right">
                               <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm group-hover:shadow-md">
                                 <ChevronRight size={18} strokeWidth={3} />
                               </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* PAGINATION */}
              {!loading && totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-[#c7d7ec] pt-4 mt-6 px-8">
                  <div className="text-xs font-semibold text-slate-500">
                    Showing {(page - 1) * pageSize + 1} to{" "}
                    {Math.min(page * pageSize, totalFiltered)} of{" "}
                    {totalFiltered} entries
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="flex items-center justify-center w-8 h-8 rounded border border-[#d9e4f3] text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    {Array.from({ length: totalPages }).map((_, i) => {
                      if (totalPages > 7) {
                        if (
                          i !== 0 &&
                          i !== totalPages - 1 &&
                          Math.abs(page - 1 - i) > 1
                        ) {
                          if (i === 1 || i === totalPages - 2)
                            return (
                              <span
                                key={i}
                                className="px-1 text-slate-400"
                              >
                                ...
                              </span>
                            );
                          return null;
                        }
                      }
                      return (
                        <button
                          key={i}
                          onClick={() => setPage(i + 1)}
                          className={`flex items-center justify-center w-8 h-8 rounded border text-xs font-bold transition-colors ${
                            page === i + 1
                              ? "bg-[#17386d] border-[#17386d] text-white"
                              : "border-[#d9e4f3] text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {i + 1}
                        </button>
                      );
                    })}
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                      className="flex items-center justify-center w-8 h-8 rounded border border-[#d9e4f3] text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==== POST NOTICE VIEW ==== */}
          {view === "post" && isAdmin && (
            <div className="w-full flex-1 py-8 bg-white text-slate-800 flex justify-center items-start">
              <div className="w-full max-w-4xl px-8">
                
                <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                  <div className="text-left flex-1">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Notice Entry</h2>
                    <p className="text-base text-slate-700 mb-1">
                      Draft a new notice to be broadcasted to all residents.
                    </p>
                    <p className="text-sm text-cyan-700">
                      Note: Marking a notice as important will send email notifications to all users.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#1a53a1] mb-5">
                      Notice Content
                    </p>
                    
                    <div className="space-y-5">
                      {/* Title */}
                      <div>
                        <label className="block text-[13px] font-bold text-slate-700 mb-2" htmlFor="notice-title">
                          Notice Title
                        </label>
                        <div className="relative flex items-stretch w-full h-10 rounded-[4px] overflow-hidden border border-slate-300 focus-within:border-[#F5A623] focus-within:ring-[2px] focus-within:ring-[#F5A623] transition-none bg-white shadow-sm group">
                          <input
                            type="text"
                            id="notice-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            placeholder="Enter a descriptive title for the notice"
                            className="flex-1 w-full outline-none pl-3 pr-12 text-[15px] text-slate-800 placeholder:text-slate-400 bg-transparent relative z-10"
                          />
                          <div className="absolute right-0 top-0 bottom-0 w-10 bg-[#febd69] flex items-center justify-center border-l border-slate-300 shrink-0 pointer-events-none z-10 group-hover:bg-[#f3a847] transition-colors">
                            <FileText size={16} className="text-[#333333]" strokeWidth={2.5} />
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div>
                        <label className="block text-[13px] font-bold text-slate-700 mb-2" htmlFor="notice-content">
                          Notice Content
                        </label>
                        <textarea
                          id="notice-content"
                          rows={6}
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          required
                          placeholder="Write the full notice content here..."
                          className="w-full bg-white text-slate-800 px-3 py-2.5 rounded-[4px] border border-slate-300 focus:outline-none focus:border-[#F5A623] focus:ring-[2px] focus:ring-[#F5A623] transition-none text-[15px] placeholder:text-slate-400 resize-none min-h-[120px] shadow-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Important Toggle */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#1a53a1] mb-4">
                      Notice Settings
                    </p>
                    <div className="flex items-start gap-3">
                      <div className="pt-0.5">
                        <input
                          type="checkbox"
                          id="notice-important"
                          checked={isImportant}
                          onChange={(e) => setIsImportant(e.target.checked)}
                          className="h-4 w-4 accent-[#F5A623] cursor-pointer"
                        />
                      </div>
                      <div>
                        <label htmlFor="notice-important" className="text-[13px] font-bold text-slate-700 cursor-pointer block">
                          Mark as Important
                        </label>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Important notices are pinned to the top of the board and will send an email notification to all residents.
                        </p>
                      </div>
                    </div>
                    {isImportant && (
                      <div className="mt-4 p-3 rounded-lg border text-xs leading-relaxed flex items-start gap-2.5 bg-amber-50 border-amber-200 text-amber-900">
                        <AlertTriangle size={14} className="shrink-0 mt-0.5 text-amber-600" />
                        <div>
                          An email will be sent to <strong>all residents</strong> when this notice is posted.
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-end gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setView("all")}
                      disabled={submitting}
                      className="px-6 py-2.5 rounded-md border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors bg-white shadow-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-[#011f3d] hover:bg-[#02315e] disabled:opacity-60 border-none text-white font-medium px-6 py-2.5 rounded-md flex items-center space-x-2 transition-all duration-300 active:scale-95 shadow-md min-w-[160px] justify-center"
                    >
                      <Send size={14} />
                      <span>{submitting ? "Posting..." : "Post Notice"}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#131921] text-white px-4 py-2.5 rounded shadow-xl border border-white/20 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={14} className="text-emerald-400" />
          {toast}
        </div>
      )}

      {/* NOTICE DETAIL DRAWER */}
      {activeNotice && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setActiveNotice(null)}
          />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in border-l border-slate-200">
            {/* Drawer Header */}
            <div className="bg-gradient-to-r from-[#010b14] via-[#041a2d] to-[#17386d] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Bell size={18} className="text-[#F5A623]" />
                <div>
                  <h3 className="font-bold text-base tracking-wide">
                    Notice Details
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setActiveNotice(null)}
                className="text-slate-400 hover:text-white border border-transparent hover:border-white/30 p-1 rounded transition-colors focus:outline-none"
              >
                <X size={18} />
              </button>
            </div>
            <div
              className={`h-[3px] w-full ${
                activeNotice.isImportant ? "bg-amber-400" : "bg-slate-300"
              }`}
            />

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 bg-[#f8fafd]">
              {/* Title Card */}
              <div className="bg-white rounded-lg border border-[#c7d7ec] p-4 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Title
                </span>
                <div className="text-lg font-bold text-[#1a53a1] mt-0.5 flex items-center gap-2">
                  {activeNotice.isImportant && (
                    <Pin size={16} className="text-amber-500 shrink-0" />
                  )}
                  {activeNotice.title}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Date Posted
                    </span>
                    <p className="text-sm font-bold text-slate-800">
                      {new Date(activeNotice.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Priority
                    </span>
                    <p className="mt-0.5">
                      {activeNotice.isImportant ? (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                          <Pin size={10} />
                          Important
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          Regular
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content Card */}
              <div className="bg-white rounded-lg border border-[#e3eaf5] p-4 space-y-2 shadow-xs">
                <h4 className="text-xs font-bold text-[#17386d] uppercase tracking-wide border-b border-slate-100 pb-2">
                  Content
                </h4>
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {activeNotice.content}
                </p>
              </div>

              {/* Info Card */}
              {activeNotice.isImportant && (
                <div className="bg-white rounded-lg border border-[#e3eaf5] p-4 shadow-xs">
                  <div className="p-3 rounded-lg border text-xs leading-relaxed flex items-start gap-2.5 bg-amber-50 border-amber-200 text-amber-900">
                    <AlertTriangle
                      size={14}
                      className="shrink-0 mt-0.5 text-amber-600"
                    />
                    <div>
                      This notice was marked as <strong>Important</strong> and
                      email notifications were sent to all residents.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 bg-white border-t flex justify-end gap-2 shrink-0">
              <button
                onClick={() => setActiveNotice(null)}
                className="px-4 py-2 border rounded text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
