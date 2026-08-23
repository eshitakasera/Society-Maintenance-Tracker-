"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Building2, LayoutDashboard, FileText, Bell, LogIn, UserPlus, Shield } from "lucide-react";
import ProfileMenu from "@/components/ProfileMenu";

export default function Navigation() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="bg-gradient-to-r from-[#010b14] via-[#041a2d] to-[#17386d] text-white flex items-center justify-between px-6 py-4 shadow-lg shrink-0 border-b-2 border-[#F5A623] relative z-50">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-white/10 p-2 rounded-lg group-hover:bg-white/20 transition-all border border-white/10 group-hover:border-white/30 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            <Building2 size={20} className="text-[#F5A623] group-hover:scale-110 transition-transform" />
          </div>
          <h1 className="text-xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
            SOCIETY<span className="text-[#F5A623]">TRACKER</span>
          </h1>
        </Link>
        <div className="hidden md:block h-6 w-px bg-white/20 mx-2" />
        
        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-2">
          {status !== "loading" && session ? (
            <>
              {session.user.role === "ADMIN" ? (
                <>
                  <NavLink href="/dashboard" icon={LayoutDashboard} label="Dashboard" active={isActive("/dashboard")} />
                  <NavLink href="/complaints" icon={FileText} label="Complaints" active={isActive("/complaints")} />
                  <NavLink href="/notices" icon={Bell} label="Notices" active={isActive("/notices")} />
                </>
              ) : (
                <>
                  <NavLink href="/complaints" icon={FileText} label="My Complaints" active={isActive("/complaints")} />
                  <NavLink href="/notices" icon={Bell} label="Notices" active={isActive("/notices")} />
                </>
              )}
            </>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {status === "loading" ? null : session ? (
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-1">
              <span className="font-bold text-white text-[15px] leading-tight">{session.user.name}</span>
              <span className="text-[11px] font-semibold text-[#F5A623] uppercase tracking-wider flex items-center gap-1">
                {session.user.role === "ADMIN" && <Shield size={10} />}
                {session.user.role}
              </span>
            </div>
            
            <ProfileMenu user={session.user} variant="dark" />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link 
              href="/login" 
              className="flex items-center gap-2 text-slate-200 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium"
            >
              <LogIn size={16} />
              Login
            </Link>
            <Link 
              href="/register" 
              className="flex items-center gap-2 bg-[#F5A623] hover:bg-[#e0961b] text-[#041a2d] px-4 py-2 rounded-lg font-bold text-sm shadow-[0_0_15px_rgba(245,166,35,0.3)] transition-all hover:scale-105"
            >
              <UserPlus size={16} />
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

function NavLink({ href, icon: Icon, label, active }: { href: string; icon: any; label: string; active: boolean }) {
  return (
    <Link 
      href={href}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium ${
        active 
          ? "bg-white/15 text-white border border-white/20 shadow-inner" 
          : "text-slate-300 hover:text-white hover:bg-white/5 border border-transparent"
      }`}
    >
      <Icon size={16} className={active ? "text-[#F5A623]" : "text-slate-400"} />
      {label}
    </Link>
  );
}
