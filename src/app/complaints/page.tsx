"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Calendar,
  User,
  Package,
  Layers,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  RotateCcw,
  Flag,
  FileText,
  Filter,
  Download,
  Check,
  AlertTriangle,
  Loader,
  Clock,
  Printer,
  Trash2,
  CheckCircle2,
} from "lucide-react";

type Status = "Open" | "In Progress" | "Resolved" | "Flagged";

type Complaint = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: Status;
  priority: string | null;
  photoUrl: string | null;
  createdAt: string;
  user: { name: string; email: string };
  history?: { id: string; status: string; note: string | null; createdAt: string }[];
};

type Filters = {
  dateFrom: string;
  dateTo: string;
  category: string;
  status: Status | "All";
};

const emptyFilters: Filters = {
  dateFrom: "",
  dateTo: "",
  category: "All",
  status: "All",
};

const statusStyles: Record<Status, string> = {
  "Open": "bg-amber-50 text-amber-700 border border-amber-200",
  "In Progress": "bg-blue-50 text-blue-700 border border-blue-200",
  "Resolved": "bg-emerald-50 text-emerald-700 border border-emerald-200",
  "Flagged": "bg-rose-50 text-rose-700 border border-rose-200",
};



// Config for the action confirmation modal.
const actionModalConfig: Record<
  Exclude<Status, "Open">,
  { title: string; verb: string; badgeClass: string; confirmClass: string; icon: JSX.Element }
> = {
  "Resolved": {
    title: "Resolve Complaint",
    verb: "resolve",
    badgeClass: "bg-emerald-100 text-emerald-800",
    confirmClass: "bg-[#0fa968] hover:bg-[#0c8c56]",
    icon: <Check size={12} strokeWidth={3} className="mr-1" />,
  },
  "Flagged": {
    title: "Flag as Overdue",
    verb: "flag",
    badgeClass: "bg-rose-100 text-rose-800",
    confirmClass: "bg-[#ef4444] hover:bg-[#dc2626]",
    icon: <Flag size={11} strokeWidth={2.5} className="mr-1" />,
  },
  "In Progress": {
    title: "Mark In Progress",
    verb: "mark in progress",
    badgeClass: "bg-blue-100 text-blue-800",
    confirmClass: "bg-blue-600 hover:bg-blue-700 text-white",
    icon: <Clock size={12} strokeWidth={3} className="mr-1" />,
  },
};

export default function ComplaintsList() {
  const { data: session } = useSession();

  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [view, setView] = useState<"queue" | "history">("queue");

  const fetchRecords = async (filterState: Filters) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filterState.status !== "All") params.set("status", filterState.status);
      if (filterState.dateFrom) params.set("date", filterState.dateFrom); // Note: existing API uses 'date'
      if (filterState.category !== "All") params.set("category", filterState.category);

      const response = await fetch(`/api/complaints?${params}`);
      if (!response.ok) throw new Error("Failed to fetch complaints");
      const data = await response.json();
      setComplaints(data);
    } catch (err: any) {
      setError(err.message || "Failed to load complaints");
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const updateFilter = (patch: Partial<Filters>) => {
    setFilters((f) => ({ ...f, ...patch }));
  };
  const resetFilters = () => setFilters(emptyFilters);

  const [overdueDays, setOverdueDays] = useState(3);
  useEffect(() => {
    const saved = localStorage.getItem('overdueDays');
    if (saved) setOverdueDays(Number(saved));
  }, []);

  const handleOverdueDaysChange = (val: number) => {
    setOverdueDays(val);
    localStorage.setItem('overdueDays', val.toString());
  };

  const isOverdue = useCallback((record: Complaint) => {
    if (record.status === "Resolved") return false;
    const diffTime = Math.abs(new Date().getTime() - new Date(record.createdAt).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= overdueDays;
  }, [overdueDays]);

  // Derived state
  const activeComplaints = useMemo(() => complaints.filter(c => c.status !== "Resolved"), [complaints]);
  const historyComplaints = useMemo(() => complaints.filter(c => c.status === "Resolved"), [complaints]);

  const currentList = useMemo(() => {
    let list = view === "queue" ? activeComplaints : historyComplaints;
    if (view === "queue") {
      // Sort overdue to the top, then by created date descending
      list = [...list].sort((a, b) => {
        const aOverdue = isOverdue(a);
        const bOverdue = isOverdue(b);
        if (aOverdue && !bOverdue) return -1;
        if (!aOverdue && bOverdue) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    } else {
      list = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return list;
  }, [view, activeComplaints, historyComplaints, overdueDays]);
  const categoryOptions = useMemo(
    () => Array.from(new Set(complaints.map((c) => c.category))),
    [complaints]
  );

  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const [activeRecord, setActiveRecord] = useState<{ record: Complaint } | null>(null);

  const [actionModal, setActionModal] = useState<{
    record: Complaint;
    action: Exclude<Status, "Open">;
  } | null>(null);
  const [actionComment, setActionComment] = useState("");

  const openActionModal = (record: Complaint, action: Exclude<Status, "Open">) => {
    setActionComment("");
    setActionModal({ record, action });
  };
  const closeActionModal = () => {
    setActionModal(null);
    setActionComment("");
  };

  const setStatus = async (record: Complaint, status: Status, comment?: string) => {
    try {
      const response = await fetch(`/api/complaints/${record.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note: comment }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Failed to update record");
      }
      showToast(`Complaint updated to ${status}.`);
      fetchRecords(filters);
      if (activeRecord && activeRecord.record.id === record.id) {
         setActiveRecord(null);
      }
    } catch (err: any) {
      showToast(err.message || "Failed to update record");
    }
  };

  const setPriority = async (record: Complaint, priority: string) => {
    try {
      const response = await fetch(`/api/complaints/${record.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Failed to update priority");
      }
      showToast(`Priority updated to ${priority}.`);
      fetchRecords(filters);
      if (activeRecord) {
        setActiveRecord({ record: { ...activeRecord.record, priority } });
      }
    } catch (err: any) {
      showToast(err.message || "Failed to update priority");
    }
  };

  const confirmActionModal = () => {
    if (!actionModal) return;
    const { record, action } = actionModal;
    const comment = actionComment.trim() || undefined;
    setStatus(record, action, comment);
    closeActionModal();
  };

  // Pagination & Selection
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);

  const toggleRow = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = (ids: string[]) => {
    setSelected((prev) => {
      const allSel = ids.every((id) => prev.has(id));
      const next = new Set(prev);
      if (allSel) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  };

  const totalFiltered = currentList.length;
  const totalPages = Math.ceil(totalFiltered / pageSize) || 1;
  const pageRecords = currentList.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => { setPage(1); }, [filters, pageSize, view]);
  useEffect(() => { setSelected(new Set()); }, [filters, view]);

  const renderSharedToolbar = () => {
    const tableSelected = pageRecords.filter((r) => selected.has(r.id));
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 px-8 py-2 border-b border-[#c7d7ec] bg-[#17386d] text-white text-[11px] font-semibold tracking-wide">
        <div className="flex items-center gap-4">
          <span>
            Displaying {currentList.length > 0 ? (page - 1) * pageSize + 1 : 0} - {Math.min(page * pageSize, currentList.length)} of {currentList.length} Results
            {tableSelected.length > 0 && ` (${tableSelected.length} selected)`}
          </span>
          <div className="hidden md:flex items-center gap-4 border-l border-white/20 pl-4 ml-1">
            <span className="flex items-center gap-1.5 text-blue-400">
              <Clock size={12} strokeWidth={3} /> In Progress
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Check size={12} strokeWidth={3} /> Resolved
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <Flag size={11} strokeWidth={2.5} /> Flagged
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
                {[10, 20, 25, 50, 100].map(size => <option key={size} value={size} className="text-black">{size}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-70" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="complaints-full-page min-h-screen w-full bg-white flex flex-col">
      {/* HEADER DIVIDER */}
      <div className="h-[0.5px] w-full bg-[#F5A623] z-40" />

      {/* SECONDARY NAVBAR (TABS) */}
      <div className="bg-[#232f3e] text-white px-2 py-1 flex items-center justify-between overflow-x-auto text-[13px] font-medium shadow-md z-30">
        <div className="flex items-center gap-1">
          {session?.user.role === "ADMIN" ? (
            [
              { key: "queue", label: "Active Complaints" },
              { key: "history", label: "Resolved Complaints" },
            ].map(({ key, label }) => {
              const active = view === key;
              return (
                <button
                  key={key}
                  onClick={() => setView(key as "queue" | "history")}
                  className={`bg-transparent px-3 py-1.5 rounded-[3px] border whitespace-nowrap transition-colors outline-none font-semibold ${
                    active ? "border-white text-white" : "border-transparent text-white/70 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              );
            })
          ) : (
            <span className="px-3 py-1.5 font-bold mr-2">My Complaints</span>
          )}
          
          {session?.user.role === "RESIDENT" && (
             <Link href="/complaints/new" className="px-3 py-1.5 rounded-[3px] bg-[#0fa968] text-white hover:bg-[#0c8c56] font-bold transition-colors">
               + Raise Complaint
             </Link>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-y-auto bg-white flex flex-col">
          {/* BANNER */}
          <div
            className="relative w-full h-40 md:h-48 overflow-hidden flex items-center justify-center shrink-0"
            style={{ 
              backgroundImage: view === "queue" 
                ? "url('https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=2070&auto=format&fit=crop')" 
                : "url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2070&auto=format&fit=crop')", 
              backgroundSize: "cover", 
              backgroundPosition: "center" 
            }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[#17386d]/40" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#17386d]/60 via-transparent to-transparent" />
            <div className="relative z-10 max-w-2xl text-center px-4">
              <h2 className="font-satoshi text-4xl font-bold text-white mb-2 drop-shadow-sm">
                {view === "queue" ? "Active Complaints" : "Resolved Complaints"}
              </h2>
              <p className="text-sm text-slate-100 drop-shadow-sm">
                {view === "queue" 
                   ? "Review, update, and manage open or in-progress complaints." 
                   : "History of all resolved and closed complaints."}
              </p>
            </div>
          </div>
          <div className="h-px w-full bg-[#0B7382] shrink-0" />

          {/* FILTERS */}
          <div className="w-full bg-white px-8 pt-6 pb-6 shadow-sm border-b border-[#c7d7ec]">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <FilterField
                label="Date"
                icon={Calendar}
                type="date"
                value={filters.dateFrom}
                onChange={(v) => updateFilter({ dateFrom: v })}
              />
              <FilterField
                label="Category"
                icon={Layers}
                type="select"
                value={filters.category}
                onChange={(v) => updateFilter({ category: v })}
                options={categoryOptions.map((p) => ({ value: p, label: p }))}
                placeholder="All Categories"
              />
              <FilterField
                label="Status"
                icon={Package}
                type="select"
                value={filters.status}
                onChange={(v) => updateFilter({ status: v as Status | "All" })}
                options={[
                  { value: "Open", label: "Open" },
                  { value: "In Progress", label: "In Progress" },
                  { value: "Resolved", label: "Resolved" },
                  { value: "Flagged", label: "Flagged" },
                  { value: "All", label: "All" },
                ]}
              />
            </div>
            <div className="flex items-center justify-end mt-5">
              <button
                onClick={resetFilters}
                className="flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:border-[#F5A623] hover:text-[#F5A623] hover:bg-[#F5A623]/10 active:scale-95 transition-all"
              >
                <RotateCcw size={14} />
                Reset Filters
              </button>
            </div>
          </div>

          {/* OVERDUE SETTINGS + ROW HINT */}
          {session?.user.role === "ADMIN" && view === "queue" && (
            <div className="w-full bg-gradient-to-r from-amber-50 to-orange-50 border-y border-amber-200 px-8 py-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-amber-900 flex items-center gap-2 mb-1">
                    <AlertTriangle size={16} className="text-amber-600" />
                    Automatically mark complaints as overdue after:
                  </h4>
                  <p className="text-xs text-amber-700/80 leading-relaxed max-w-xl">
                    Admins can manually flag any complaint as overdue anytime using the <strong>Flag Overdue</strong> button. 
                    Otherwise, complaints will be <strong>automatically marked overdue</strong> after the selected number of days.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="relative">
                    <select
                      value={overdueDays}
                      onChange={(e) => handleOverdueDaysChange(Number(e.target.value))}
                      className="appearance-none cursor-pointer bg-white border-2 border-amber-300 rounded-lg px-4 py-2.5 pr-10 text-base font-bold text-amber-900 outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 shadow-sm hover:border-amber-400 transition-all"
                    >
                      {[1, 2, 3, 4, 5, 7, 10, 14, 21, 30].map(days => (
                        <option key={days} value={days}>{days} Days</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-amber-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="w-full bg-indigo-50 border-b border-indigo-100 px-8 py-3 flex items-center justify-center shadow-inner">
             <span className="text-indigo-700 font-bold text-sm tracking-wide flex items-center gap-2">
               <ChevronRight size={18} strokeWidth={2.5} className="opacity-80" /> CLICK ON ANY ROW TO VIEW FULL DETAILS
             </span>
          </div>

          <div className="w-full flex-1 py-6 bg-white">
            {error && (
              <div className="mx-8 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-sm px-4 py-3 mb-6 flex items-center gap-3">
                <AlertTriangle size={18} className="text-rose-600 flex-shrink-0" />
                {error}
                <button onClick={() => fetchRecords(filters)} className="ml-auto text-sm font-semibold underline">
                  Retry
                </button>
              </div>
            )}

            {loading && (
              <div className="mx-8 rounded-lg border border-blue-200 bg-blue-50 p-6 flex flex-col items-center justify-center gap-3 mb-6">
                <Loader size={24} className="text-blue-600 animate-spin" />
                <span className="text-sm text-blue-800">Loading complaints...</span>
              </div>
            )}

            {!error && !loading && currentList.length === 0 && (
              <div className="mx-8 rounded-lg border border-dashed border-slate-300 px-5 py-10 text-center text-slate-400 text-sm">
                No complaints match these filters.
              </div>
            )}

            {!loading && currentList.length > 0 && (
              <section className="mb-10">
                <div className="mt-4 mb-2">
                  {renderSharedToolbar()}
                </div>
                <div className="overflow-x-auto border-y border-[#d9e4f3]">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#eef3fb] text-[#1a3d6d] border-b-2 border-[#b9cce6]">
                        <th className="w-9 px-3 py-2.5 border-r border-[#d9e4f3] text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={pageRecords.length > 0 && pageRecords.every((r) => selected.has(r.id))}
                            onChange={() => toggleAll(pageRecords.map((r) => r.id))}
                            className="h-3.5 w-3.5 accent-[#1a53a1] cursor-pointer"
                          />
                        </th>
                        <th className="px-3 py-2.5 font-semibold uppercase tracking-wide text-[10.5px] border-r border-[#d9e4f3] whitespace-nowrap text-left">Date</th>
                        <th className="px-3 py-2.5 font-semibold uppercase tracking-wide text-[10.5px] border-r border-[#d9e4f3] whitespace-nowrap text-left">Resident</th>
                        <th className="px-3 py-2.5 font-semibold uppercase tracking-wide text-[10.5px] border-r border-[#d9e4f3] whitespace-nowrap text-left">Category</th>
                        <th className="px-3 py-2.5 font-semibold uppercase tracking-wide text-[10.5px] border-r border-[#d9e4f3] whitespace-nowrap text-left">Title</th>
                        <th className="px-3 py-2.5 font-semibold uppercase tracking-wide text-[10.5px] border-r border-[#d9e4f3] whitespace-nowrap text-left">Priority</th>
                        <th className="px-3 py-2.5 font-semibold uppercase tracking-wide text-[10.5px] border-r border-[#d9e4f3] whitespace-nowrap text-left">Status</th>
                        {session?.user.role === "ADMIN" && view === "queue" && <th className="px-3 py-2.5 font-semibold uppercase tracking-wide text-[10.5px] border-r border-[#d9e4f3] whitespace-nowrap text-right">Actions</th>}
                        <th className="w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageRecords.map((r, idx) => (
                        <tr
                          key={r.id}
                          onClick={() => setActiveRecord({ record: r })}
                          className={`group border-b border-[#e3eaf5] cursor-pointer transition-colors ${
                            selected.has(r.id) ? "bg-[#e3ecf9]" : idx % 2 === 0 ? "bg-white hover:bg-[#f4f8fd]" : "bg-[#f8fafd] hover:bg-[#f4f8fd]"
                          }`}
                        >
                          <td className="w-9 border-r border-[#e3eaf5] px-3 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selected.has(r.id)}
                              onChange={() => toggleRow(r.id)}
                              className="h-3.5 w-3.5 accent-[#1a53a1] cursor-pointer"
                            />
                          </td>
                          <td className="px-3 py-2 border-r border-[#e3eaf5] whitespace-nowrap text-slate-700">
                             {new Date(r.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-3 py-2 border-r border-[#e3eaf5] whitespace-nowrap text-slate-700">
                             {r.user?.name}
                          </td>
                          <td className="px-3 py-2 border-r border-[#e3eaf5] whitespace-nowrap text-slate-700">
                             {r.category}
                          </td>
                          <td className="px-3 py-2 border-r border-[#e3eaf5] text-slate-900 font-medium truncate max-w-[200px]">
                             {r.title}
                          </td>
                          <td className="px-3 py-2 border-r border-[#e3eaf5] whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            {session?.user.role === "ADMIN" && r.status !== "Resolved" ? (
                              <div className="relative inline-block">
                                <select
                                  value={r.priority || ""}
                                  onChange={(e) => setPriority(r, e.target.value)}
                                  className={`appearance-none cursor-pointer text-[10px] uppercase font-bold tracking-wider pl-2 pr-6 py-1 rounded outline-none focus:ring-1 focus:ring-[#1a53a1] ${
                                    !r.priority
                                      ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                      : r.priority === 'High'
                                      ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                                      : r.priority === 'Medium'
                                      ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                      : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  }`}
                                >
                                  <option value="" disabled>Select Priority</option>
                                  <option value="Low">Low</option>
                                  <option value="Medium">Medium</option>
                                  <option value="High">High</option>
                                </select>
                                <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                              </div>
                            ) : (
                             <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${!r.priority ? 'bg-slate-100 text-slate-500' : r.priority === 'High' ? 'bg-rose-100 text-rose-800' : r.priority === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                {r.priority || 'Not Set'}
                             </span>
                            )}
                          </td>
                          <td className="px-3 py-2 border-r border-[#e3eaf5] whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${statusStyles[r.status]}`}>
                              {r.status}
                            </span>
                          </td>
                          {session?.user.role === "ADMIN" && view === "queue" && (
                            <td className="px-3 py-2 border-r border-[#e3eaf5]">
                              <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                                <ActionGroup
                                  onInProgress={() => openActionModal(r, "In Progress")}
                                  onResolve={() => openActionModal(r, "Resolved")}
                                  onFlag={() => openActionModal(r, "Flagged")}
                                  isOverdue={isOverdue(r)}
                                />
                              </div>
                            </td>
                          )}
                          <td className="px-3 py-2 text-right">
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
                  Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalFiltered)} of {totalFiltered} entries
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
                      if (i !== 0 && i !== totalPages - 1 && Math.abs(page - 1 - i) > 1) {
                        if (i === 1 || i === totalPages - 2) return <span key={i} className="px-1 text-slate-400">...</span>;
                        return null;
                      }
                    }
                    return (
                      <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={`flex items-center justify-center w-8 h-8 rounded border text-xs font-bold transition-colors ${
                          page === i + 1 ? "bg-[#17386d] border-[#17386d] text-white" : "border-[#d9e4f3] text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex items-center justify-center w-8 h-8 rounded border border-[#d9e4f3] text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#131921] text-white px-4 py-2.5 rounded shadow-xl border border-white/20 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={14} className="text-emerald-400" />
          {toast}
        </div>
      )}

      {/* RECORD DETAIL DRAWER */}
      {activeRecord && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setActiveRecord(null)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in border-l border-slate-200">
            <div className="bg-gradient-to-r from-[#010b14] via-[#041a2d] to-[#17386d] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText size={18} className="text-[#F5A623]" />
                <div>
                  <h3 className="font-bold text-base tracking-wide">Complaint Details</h3>
                </div>
              </div>
              <button onClick={() => setActiveRecord(null)} className="text-slate-400 hover:text-white border border-transparent hover:border-white/30 p-1 rounded transition-colors focus:outline-none">
                <X size={18} />
              </button>
            </div>
            <div className={`h-[3px] w-full ${statusStyles[activeRecord.record.status].split(" ")[0]}`} />
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 bg-[#f8fafd]">
              <div className="bg-white rounded-lg border border-[#c7d7ec] p-4 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Title</span>
                <div className="text-lg font-bold text-[#1a53a1] mt-0.5">{activeRecord.record.title}</div>
                <div className="mt-3 grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium">Category</span>
                    <p className="text-sm font-bold text-slate-800">{activeRecord.record.category}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium">Status</span>
                    <p className="mt-0.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${statusStyles[activeRecord.record.status]}`}>
                        {activeRecord.record.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium">Priority</span>
                    <p className="mt-0.5">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${!activeRecord.record.priority ? 'bg-slate-100 text-slate-500' : activeRecord.record.priority === 'High' ? 'bg-rose-100 text-rose-800' : activeRecord.record.priority === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {activeRecord.record.priority || 'Not Set'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border border-[#e3eaf5] p-4 space-y-4 shadow-xs">
                <h4 className="text-xs font-bold text-[#17386d] uppercase tracking-wide border-b border-slate-100 pb-2">
                  Description
                </h4>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{activeRecord.record.description}</p>
              </div>

              {activeRecord.record.photoUrl && (
                <div className="bg-white rounded-lg border border-[#e3eaf5] p-4 space-y-4 shadow-xs">
                  <h4 className="text-xs font-bold text-[#17386d] uppercase tracking-wide border-b border-slate-100 pb-2">
                    Attachment
                  </h4>
                  <div className="mt-2 rounded border border-slate-200 overflow-hidden bg-slate-50 flex justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeRecord.record.photoUrl}
                      alt="Complaint attachment"
                      className="max-h-64 object-contain"
                    />
                  </div>
                </div>
              )}

              <div className="bg-white rounded-lg border border-[#e3eaf5] p-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1a53a1] font-bold text-sm shrink-0">
                    {activeRecord.record.user.name.charAt(0)}
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Resident</span>
                    <span className="text-sm font-bold text-slate-800">{activeRecord.record.user.name}</span>
                    <span className="text-[11px] text-slate-400 block">{activeRecord.record.user.email}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border border-[#e3eaf5] p-4 shadow-xs">
                 <h4 className="text-xs font-bold text-[#17386d] uppercase tracking-wide border-b border-slate-100 pb-2">
                    Action Required
                 </h4>
                 {isOverdue(activeRecord.record) ? (
                   <div className="mt-3 p-3 rounded-lg border text-xs leading-relaxed flex items-start gap-2.5 bg-rose-50 border-rose-200 text-rose-900">
                     <AlertTriangle size={14} className="shrink-0 mt-0.5 text-rose-600" fill="currentColor" />
                     <div>This complaint has been open for {overdueDays}+ days. Please take action!</div>
                   </div>
                 ) : (
                   <div className="mt-3 text-xs text-slate-500 italic">No urgent flags.</div>
                 )}
              </div>

              {/* HISTORY SECTION */}
              <div className="bg-white rounded-lg border border-[#e3eaf5] p-4 shadow-xs">
                 <h4 className="text-xs font-bold text-[#17386d] uppercase tracking-wide border-b border-slate-100 pb-4">
                    Status History
                 </h4>
                 {activeRecord.record.history && activeRecord.record.history.length > 0 ? (
                   <div className="relative border-l-2 border-slate-200 ml-3 space-y-6 mt-2">
                     {activeRecord.record.history.map((item, idx) => (
                       <div key={item.id} className="relative pl-5">
                         {/* Timeline dot */}
                         <div className={`absolute -left-[5px] top-1 h-2 w-2 rounded-full ring-4 ring-white ${item.status === 'Open' ? 'bg-amber-500' : item.status === 'In Progress' ? 'bg-blue-500' : item.status === 'Flagged' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                         <div className="flex flex-col">
                           <span className="text-xs font-bold text-slate-800">{item.status}</span>
                           <span className="text-[10px] text-slate-400 font-medium">{new Date(item.createdAt).toLocaleString()}</span>
                           {item.note && (
                             <p className="mt-1.5 text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                               {item.note}
                             </p>
                           )}
                         </div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="mt-3 text-xs text-slate-500 italic">No history available yet.</div>
                 )}
              </div>
            </div>
            
            {session?.user.role === "ADMIN" && activeRecord.record.status !== "Resolved" && (
              <div className="p-4 bg-white border-t flex justify-end gap-2 shrink-0">
                <button
                  onClick={() => openActionModal(activeRecord.record, "In Progress")}
                  className="px-3 py-2 border rounded text-xs font-semibold text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  In Progress
                </button>
                <button
                  onClick={() => openActionModal(activeRecord.record, "Flagged")}
                  className="px-3 py-2 border rounded text-xs font-semibold text-rose-600 border-rose-200 hover:bg-rose-50"
                  title="Flag as Overdue"
                >
                  Flag Overdue
                </button>
                <button
                  onClick={() => openActionModal(activeRecord.record, "Resolved")}
                  className="px-3 py-2 rounded text-xs font-semibold text-white bg-[#0fa968] hover:bg-[#0c8c56]"
                >
                  Resolve
                </button>
                <button onClick={() => setActiveRecord(null)} className="px-4 py-2 border rounded text-xs font-medium text-slate-600 hover:bg-slate-50">
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ACTION CONFIRMATION MODAL */}
      {actionModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeActionModal} />
          <div className="relative w-full max-w-md bg-[#f8fafc] rounded-lg shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
            <div className="bg-gradient-to-r from-[#010b14] via-[#041a2d] to-[#17386d] text-white p-4 flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-300 block mb-0.5">Complaint Update</span>
                <h3 className="text-sm font-bold tracking-wide">{actionModal.record.title}</h3>
              </div>
              <button onClick={closeActionModal} className="text-slate-300 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"><X size={18} /></button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto">
              <div className="bg-white border rounded-lg p-3 shadow-sm space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block border-b pb-1">New Status</span>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${actionModalConfig[actionModal.action].badgeClass}`}>
                    {actionModalConfig[actionModal.action].icon}
                    {actionModal.action}
                  </span>
                </div>
                <p className="text-xs text-slate-500 pt-1">
                  You are about to mark this complaint as {actionModal.action}. You can add an optional comment.
                </p>
              </div>

              <div className="bg-white border rounded-lg p-3 shadow-sm space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block border-b pb-1">Comment (optional)</span>
                <textarea
                  value={actionComment}
                  onChange={(e) => setActionComment(e.target.value)}
                  placeholder="Add a note to be recorded in history..."
                  rows={3}
                  className="w-full resize-none rounded-md border border-slate-200 px-2.5 py-2 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1a53a1]"
                />
              </div>
            </div>

            <div className="p-4 bg-white border-t flex justify-end gap-2 shrink-0">
              <button onClick={closeActionModal} className="px-4 py-2 border rounded text-xs font-medium text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
              <button
                onClick={confirmActionModal}
                className={`px-4 py-2 rounded text-xs font-semibold shadow-sm inline-flex items-center gap-1.5 ${actionModalConfig[actionModal.action].confirmClass}`}
              >
                {actionModalConfig[actionModal.action].icon}
                Confirm {actionModalConfig[actionModal.action].title.split(" ")[0]}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionGroup({
  onResolve,
  onInProgress,
  onFlag,
  isOverdue
}: {
  onResolve: () => void;
  onInProgress: () => void;
  onFlag: () => void;
  isOverdue: boolean;
}) {
  return (
    <div className="inline-flex items-stretch border border-slate-200 rounded-sm overflow-hidden shadow-sm">
      <button title="In Progress" onClick={onInProgress} className="flex items-center justify-center px-3 py-1.5 bg-white hover:bg-blue-600 text-slate-600 hover:text-white transition-colors border-r">
        <Clock size={14} strokeWidth={3} />
      </button>
      <button 
        title="Flag as Overdue" 
        onClick={onFlag} 
        className="flex items-center justify-center px-3 py-1.5 bg-white hover:bg-[#f97316] text-slate-600 hover:text-white transition-colors border-r"
      >
        <Flag size={12} strokeWidth={2.5} />
      </button>
      <button title="Resolve" onClick={onResolve} className="flex items-center justify-center px-3 py-1.5 bg-[#0fa968] hover:bg-[#0c8c56] text-white transition-colors">
        <Check size={14} strokeWidth={3} />
      </button>
    </div>
  );
}

function FilterField({
  label,
  icon: Icon,
  value,
  onChange,
  type = "text",
  placeholder,
  options,
}: {
  label: string;
  icon: React.ElementType;
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "date" | "select";
  placeholder?: string;
  options?: { value: string; label: string }[];
}) {
  return (
    <label className="block cursor-pointer group">
      <span className="block text-base font-bold text-slate-700 mb-1.5">{label}</span>
      <div className="relative flex items-stretch w-full h-10 rounded-[4px] overflow-hidden border border-slate-300 focus-within:border-[#F5A623] focus-within:ring-[2px] focus-within:ring-[#F5A623] transition-none bg-white shadow-sm">
        {type === "select" ? (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full appearance-none outline-none pl-3 pr-11 text-[15px] text-slate-800 bg-transparent cursor-pointer z-20"
          >
            {placeholder && <option value="All">{placeholder}</option>}
            {options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`flex-1 w-full outline-none pl-3 pr-11 text-[15px] text-slate-800 placeholder:text-slate-500 bg-transparent relative z-10 ${type === 'date' ? '[&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:top-0 [&::-webkit-calendar-picker-indicator]:w-11 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:z-30' : ''}`}
          />
        )}
        <div className="absolute right-0 top-0 bottom-0 w-11 bg-[#febd69] flex items-center justify-center border-l border-slate-300 shrink-0 pointer-events-none z-10 group-hover:bg-[#f3a847] transition-colors">
          <Icon size={18} className="text-[#333333]" strokeWidth={2.5} />
        </div>
      </div>
    </label>
  );
}
