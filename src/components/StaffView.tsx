/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Clinical Faculty Roster & System Permissions Management.
 */

import React, { useState, useMemo } from 'react';
import { 
  Users, ShieldCheck, CheckCircle2, UserPlus, Search, 
  Settings, Clock, Award, Phone, Mail, ToggleLeft, ToggleRight, 
  Trash2, X, Plus, AlertCircle, RefreshCw, Calendar, Sparkles, RotateCcw, AlertTriangle
} from 'lucide-react';
import { Staff, Role } from '../types';

interface StaffViewProps {
  allStaff: Staff[];
  loggedInStaff: Staff | null;
  onAddStaff: (newStaff: Staff) => void;
  onUpdateStaff: (updatedStaff: Staff[]) => void;
}

export default function StaffView({
  allStaff,
  loggedInStaff,
  onAddStaff,
  onUpdateStaff
}: StaffViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | Role>('ALL');
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(
    allStaff[0]?.id || null
  );

  // Form states for registering new staff
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<Role>(Role.DVM);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newRate, setNewRate] = useState(120);

  // Tab selections
  const [activeTab, setActiveTab] = useState<'ROSTER' | 'SCHEDULING'>('ROSTER');
  const [scheduleSearchQuery, setScheduleSearchQuery] = useState('');
  const [scheduleRoleFilter, setScheduleRoleFilter] = useState<'ALL' | Role>('ALL');

  // Load weekly schedule from localstorage
  const [weeklySchedule, setWeeklySchedule] = useState<{ [staffId: string]: string[] }>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vet_weekly_schedule');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          // ignore
        }
      }
    }
    
    // Default fallback: Generate realistic default schedule where active staff work
    const defaultSchedule: { [staffId: string]: string[] } = {};
    allStaff.forEach((s, sIdx) => {
      const shifts = [];
      for (let day = 0; day < 7; day++) {
        const dayHash = (sIdx + day) % 7;
        if (dayHash === 0 || dayHash === 6) {
          shifts.push('OFF');
        } else if (dayHash === 1 || dayHash === 4) {
          shifts.push('DAY');
        } else if (dayHash === 2 || dayHash === 5) {
          shifts.push('NIGHT');
        } else {
          shifts.push('ON_CALL');
        }
      }
      defaultSchedule[s.id] = shifts;
    });
    return defaultSchedule;
  });

  const handleUpdateShift = (staffId: string, dayIdx: number, newShift: string) => {
    const updated = {
      ...weeklySchedule,
      [staffId]: weeklySchedule[staffId] 
        ? weeklySchedule[staffId].map((s, idx) => idx === dayIdx ? newShift : s)
        : Array(7).fill('OFF').map((s, idx) => idx === dayIdx ? newShift : s)
    };
    setWeeklySchedule(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vet_weekly_schedule', JSON.stringify(updated));
      window.dispatchEvent(new Event('vet_schedule_updated'));
    }
  };

  const DAYS = [
    { key: 'Mon', label: 'Mon', fullLabel: 'Monday' },
    { key: 'Tue', label: 'Tue', fullLabel: 'Tuesday' },
    { key: 'Wed', label: 'Wed', fullLabel: 'Wednesday' },
    { key: 'Thu', label: 'Thu', fullLabel: 'Thursday' },
    { key: 'Fri', label: 'Fri', fullLabel: 'Friday' },
    { key: 'Sat', label: 'Sat', fullLabel: 'Saturday' },
    { key: 'Sun', label: 'Sun', fullLabel: 'Sunday' },
  ];

  const getShiftDetails = (shiftCode: string) => {
    switch (shiftCode) {
      case 'DAY':
        return {
          label: 'Day Shift',
          time: '08:00 - 16:00',
          bg: 'bg-amber-50 text-amber-800 border-amber-200/60 hover:bg-amber-100 hover:border-amber-300',
          dot: 'bg-amber-500',
          icon: '☀️'
        };
      case 'NIGHT':
        return {
          label: 'Night Shift',
          time: '16:00 - 24:00',
          bg: 'bg-indigo-50 text-indigo-800 border-indigo-200/60 hover:bg-indigo-100 hover:border-indigo-300',
          dot: 'bg-indigo-500',
          icon: '🌙'
        };
      case 'ON_CALL':
        return {
          label: 'On-Call Shift',
          time: '24h Standby',
          bg: 'bg-rose-50 text-rose-800 border-rose-200/60 hover:bg-rose-100 hover:border-rose-300',
          dot: 'bg-rose-500',
          icon: '🚨'
        };
      default:
        return {
          label: 'Off-duty',
          time: 'Off-duty',
          bg: 'bg-slate-50 text-slate-500 border-slate-200/60 hover:bg-slate-100 hover:border-slate-300',
          dot: 'bg-slate-300',
          icon: '💤'
        };
    }
  };

  const handleAutoSchedule = () => {
    const updated: typeof weeklySchedule = {};
    const shiftChoices = ['DAY', 'NIGHT', 'ON_CALL', 'OFF'];
    
    allStaff.forEach((s, sIdx) => {
      const shifts = [];
      for (let day = 0; day < 7; day++) {
        const dayHash = (sIdx + day) % 7;
        if (dayHash === 0 || dayHash === 6) {
          shifts.push('OFF');
        } else {
          // rota
          const shiftIdx = (sIdx + day) % 3;
          shifts.push(shiftChoices[shiftIdx]);
        }
      }
      updated[s.id] = shifts;
    });

    setWeeklySchedule(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vet_weekly_schedule', JSON.stringify(updated));
      window.dispatchEvent(new Event('vet_schedule_updated'));
    }
    alert('Smart scheduling complete! Recommended weekly shift rotations have been applied.');
  };

  const handleClearSchedule = () => {
    const updated: typeof weeklySchedule = {};
    allStaff.forEach(s => {
      updated[s.id] = Array(7).fill('OFF');
    });
    setWeeklySchedule(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vet_weekly_schedule', JSON.stringify(updated));
      window.dispatchEvent(new Event('vet_schedule_updated'));
    }
    alert('Weekly schedule cleared. All staff have been reset to Off-duty status.');
  };

  const handleResetToDefaults = () => {
    const defaultSchedule: typeof weeklySchedule = {};
    allStaff.forEach((s, sIdx) => {
      const shifts = [];
      for (let day = 0; day < 7; day++) {
        const dayHash = (sIdx + day) % 7;
        if (dayHash === 0 || dayHash === 6) {
          shifts.push('OFF');
        } else if (dayHash === 1 || dayHash === 4) {
          shifts.push('DAY');
        } else if (dayHash === 2 || dayHash === 5) {
          shifts.push('NIGHT');
        } else {
          shifts.push('ON_CALL');
        }
      }
      defaultSchedule[s.id] = shifts;
    });
    setWeeklySchedule(defaultSchedule);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vet_weekly_schedule', JSON.stringify(defaultSchedule));
      window.dispatchEvent(new Event('vet_schedule_updated'));
    }
    alert('Successfully restored default clinic rotation schedule.');
  };

  // Filter staff rows on scheduling board
  const filteredScheduleStaff = useMemo(() => {
    return allStaff.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(scheduleSearchQuery.toLowerCase()) || 
                          s.email.toLowerCase().includes(scheduleSearchQuery.toLowerCase());
      const matchRole = scheduleRoleFilter === 'ALL' || s.role === scheduleRoleFilter;
      return matchSearch && matchRole;
    });
  }, [allStaff, scheduleSearchQuery, scheduleRoleFilter]);

  // Active Selected Staff
  const selectedStaff = useMemo(() => {
    return allStaff.find(s => s.id === selectedStaffId) || allStaff[0] || null;
  }, [allStaff, selectedStaffId]);

  // Filtering clinicians
  const filteredStaff = useMemo(() => {
    return allStaff.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchRole = roleFilter === 'ALL' || s.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [allStaff, searchQuery, roleFilter]);

  // Toggle shift coverage active status
  const handleToggleActive = (staffId: string) => {
    const nextStaffList = allStaff.map(s => {
      if (s.id === staffId) {
        const nextState = !s.active;
        return { ...s, active: nextState };
      }
      return s;
    });
    onUpdateStaff(nextStaffList);
  };

  // Toggle permission flag for a staff member
  const handleTogglePermission = (staffId: string, permission: string) => {
    const nextStaffList = allStaff.map(s => {
      if (s.id === staffId) {
        const currentPerms = s.permissions || [];
        const updatedPerms = currentPerms.includes(permission)
          ? currentPerms.filter(p => p !== permission)
          : [...currentPerms, permission];
        return { ...s, permissions: updatedPerms };
      }
      return s;
    });
    onUpdateStaff(nextStaffList);
    
    const staffName = allStaff.find(s => s.id === staffId)?.name || 'Staff';
    alert(`System permissions configured!\n${staffName}'s access credentials updated for key: [${permission}].`);
  };

  // Add new clinical staff member
  const handleRegisterStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    // Create realistic initial permissions based on role
    const initialPerms: string[] = [];
    if (newRole === Role.DVM || newRole === Role.OWNER || newRole === Role.MANAGER) {
      initialPerms.push('SOAP_RECORDS_EDIT', 'BILLING_INVOICE', 'PHARMACY_Dispense', 'STAFF_PERMISSIONS_EDIT');
    } else if (newRole === Role.TECH) {
      initialPerms.push('SOAP_RECORDS_EDIT');
    } else if (newRole === Role.RECEPTION) {
      initialPerms.push('BILLING_INVOICE');
    } else if (newRole === Role.FINANCE) {
      initialPerms.push('BILLING_INVOICE');
    }

    const newStaffObj: Staff = {
      id: `st-new-${Date.now()}`,
      name: newName,
      email: newEmail,
      role: newRole,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(newName)}`,
      active: true,
      specialty: newSpecialty || undefined,
      billingRate: newRate || undefined,
      permissions: initialPerms
    };

    onAddStaff(newStaffObj);
    setSelectedStaffId(newStaffObj.id);
    
    // Clear fields
    setNewName('');
    setNewEmail('');
    setNewSpecialty('');
    setNewRate(120);
    setShowAddForm(false);
    alert(`Success! Clinician ${newName} has been dynamically onboarded and registered into the active shifts index.`);
  };

  return (
    <div className="space-y-6" id="clinical-staff-management-page">
      
      {/* Page Header */}
      <div className="border-b border-[#eff4ff] pb-4 flex flex-col md:flex-row justify-between md:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold font-sans text-[#0d1c2e] tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5.5 h-5.5 text-[#00647c]" /> Staff Roster, Shift Calendars &amp; Permissions Mode
          </h1>
          <p className="text-xs text-[#545d62] font-semibold mt-0.5">
            Audit clinic veterinarians, manage shift cover coverage status, coordinate security credentials, and onboard practitioners.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="px-3.5 py-2 bg-[#00647c] hover:bg-cyan-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm hover:scale-[1.01] transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" /> Register Clinic Faculty
        </button>
      </div>

      {/* QUICK ADD FACTULTY MODAL BLOCK */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#00647c]" /> Register New Clinical Faculty
              </h3>
              <button 
                onClick={() => setShowAddForm(false)}
                className="p-1 text-slate-400 hover:bg-slate-50 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterStaff} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-650 mb-1">Full Clinical Name</label>
                <input
                  type="text" required placeholder="e.g. Dr. Emily Carter, DVM"
                  value={newName} onChange={e => setNewName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-650 mb-1">Corporate Email Address</label>
                <input
                  type="email" required placeholder="e.g. emily.carter@hospital.com"
                  value={newEmail} onChange={e => setNewEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-650 mb-1">Active Medical Role</label>
                  <select
                    value={newRole} onChange={e => setNewRole(e.target.value as Role)}
                    className="w-full p-2.5 bg-white border rounded-xl"
                  >
                    <option value={Role.DVM}>Veterinarian (DVM)</option>
                    <option value={Role.TECH}>Vet Technician (RVT)</option>
                    <option value={Role.RECEPTION}>Reception Staff</option>
                    <option value={Role.MANAGER}>Practice Manager</option>
                    <option value={Role.FINANCE}>Financial Accountant</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-650 mb-1">DVM Medical Specialty</label>
                  <input
                    type="text" placeholder="e.g. Orthopedics, Cardiology"
                    value={newSpecialty} onChange={e => setNewSpecialty(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-650 mb-1">Clinic Booking Rate or Wage Rate ($/hr)</label>
                <input
                  type="number" min={50} max={500} defaultValue={120}
                  value={newRate} onChange={e => setNewRate(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono font-bold"
                />
              </div>

              <div className="bg-blue-50/50 p-2.5 rounded-xl border text-[10.5px] leading-relaxed text-slate-600">
                🚀 New staff profiles automatically generate random customized avatars and establish default secure credentials matching their roles.
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button" onClick={() => setShowAddForm(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#00647c] hover:bg-cyan-800 text-white font-bold rounded-xl shadow-xs"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex border-[#EFF4FF] border-b">
        <button
          onClick={() => setActiveTab('ROSTER')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all leading-none flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'ROSTER'
              ? 'border-[#00647c] text-[#00647c]'
              : 'border-transparent text-slate-500 hover:text-slate-850'
          }`}
        >
          🧑‍⚕️ Roster & Permissions
        </button>
        <button
          onClick={() => setActiveTab('SCHEDULING')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all leading-none flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'SCHEDULING'
              ? 'border-[#00647c] text-[#00647c]'
              : 'border-transparent text-slate-500 hover:text-slate-855'
          }`}
        >
          📅 Planner Panel
        </button>
      </div>

      {activeTab === 'ROSTER' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: STAFF LIST */}
          <div className="lg:col-span-5 bg-white border rounded-2xl p-5 shadow-xs space-y-4">
            
            <div className="flex flex-col gap-3">
              
              {/* Search Input */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  placeholder="Search staff by name or email..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-8.5 pr-4 py-2.5 bg-slate-50 border border-slate-200 hover:bg-white focus:bg-white rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-350 transition-colors"
                />
              </div>

              {/* Role filter buttons */}
              <div className="flex flex-wrap gap-1 border-b pb-3 border-slate-100">
                {(['ALL', Role.DVM, Role.TECH, Role.RECEPTION, Role.MANAGER, Role.FINANCE] as const).map(role => (
                  <button
                    key={role}
                    onClick={() => setRoleFilter(role)}
                    className={`text-[9.5px] font-bold py-1 px-2.5 rounded-lg border transition-all select-none ${
                      roleFilter === role
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-3xs'
                        : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {role === 'ALL' ? 'Show All' : role}
                  </button>
                ))}
              </div>

            </div>

            {/* Core scrollable clinician list */}
            <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-1">
              {filteredStaff.length === 0 ? (
                <p className="text-xs text-slate-500 py-8 text-center bg-slate-50 border rounded-xl border-dashed">
                  No hospital staff match your search criteria.
                </p>
              ) : (
                filteredStaff.map((staff) => {
                  const isSelected = selectedStaff?.id === staff.id;
                  return (
                    <div
                      key={staff.id}
                      onClick={() => setSelectedStaffId(staff.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-[#eff4ff]/60 border-[#00647c] shadow-2xs'
                          : 'bg-white hover:bg-slate-50/70 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={staff.avatar} 
                          alt={staff.name} 
                          referrerPolicy="no-referrer"
                          className="w-9 h-9 rounded-full object-cover border bg-slate-50 shrink-0" 
                        />
                        <div className="truncate max-w-[140px] sm:max-w-[200px]">
                          <h4 className="text-xs font-bold text-slate-800 leading-snug">{staff.name}</h4>
                          <p className="text-[10px] text-slate-400 truncate leading-none mt-1">{staff.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                          staff.role === Role.DVM ? 'bg-amber-50 text-amber-800 border-amber-200' :
                          staff.role === Role.TECH ? 'bg-sky-50 text-sky-800 border-sky-200' : 
                          staff.role === Role.RECEPTION ? 'bg-purple-50 text-purple-800 border-purple-200' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {staff.role}
                        </span>

                        {/* Direct coverage shift switch */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleActive(staff.id);
                          }}
                          title={staff.active ? "Currently on shift. Click to set off-duty." : "Currently off-duty. Click to set active coverage."}
                          className="focus:outline-none hover:scale-105 transition-transform"
                        >
                          {staff.active ? (
                            <ToggleRight className="w-6.5 h-6.5 text-emerald-600 cursor-pointer" />
                          ) : (
                            <ToggleLeft className="w-6.5 h-6.5 text-slate-350 cursor-pointer" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: DETAIL ASSIGNMENTS & PERMISSIONS */}
          <div className="lg:col-span-7 space-y-6">
            
            {selectedStaff ? (
              <div className="bg-white border rounded-2xl p-5 shadow-xs space-y-5">
                
                {/* Detailed Card Bio */}
                <div className="flex items-start justify-between gap-4 border-b pb-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedStaff.avatar}
                      alt={selectedStaff.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-full object-cover border bg-slate-50"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-855 flex items-center gap-1.5">
                        {selectedStaff.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">{selectedStaff.email}</p>
                      
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span className="text-[9px] bg-slate-100 px-2 py-0.5 font-bold rounded-lg uppercase">
                          Role: {selectedStaff.role}
                        </span>
                        {selectedStaff.specialty && (
                          <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 font-bold rounded-lg border border-indigo-150">
                            🎓 {selectedStaff.specialty}
                          </span>
                        )}
                        
                        {/* Active status indicator */}
                        <span className={`text-[9px] px-2 py-0.5 font-bold rounded-lg ${
                          selectedStaff.active 
                            ? 'bg-emerald-50 text-emerald-800' 
                            : 'bg-rose-50 text-rose-800'
                        }`}>
                          {selectedStaff.active ? '● Coverage Roster Active' : '○ Standby / Off Duty'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider font-mono">Service Rate Rate</span>
                    <span className="text-base font-bold font-mono text-[#00647c]">${selectedStaff.billingRate || 120}/hr</span>
                  </div>
                </div>

                {/* Roster shift schedules details */}
                <div className="p-4 bg-[#eff4ff]/30 border border-slate-150 rounded-xl space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-750 uppercase tracking-widest flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#00647c]" /> Shift Coverage Status Roster
                  </h4>
                  <p className="text-[10.5px] leading-relaxed text-slate-550 font-semibold">
                    When toggled as <strong>Active</strong>, the practitioner is actively cataloged for automated surgery splits, on-duty technical monitoring tasks checklists, and the direct clinician lookup menus at reception desk bookings.
                  </p>

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={() => handleToggleActive(selectedStaff.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-[10.5px] tracking-wide cursor-pointer transition-all ${
                        selectedStaff.active
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {selectedStaff.active ? '✓ Cover Shifts Active Office-Wide' : 'Set Active for Shift Support'}
                    </button>
                    <p className="text-[10px] text-slate-400">
                      Currently: {selectedStaff.active ? 'Accepting medical admissions.' : 'Not active.'}
                    </p>
                  </div>
                </div>

                {/* Security permissions config */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1 border-b pb-2">
                    <ShieldCheck className="w-4.5 h-4.5 text-indigo-500" /> Access Authorization Control Matrix
                  </h4>
                  <p className="text-[10.5px] text-slate-500">
                    Enable or withdraw system actions for this specific credentials key based on standard HIPAA or clinical guidelines guidelines:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                    
                    <div className="p-3.5 border rounded-xl flex items-start gap-2 bg-slate-50/50 hover:bg-white transition-colors">
                      <input
                        type="checkbox"
                        id="perm-soap"
                        checked={(selectedStaff.permissions || []).includes('SOAP_RECORDS_EDIT')}
                        onChange={() => handleTogglePermission(selectedStaff.id, 'SOAP_RECORDS_EDIT')}
                        className="mt-0.5 rounded text-[#00647c] cursor-pointer"
                      />
                      <label htmlFor="perm-soap" className="select-none cursor-pointer space-y-0.5">
                        <span className="block text-xs font-bold text-slate-850">SOAP EHR Editing</span>
                        <span className="block text-[9.5px] text-slate-400">Authorizes practitioner charting, writeups and locking clinical treatment notes.</span>
                      </label>
                    </div>

                    <div className="p-3.5 border rounded-xl flex items-start gap-2 bg-slate-50/50 hover:bg-white transition-colors">
                      <input
                        type="checkbox"
                        id="perm-bill"
                        checked={(selectedStaff.permissions || []).includes('BILLING_INVOICE')}
                        onChange={() => handleTogglePermission(selectedStaff.id, 'BILLING_INVOICE')}
                        className="mt-0.5 rounded text-[#00647c] cursor-pointer"
                      />
                      <label htmlFor="perm-bill" className="select-none cursor-pointer space-y-0.5">
                        <span className="block text-xs font-bold text-slate-850">Billing Folder Settlement</span>
                        <span className="block text-[9.5px] text-slate-400">Authorizes patient invoice adjustments, check-out payments, and ledger logs.</span>
                      </label>
                    </div>

                    <div className="p-3.5 border rounded-xl flex items-start gap-2 bg-slate-50/50 hover:bg-white transition-colors">
                      <input
                        type="checkbox"
                        id="perm-pharm"
                        checked={(selectedStaff.permissions || []).includes('PHARMACY_Dispense')}
                        onChange={() => handleTogglePermission(selectedStaff.id, 'PHARMACY_Dispense')}
                        className="mt-0.5 rounded text-[#00647c] cursor-pointer"
                      />
                      <label htmlFor="perm-pharm" className="select-none cursor-pointer space-y-0.5">
                        <span className="block text-xs font-bold text-slate-850">Prescription Dispensation</span>
                        <span className="block text-[9.5px] text-slate-400">Permits dispensing critical pharmaceutical medications and dangerous narcotics.</span>
                      </label>
                    </div>

                    <div className="p-3.5 border rounded-xl flex items-start gap-2 bg-slate-50/50 hover:bg-white transition-colors">
                      <input
                        type="checkbox"
                        id="perm-staff"
                        checked={(selectedStaff.permissions || []).includes('STAFF_PERMISSIONS_EDIT')}
                        onChange={() => handleTogglePermission(selectedStaff.id, 'STAFF_PERMISSIONS_EDIT')}
                        className="mt-0.5 rounded text-[#00647c] cursor-pointer"
                      />
                      <label htmlFor="perm-staff" className="select-none cursor-pointer space-y-0.5">
                        <span className="block text-xs font-bold text-slate-850">Faculty Configuration</span>
                        <span className="block text-[9.5px] text-slate-400">Grants operational power to modify roster duty shifts, catalogs and security access keys.</span>
                      </label>
                    </div>

                  </div>

                </div>

              </div>
            ) : (
              <div className="bg-slate-50 p-12 text-center rounded-2xl border border-dashed border-slate-300">
                <p className="text-xs text-slate-500 font-medium">Select a practitioner from the faculty list directory to audit active shift schedules or update operational permissions.</p>
              </div>
            )}

          </div>

        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          
          {/* Quick Schedule Actions Banner & Filters */}
          <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-xs space-y-4">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 leading-none">
                  📅 Clinician Weekly Schedule Control Center
                </h3>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Click on any staff member's day cell to cycle through shifts. All changes sync in real-time across clinical dashboards.
                </span>
              </div>
              
              {/* Quick actions row */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleAutoSchedule}
                  className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-800 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:-translate-y-0.5 duration-150"
                  title="Auto-generate rotation schedule"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Auto-Schedule
                </button>
                <button
                  type="button"
                  onClick={handleResetToDefaults}
                  className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:-translate-y-0.5 duration-150"
                  title="Restore default schedule"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Default
                </button>
                <button
                  type="button"
                  onClick={handleClearSchedule}
                  className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:-translate-y-0.5 duration-150"
                  title="Set all to 'Off-duty'"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear Schedule
                </button>
              </div>
            </div>

            {/* Filter controls row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
              
              {/* Filter Search */}
              <div className="relative w-full sm:max-w-xs">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  placeholder="Search name or email..."
                  value={scheduleSearchQuery}
                  onChange={e => setScheduleSearchQuery(e.target.value)}
                  className="w-full text-xs pl-8.5 pr-4 py-2 bg-slate-50 border border-slate-200 hover:bg-white focus:bg-white rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-350 transition-colors"
                />
              </div>

              {/* Filter role selector */}
              <div className="flex flex-wrap gap-1">
                {(['ALL', Role.DVM, Role.TECH, Role.RECEPTION, Role.MANAGER, Role.FINANCE] as const).map(role => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setScheduleRoleFilter(role)}
                    className={`text-[9.5px] font-bold py-1 px-2.5 rounded-lg border transition-all select-none cursor-pointer ${
                      scheduleRoleFilter === role
                        ? 'bg-[#00647c] text-white border-[#00647c] shadow-3xs'
                        : 'bg-white hover:bg-slate-50 text-slate-650 border-slate-200'
                    }`}
                  >
                    {role === 'ALL' ? 'All Roles' : role}
                  </button>
                ))}
              </div>

            </div>

          </div>

          {/* MAIN SCHEDULE MATRIX GRID */}
          <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden" id="staff-scheduling-board">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-150">
                    <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono w-[200px]">
                      Clinical Faculty &amp; Role
                    </th>
                    {DAYS.map(day => (
                      <th key={day.key} className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono text-center">
                        {day.fullLabel}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredScheduleStaff.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-xs text-slate-400 font-semibold bg-slate-50/50">
                        No hospital staff match your active filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredScheduleStaff.map(staff => {
                      const staffShifts = weeklySchedule[staff.id] || Array(7).fill('OFF');
                      return (
                        <tr key={staff.id} className="hover:bg-slate-50/30 transition-colors">
                          
                          {/* Left Column: Staff Info Cell */}
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={staff.avatar}
                                alt={staff.name}
                                referrerPolicy="no-referrer"
                                className="w-8 h-8 rounded-full border bg-slate-50 shrink-0 object-cover"
                              />
                              <div className="truncate">
                                <h4 className="text-xs font-bold text-slate-800 leading-tight block truncate max-w-[120px]">
                                  {staff.name}
                                </h4>
                                <span className={`inline-block mt-1 text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase leading-none ${
                                  staff.role === Role.DVM ? 'bg-amber-50 text-amber-800 border-amber-200' :
                                  staff.role === Role.TECH ? 'bg-sky-50 text-sky-800 border-sky-200' : 
                                  staff.role === Role.RECEPTION ? 'bg-purple-50 text-purple-800 border-purple-200' : 'bg-slate-100 text-slate-755'
                                }`}>
                                  {staff.role}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* 7 Shift Cells */}
                          {DAYS.map((day, dayIdx) => {
                            const currentShiftCode = staffShifts[dayIdx] || 'OFF';
                            const details = getShiftDetails(currentShiftCode);
                            
                            const handleCellClick = () => {
                              const nextMap: { [key: string]: string } = {
                                'OFF': 'DAY',
                                'DAY': 'NIGHT',
                                'NIGHT': 'ON_CALL',
                                'ON_CALL': 'OFF'
                              };
                              const nextShift = nextMap[currentShiftCode] || 'OFF';
                              handleUpdateShift(staff.id, dayIdx, nextShift);
                            };

                            return (
                              <td key={day.key} className="p-2 text-center">
                                <button
                                  type="button"
                                  onClick={handleCellClick}
                                  className={`w-full max-w-[124px] mx-auto p-2.5 rounded-xl border text-left flex flex-col space-y-1 transition-all duration-150 cursor-pointer hover:shadow-sm hover:-translate-y-0.5 ${details.bg}`}
                                  title={`${staff.name} - ${day.fullLabel}: Current Shift [${details.label}] - Click to rotate`}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <span className="text-[10px] font-bold flex items-center gap-1 truncate font-sans">
                                      <span>{details.icon}</span> <span>{details.label}</span>
                                    </span>
                                    <span className={`w-1.5 h-1.5 rounded-full ${details.dot}`} />
                                  </div>
                                  <span className="text-[8px] font-mono font-semibold text-slate-450 block leading-none pt-0.5">
                                    {details.time}
                                  </span>
                                </button>
                              </td>
                            );
                          })}

                        </tr>
                      );
                    })
                  )}
                </tbody>

              </table>
            </div>
          </div>

          {/* CLINICAL COVERAGE STATISTICS & LOAD DENSITY ANALYST */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4" id="coverage-safety-analysis">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 leading-none">
                📊 Daily Hospital Staffing Density &amp; Safety Level
              </h3>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Visual analysis audits veterinarian and technician load each day to flag safety shortages. Maintain at least 1 DVM for patient safety.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
              {DAYS.map((day, dayIdx) => {
                let scheduledDVMs = 0;
                let scheduledTechs = 0;
                let scheduledOthers = 0;

                allStaff.forEach(s => {
                  const shifts = weeklySchedule[s.id] || Array(7).fill('OFF');
                  const sShift = shifts[dayIdx];
                  if (sShift && sShift !== 'OFF') {
                    if (s.role === Role.DVM || s.role === Role.OWNER) {
                      scheduledDVMs++;
                    } else if (s.role === Role.TECH) {
                      scheduledTechs++;
                    } else {
                      scheduledOthers++;
                    }
                  }
                });

                // Safety flag calculation
                let safetyBadge = {
                  label: 'Fully Staffed',
                  style: 'bg-emerald-50 text-emerald-800 border-emerald-250 font-bold'
                };
                if (scheduledDVMs === 0) {
                  safetyBadge = {
                    label: '🚨 No Vet Care',
                    style: 'bg-rose-50 text-rose-800 border-rose-250 font-bold animate-pulse'
                  };
                } else if (scheduledTechs === 0) {
                  safetyBadge = {
                    label: '⚠️ No Techs',
                    style: 'bg-amber-50 text-amber-800 border-amber-250 font-bold'
                  };
                }

                return (
                  <div key={day.key} className="bg-white border border-[#E2E8F0] rounded-xl p-3 shadow-2xs flex flex-col justify-between space-y-3 hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200" id={`safety-card-${day.key}`}>
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">
                        {day.fullLabel.slice(0, 3)}
                      </span>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>DVM</span>
                          <span className="font-mono font-bold text-slate-800">{scheduledDVMs}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>Tech</span>
                          <span className="font-mono font-bold text-slate-800">{scheduledTechs}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 border-t pt-1 mt-1 border-dashed">
                          <span>Total</span>
                          <span className="font-mono font-bold text-slate-800">{scheduledDVMs + scheduledTechs + scheduledOthers}</span>
                        </div>
                      </div>
                    </div>

                    <span className={`text-[8px] py-1 px-1.5 rounded-lg border block text-center leading-tight tracking-tight ${safetyBadge.style}`} id={`safety-badge-${day.key}`}>
                      {safetyBadge.label}
                    </span>
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
