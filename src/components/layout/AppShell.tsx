'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  FileText, 
  Pill, 
  Receipt, 
  ClipboardList, 
  Stethoscope, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  PawPrint,
  Menu,
  X,
  Search,
  Bell,
  LogOut
} from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
}

export default function AppShell({ children, title }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  
  // Mobile sidebar open state
  const [mobileOpen, setMobileOpen] = useState(false);
  // Search text input state
  const [searchValue, setSearchValue] = useState('');

  // Extract user details with high-fidelity defaults falling back to current local user
  const user = session?.user;
  const userName = user?.name || "Dr. Alex Smith";
  const userRole = (user as any)?.role || "Chief Veterinarian";
  const firstLetter = userName.charAt(0).toUpperCase() || "V";

  // Sidebar navigation items
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Appointments', path: '/appointments', icon: Calendar },
    { label: 'Clients', path: '/clients', icon: Users },
    { label: 'Medical Records', path: '/records', icon: FileText },
    { label: 'Pharmacy', path: '/pharmacy', icon: Pill },
    { label: 'Invoicing', path: '/invoicing', icon: Receipt },
    { label: 'Tasks', path: '/tasks', icon: ClipboardList },
    { label: 'Staff', path: '/staff', icon: Stethoscope },
    { label: 'Consultations', path: '/consultations', icon: MessageSquare },
    { label: 'Reports', path: '/reports', icon: BarChart3 },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/clients?search=${encodeURIComponent(searchValue)}`);
  };

  const currentTabName = title || navItems.find(item => item.path === pathname)?.label || "Workspace";

  return (
    <div className="min-h-screen flex bg-[#F1F5F9]" id="app-root-container">
      
      {/* 1. Left Sidebar - Desktop Layout (Fixed width 240px, Dark Teal background #0F766E) */}
      <aside 
        className="hidden lg:flex flex-col w-[240px] fixed inset-y-0 left-0 bg-[#0F766E] text-white select-none border-r border-[#0D6E66] shadow-sm z-50 h-screen"
        id="desktop-sidebar"
      >
        {/* Top: Clinic logo and title brand */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-[#0D6E66]/60">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-[#0F766E] shadow-sm">
            <PawPrint className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight leading-none text-white">VetHub</h1>
            <p className="text-[10px] text-teal-200/80 uppercase font-black tracking-widest mt-1">Clinical Vitality</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto px-2" id="clinic-sidebar-nav">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => {
                  router.push(item.path);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left text-xs font-semibold cursor-pointer transition-all duration-150 ${
                  isActive 
                    ? 'bg-[#0D6E66] text-white border-l-3 border-white' 
                    : 'text-teal-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom User Area containing Session metadata and Sign Out toggle */}
        <div className="p-4 bg-[#0D6E66]/40 border-t border-[#0D6E66]/60">
          <div className="flex items-center gap-3 justify-between overflow-hidden">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div 
                className="w-8 h-8 rounded-full bg-white text-[#0F766E] flex items-center justify-center font-bold text-xs shrink-0 shadow-inner"
                title={userName}
              >
                {firstLetter}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate leading-none mb-1">
                  {userName}
                </p>
                <span className="inline-block bg-[#0f766e]/80 text-[9px] px-1.5 py-0.5 rounded text-white border border-[#0d6e66] font-bold">
                  {userRole}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => signOut()}
              title="Sign Out Session"
              className="p-1.5 hover:bg-white/10 text-teal-200 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Mobile Responsive Drawer (< 1024px, Sliding panel overlaying screen) */}
      <div 
        className={`lg:hidden fixed inset-0 z-50 transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}
        id="mobile-sidebar-drawer"
      >
        {/* Overlay backdrop */}
        {mobileOpen && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-3xs"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <aside className="relative flex flex-col w-[240px] h-full bg-[#0F766E] text-white z-50">
          <div className="h-16 flex items-center justify-between px-5 border-b border-[#0D6E66]/65">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#0F766E]">
                <PawPrint className="w-4.5 h-4.5 fill-current" />
              </div>
              <span className="text-sm font-bold tracking-tight text-white font-sans">VetHub</span>
            </div>
            <button 
              onClick={() => setMobileOpen(false)}
              className="text-teal-200 hover:text-white p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-grow py-4 space-y-1 overflow-y-auto px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    router.push(item.path);
                    setMobileOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left text-xs font-semibold cursor-pointer ${
                    isActive 
                      ? 'bg-[#0D6E66] text-white border-l-3 border-white' 
                      : 'text-teal-100/90 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 bg-[#0D6E66]/40 border-t border-[#0D6E66]/60 flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-white text-[#0F766E] flex items-center justify-center font-bold text-xs shrink-0">
                {firstLetter}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate max-w-[120px]">{userName}</p>
                <p className="text-[9px] text-teal-200">{userRole}</p>
              </div>
            </div>
            <button onClick={() => signOut()} className="text-teal-200 hover:text-white p-1">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </aside>
      </div>

      {/* 3. Right Sided Content Layout (lg:ml-240px offset, white Header nav bar + nested container) */}
      <div className="flex-grow lg:pl-[240px] flex flex-col min-h-screen">
        
        {/* Top Navbar Section (height 64px, white background, border-b #E2E8F0) */}
        <header className="sticky top-0 bg-white h-16 flex items-center justify-between px-6 border-b border-[#E2E8F0] z-40">
          
          {/* Left panel header with burger button trigger */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
              title="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm md:text-base font-bold text-slate-800 uppercase tracking-tight">
              {currentTabName}
            </h1>
          </div>

          {/* Right panel header: Search inputs, Bell logs feed, Profile avatar */}
          <div className="flex items-center gap-4">
            
            {/* Search form trigger navigating on path */}
            <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center bg-[#F1F5F9] px-3.5 py-1.5 rounded-full border border-transparent focus-within:border-slate-300 transition-all max-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input 
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="搜索客户或宠物..."
                className="bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-xs w-full text-slate-800 placeholder-slate-400"
              />
            </form>

            <button 
              onClick={() => router.push('/clients?search=')}
              className="sm:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-full cursor-pointer"
              title="搜索"
            >
              <Search className="w-4.5 h-4.5" />
            </button>

            {/* Notification bell triggering dialog logs */}
            <div className="relative">
              <button 
                onClick={() => alert('No new VetHub clinical notifications.')}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4.5 h-4.5 text-slate-700" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full" />
              </button>
            </div>

            <div className="h-6 w-px bg-slate-200" />

            {/* Current user Profile image / initials avatar circle */}
            <div 
              className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700"
              title={userName}
            >
              {firstLetter}
            </div>

          </div>
        </header>

        {/* Right Fluid Operations Content Workspace (background #F1F5F9, standard padding 24px) */}
        <main className="flex-1 p-6" id="dashboard-content-workspace">
          {children}
        </main>

      </div>

    </div>
  );
}
