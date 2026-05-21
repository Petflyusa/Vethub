/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PawPrint, LogOut, Users, LayoutDashboard, Calendar, FileText } from 'lucide-react';
import { Staff, Role } from '../types';

interface DashboardHeaderProps {
  currentStaff: Staff;
  currentTab: 'dashboard' | 'patients';
  onTabChange: (tab: 'dashboard' | 'patients') => void;
  onLogout: () => void;
}

export default function DashboardHeader({
  currentStaff,
  currentTab,
  onTabChange,
  onLogout
}: DashboardHeaderProps) {
  
  // Format the visual role representation string
  const formatRole = (role: Role) => {
    switch (role) {
      case Role.OWNER: return 'Chief Medical Officer / Owner';
      case Role.ADMIN: return 'System Administrator';
      case Role.MANAGER: return 'Clinic Operations Manager';
      case Role.DVM: return 'Veterinary Surgeon (DVM)';
      case Role.TECH: return 'Registered Veterinary Nurse';
      case Role.RECEPTION: return 'Receptionist';
      case Role.FINANCE: return 'Clinical Accountant';
      default: return role;
    }
  };

  return (
    <header className="bg-white border-b border-outline-variant/60 sticky top-0 z-40 shadow-xs px-4 md:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
      
      {/* Brand Identity */}
      <div className="flex items-center gap-3 select-none">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <PawPrint className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#0d1c2e] tracking-tight font-sans flex items-center gap-1.5 leading-none">
            VetHub
          </h2>
          <span className="text-[10px] text-primary font-bold tracking-wide uppercase font-mono">
            Clinical Vitality Systems
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <nav className="flex items-center bg-[#f8f9ff] p-1 rounded-lg border border-outline-variant/50">
        <button
          onClick={() => onTabChange('dashboard')}
          className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
            currentTab === 'dashboard'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'text-[#3e484d] hover:bg-[#e6eeff] hover:text-primary'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </button>
        <button
          onClick={() => onTabChange('patients')}
          className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
            currentTab === 'patients'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'text-[#3e484d] hover:bg-[#e6eeff] hover:text-primary'
          }`}
        >
          <Users className="w-4 h-4" />
          Clients & Pets
        </button>
      </nav>

      {/* User Actions */}
      <div className="flex items-center gap-4">
        {/* User Details */}
        <div className="flex items-center gap-3 text-right">
          <div className="hidden xs:block">
            <h4 className="text-xs font-bold text-[#0d1c2e] leading-snug">
              {currentStaff.name}
            </h4>
            <p className="text-[10px] text-[#545d62] font-semibold flex items-center justify-end gap-1 font-sans">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {formatRole(currentStaff.role)}
            </p>
          </div>
          <img
            src={currentStaff.avatar}
            alt={currentStaff.name}
            referrerPolicy="no-referrer"
            className="w-9 h-9 rounded-full object-cover border border-outline-variant"
          />
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-outline-variant/60 hidden xs:block" />

        {/* Logout Button */}
        <button
          onClick={onLogout}
          title="Sign out of VetHub"
          className="p-2 text-[#545d62] hover:text-error hover:bg-error-container/20 rounded-lg transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
