"use client";

import { useState } from "react";
import { LogOut, X } from "lucide-react";
import { signOut } from "next-auth/react";

function initialsOf(name: string) {
  return name.trim().split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "?";
}

const avatarPalette = [
  { bg: "bg-violet-100", text: "text-violet-600" },
  { bg: "bg-blue-100", text: "text-blue-600" },
  { bg: "bg-emerald-100", text: "text-emerald-600" },
  { bg: "bg-amber-100", text: "text-amber-600" },
  { bg: "bg-rose-100", text: "text-rose-600" },
];

function avatarColor(name: string) {
  const sum = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return avatarPalette[sum % avatarPalette.length];
}

function AvatarCircle({
  name,
  size = 36,
}: {
  name: string;
  size?: number;
}) {
  const { bg, text } = avatarColor(name || "?");
  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-full flex items-center justify-center font-semibold shrink-0 border border-slate-200 ${bg} ${text}`}
    >
      <span style={{ fontSize: size * 0.4 }}>{initialsOf(name || "?")}</span>
    </div>
  );
}

interface ProfileMenuProps {
  user: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    role?: string | null;
  };
  variant?: "dark" | "light";
  className?: string;
}

export default function ProfileMenu({
  user,
  variant = "dark",
  className = "",
}: ProfileMenuProps) {
  const [open, setOpen] = useState(false);

  function openMenu() {
    setOpen(true);
  }

  async function handleLogout() {
    await signOut({ callbackUrl: `${window.location.origin}/login` });
  }

  const triggerClasses =
    variant === "dark"
      ? "hover:ring-2 hover:ring-white/30"
      : "hover:ring-2 hover:ring-slate-300";

  return (
    <div className={`relative isolate ${className}`}>
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openMenu())}
        className={`rounded-full transition-all ${triggerClasses}`}
        title="Your profile"
      >
        <AvatarCircle name={user?.name || "User"} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[998]" onClick={() => setOpen(false)} />

          <div className="absolute z-[999] top-full mt-3 right-0 w-[340px] bg-white rounded-md shadow-2xl ring-1 ring-slate-200/70 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-700 tracking-tight">
                  Society App
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="text-sm font-medium text-rose-500 hover:text-rose-700 border-b-2 border-transparent hover:border-rose-600 pb-0.5 transition-colors flex items-center gap-1"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>

            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="relative shrink-0 mt-1">
                  <AvatarCircle name={user?.name || "User"} size={64} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <div className="text-base font-bold text-slate-800 truncate">
                      {user?.name || "User"}
                    </div>
                  </div>
                  <div className="mt-1 space-y-1">
                    <p className="text-sm text-blue-600 truncate" title={user?.email || ""}>
                      {user?.email || ""}
                    </p>
                    <p className="text-xs text-slate-500 font-medium capitalize truncate mt-1">
                      Role: {user?.role || "User"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
