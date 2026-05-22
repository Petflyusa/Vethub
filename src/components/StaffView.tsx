/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Users, Search, Plus, Calendar, Clock, ChevronLeft, ChevronRight, 
  MapPin, Printer, ShieldCheck, HelpCircle, FileText, UserPlus, 
  ToggleLeft, ToggleRight, Check, X, Filter, Sparkles 
} from 'lucide-react';
import { Staff, Role, getRoleDefaultPermissions, hasPermission } from '../types';

interface StaffViewProps {
  allStaff: Staff[];
  loggedInStaff: Staff | null;
  onAddStaff?: (staff: Staff) => void;
  onUpdateStaff?: (staff: Staff) => void;
}

interface Shift {
  id: string;
  staffId: string;
  staffName: string;
  role: string;
  dayIndex: number; // 0 = Mon, 1 = Tue, 2 = Wed, etc.
  startTime: string; // e.g., "07:00"
  endTime: string; // e.g., "15:00"
  notes?: string;
  appointments?: string[]; // Nested appointments for high fidelity surgery lists
}

export default function StaffView({ 
  allStaff, 
  loggedInStaff, 
  onAddStaff, 
  onUpdateStaff
}: StaffViewProps) {
  // Toast notifications state
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'info' | 'error' }[]>([]);
  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Local active state tracking for staff members
  const [localStaff, setLocalStaff] = useState<Staff[]>(() => {
    // Merge database staff with the mockup specific staff for perfect fidelity
    const initialSeed = [
      {
        id: 'mock-sarah-miller',
        name: 'Dr. Sarah Miller',
        email: 'sarah.miller@vethub.com',
        role: Role.DVM,
        avatar: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?w=150&auto=format&fit=crop&q=80',
        active: true,
        specialty: 'Surgery Dept.',
        billingRate: 160
      },
      {
        id: 'mock-james-wilson',
        name: 'James Wilson',
        email: 'james.wilson@vethub.com',
        role: Role.TECH,
        avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
        active: true,
        specialty: 'General Care',
        billingRate: 45
      },
      {
        id: 'mock-elena-rodriguez',
        name: 'Elena Rodriguez',
        email: 'elena.rodriguez@vethub.com',
        role: Role.RECEPTION,
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
        active: true,
        specialty: 'Marketing & Admin',
        billingRate: 35
      },
      {
        id: 'mock-tom-kennedy',
        name: 'Tom Kennedy',
        email: 'tom.kennedy@vethub.com',
        role: Role.TECH,
        avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
        active: true,
        specialty: 'Lab Services',
        billingRate: 50
      }
    ];

    // Filter out duplicates from allStaff to keep list rich
    const dbStaff = allStaff.filter(db => !initialSeed.some(s => s.name === db.name));
    return [...initialSeed, ...dbStaff];
  });

  // Subview toggles and synchronizations
  const [activeSubView, setActiveSubView] = useState<'scheduler' | 'permissions'>('scheduler');
  const [selectedStaffIdPermissions, setSelectedStaffIdPermissions] = useState<string | null>(null);

  const [editStaffName, setEditStaffName] = useState('');
  const [editStaffEmail, setEditStaffEmail] = useState('');
  const [editStaffRole, setEditStaffRole] = useState<Role>(Role.TECH);
  const [editStaffSpecialty, setEditStaffSpecialty] = useState('');
  const [editStaffBillingRate, setEditStaffBillingRate] = useState(0);
  const [editStaffPermissions, setEditStaffPermissions] = useState<string[]>([]);

  React.useEffect(() => {
    if (allStaff && allStaff.length > 0) {
      setLocalStaff(prev => {
        return allStaff.map(db => {
          const match = prev.find(p => p.id === db.id);
          return match ? { ...match, ...db } : db;
        });
      });
    }
  }, [allStaff]);

  React.useEffect(() => {
    if (selectedStaffIdPermissions) {
      const match = localStaff.find(s => s.id === selectedStaffIdPermissions);
      if (match) {
        setEditStaffName(match.name);
        setEditStaffEmail(match.email);
        setEditStaffRole(match.role);
        setEditStaffSpecialty(match.specialty || '');
        setEditStaffBillingRate(match.billingRate || 0);
        setEditStaffPermissions(match.permissions || getRoleDefaultPermissions(match.role));
      }
    }
  }, [selectedStaffIdPermissions, localStaff]);

  // Seed shift database matching layout exactly
  const [shifts, setShifts] = useState<Shift[]>([
    {
      id: 'shift-1',
      staffId: 'mock-sarah-miller',
      staffName: 'Dr. Sarah Miller',
      role: 'Surgery',
      dayIndex: 0, // Mon
      startTime: '07:00',
      endTime: '15:00',
      appointments: ['Orthopedic - Max', 'Dental - Bella']
    },
    {
      id: 'shift-2',
      staffId: 'mock-tom-kennedy',
      staffName: 'Tom Kennedy',
      role: 'Lab',
      dayIndex: 1, // Tue
      startTime: '07:00',
      endTime: '14:30'
    },
    {
      id: 'shift-3',
      staffId: 'mock-elena-rodriguez',
      staffName: 'Elena Rodriguez',
      role: 'Reception',
      dayIndex: 2, // Wed
      startTime: '08:30',
      endTime: '18:30'
    },
    {
      id: 'shift-4',
      staffId: 'mock-james-wilson',
      staffName: 'James Wilson',
      role: 'General',
      dayIndex: 2, // Wed
      startTime: '15:00',
      endTime: '21:00'
    }
  ]);

  // Sidebar parameters state
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [location, setLocation] = useState('Central Clinic');
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0); // Navigation offset
  const [roleFilter, setRoleFilter] = useState<'all' | 'DVM' | 'TECH' | 'RECEPTION'>('all');
  const [staffSearchQuery, setStaffSearchQuery] = useState('');

  // Shift assignment modals
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isQuickShiftOpen, setIsQuickShiftOpen] = useState(false);

  // New Staff state
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<Role>(Role.TECH);
  const [newStaffSpecialty, setNewStaffSpecialty] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');

  // New Shift state
  const [newShiftStaffId, setNewShiftStaffId] = useState('');
  const [newShiftRole, setNewShiftRole] = useState('');
  const [newShiftDay, setNewShiftDay] = useState(2); // Wednesday default
  const [newShiftStart, setNewShiftStart] = useState('09:00');
  const [newShiftEnd, setNewShiftEnd] = useState('17:00');

  // Compute total dynamic hours from active shifts
  const computedTotalHours = useMemo(() => {
    let totalMinutes = 0;
    shifts.forEach(s => {
      // Find staff and check if they are active
      const staffMember = localStaff.find(st => st.id === s.staffId);
      if (staffMember && !staffMember.active) return; // skip inactive staff hours

      const [startH, startM] = s.startTime.split(':').map(Number);
      const [endH, endM] = s.endTime.split(':').map(Number);
      
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;
      
      if (endMinutes > startMinutes) {
        totalMinutes += (endMinutes - startMinutes);
      }
    });
    return (totalMinutes / 60).toFixed(1);
  }, [shifts, localStaff]);

  // Count active staff currently on duty (or listed)
  const staffOnDutyCount = useMemo(() => {
    return localStaff.filter(st => st.active).length;
  }, [localStaff]);

  const daysOfWeek = [
    { name: 'Mon', dateNum: 15, full: 'Monday' },
    { name: 'Tue', dateNum: 16, full: 'Tuesday' },
    { name: 'Wed', dateNum: 17, full: 'Wednesday' },
    { name: 'Thu', dateNum: 18, full: 'Thursday' },
    { name: 'Fri', dateNum: 19, full: 'Friday' },
    { name: 'Sat', dateNum: 20, full: 'Saturday' },
    { name: 'Sun', dateNum: 21, full: 'Sunday' }
  ];

  // Helper to convert time "07:00" to offset position
  const getTimeOffsetPerc = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const totalMinutesFrom7AM = (h * 60 + m) - (7 * 60); // Base is 07:00 AM
    // Range is 14 hours (07:00 to 21:00) => 840 minutes
    const percentage = (totalMinutesFrom7AM / 840) * 100;
    return Math.max(0, Math.min(100, percentage));
  };

  // Helper to calculate duration pixel height/percentage
  const getDurationPerc = (startTime: string, endTime: string) => {
    const [h1, m1] = startTime.split(':').map(Number);
    const [h2, m2] = endTime.split(':').map(Number);
    
    const minutes1 = h1 * 60 + m1;
    const minutes2 = h2 * 60 + m2;
    
    const durationMins = minutes2 - minutes1;
    const totalRangeMins = 840; // 14 hours
    return (durationMins / totalRangeMins) * 100;
  };

  const toggleStaffActive = (staffId: string) => {
    setLocalStaff(prev => prev.map(st => {
      if (st.id === staffId) {
        const nextState = !st.active;
        addToast(`${st.name} is now marked as ${nextState ? 'Checked-In & On duty' : 'Off-duty'}`, 'info');
        return { ...st, active: nextState };
      }
      return st;
    }));
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName) return;

    const newMember: Staff = {
      id: `staff-dynamic-${Date.now()}`,
      name: newStaffName,
      email: newStaffEmail || `${newStaffName.toLowerCase().replace(/\s+/g, '.')}@vethub.com`,
      role: newStaffRole,
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
      active: true,
      specialty: newStaffSpecialty || 'General Practice',
      billingRate: newStaffRole === Role.DVM ? 140 : 55
    };

    setLocalStaff(prev => [...prev, newMember]);
    if (onAddStaff) {
      onAddStaff(newMember);
    }

    addToast(`Successfully registered ${newMember.name} to clinic duty roster`, 'success');
    
    // Clear form
    setNewStaffName('');
    setNewStaffSpecialty('');
    setNewStaffEmail('');
    setIsAddStaffOpen(false);
  };

  const handleCreateShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShiftStaffId) {
      addToast('Please select a staff member first', 'error');
      return;
    }

    const matchedS = localStaff.find(s => s.id === newShiftStaffId);
    if (!matchedS) return;

    // Validate times
    const [h1, m1] = newShiftStart.split(':').map(Number);
    const [h2, m2] = newShiftEnd.split(':').map(Number);
    if ((h1 * 60 + m1) >= (h2 * 60 + m2)) {
      addToast('End time must be after start time', 'error');
      return;
    }

    const newShift: Shift = {
      id: `shift-dynamic-${Date.now()}`,
      staffId: newShiftStaffId,
      staffName: matchedS.name,
      role: newShiftRole || (matchedS.role === Role.DVM ? 'Surgery' : matchedS.role === Role.TECH ? 'General' : 'Reception'),
      dayIndex: Number(newShiftDay),
      startTime: newShiftStart,
      endTime: newShiftEnd
    };

    setShifts(prev => [...prev, newShift]);
    addToast(`Scheduled ${newShift.staffName} for a ${newShift.role} shift on ${daysOfWeek[newShift.dayIndex].full}`, 'success');
    setIsQuickShiftOpen(false);
  };

  const handleDeleteShift = (shiftId: string, name: string) => {
    setShifts(prev => prev.filter(s => s.id !== shiftId));
    addToast(`Removed shift assignment for ${name}`, 'info');
  };

  // Filter staff roster
  const filteredStaff = useMemo(() => {
    return localStaff.filter(st => {
      const matchesRole = roleFilter === 'all' || st.role === roleFilter;
      const matchesSearch = st.name.toLowerCase().includes(staffSearchQuery.toLowerCase()) || 
                            st.role.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
                            (st.specialty || '').toLowerCase().includes(staffSearchQuery.toLowerCase());
      return matchesRole && matchesSearch;
    });
  }, [localStaff, roleFilter, staffSearchQuery]);

  const handleExportPDF = () => {
    addToast('Compiling secure operation logs into PDF layout. Downloading...', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6" id="staff-management-view">
      {/* Subview Selector Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50 max-w-sm shadow-xs mb-4">
        <button
          type="button"
          onClick={() => setActiveSubView('scheduler')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubView === 'scheduler' 
              ? 'bg-[#00647c] text-white shadow-xs' 
              : 'text-[#3e484d] hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Scheduler</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveSubView('permissions');
            if (localStaff.length > 0 && !selectedStaffIdPermissions) {
              setSelectedStaffIdPermissions(localStaff[0].id);
            }
          }}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubView === 'permissions' 
              ? 'bg-[#00647c] text-white shadow-xs' 
              : 'text-[#3e484d] hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Permissions</span>
        </button>
      </div>

      {activeSubView === 'scheduler' && (
        <>
          {/* Top dashboard action bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-outline-variant/40 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Location Selector */}
          <div className="relative">
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg py-2 pl-3 pr-8 text-xs font-semibold text-[#0d1c2e] focus:outline-none focus:ring-1 focus:ring-[#00647c] cursor-pointer"
            >
              <option value="Central Clinic">📍 Central Clinic</option>
              <option value="West Broward Branch">📍 West Broward Branch</option>
              <option value="Northside Urgent PetCare">📍 Northside Urgent PetCare</option>
            </select>
          </div>

          {/* Week / Month Toggles */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                viewMode === 'week' 
                  ? 'bg-white shadow-xs text-[#00647c]' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                viewMode === 'month' 
                  ? 'bg-white shadow-xs text-[#00647c]' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Month
            </button>
          </div>

          {/* Chevron Navigation */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentWeekOffset(prev => prev - 1)}
              className="p-1.5 hover:bg-slate-100 rounded-full border border-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-[#0d1c2e]">
              {currentWeekOffset === 0 ? 'May 15 - May 21, 2026' : `Week (Offset: ${currentWeekOffset})`}
            </span>
            <button 
              onClick={() => setCurrentWeekOffset(prev => prev + 1)}
              className="p-1.5 hover:bg-slate-100 rounded-full border border-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => addToast('Successfully published current weekly clinical schedule to portals', 'success')}
            className="px-4 py-2 border border-[#00647c] text-[#00647c] hover:bg-[#00647c]/5 rounded-lg text-xs font-bold transition-all hover:shadow-xs cursor-pointer"
          >
            Publish Schedule
          </button>
          <button
            onClick={() => setIsAddStaffOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#00647c] hover:bg-[#007f9d] text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Staff Member</span>
          </button>
        </div>
      </div>

      {/* Main Split Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT PANEL: Staff List (1/3 Width) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-4 shadow-xs h-full min-h-[500px]">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <h3 className="font-bold text-[#0d1c2e] text-xs uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-[#00647c]" />
              <span>Veterinary Roster</span>
            </h3>
            <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">
              {filteredStaff.length} Listed
            </span>
          </div>

          <div className="space-y-3">
            {/* Search Input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <Search className="w-4 h-4" id="staff-search-icon" />
              </span>
              <input 
                type="text"
                value={staffSearchQuery}
                onChange={(e) => setStaffSearchQuery(e.target.value)}
                placeholder="Search staff, specialties, etc..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-4 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#00647c]"
              />
            </div>

            {/* Role Filter Pills */}
            <div className="flex flex-wrap gap-1">
              {[
                { label: 'All', id: 'all' },
                { label: 'DVM', id: 'DVM' },
                { label: 'Techs', id: 'TECH' },
                { label: 'Reception', id: 'RECEPTION' }
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => setRoleFilter(p.id as any)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-tight transition-all cursor-pointer ${
                    roleFilter === p.id 
                      ? 'bg-[#00647c] text-white' 
                      : 'bg-slate-100 hover:bg-slate-200 text-[#3e484d]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Roster Cards */}
          <div className="flex-1 overflow-y-auto space-y-2 max-h-[480px] pr-1">
            {filteredStaff.map(member => (
              <div 
                key={member.id}
                className={`p-3 rounded-lg border transition-all flex items-center justify-between ${
                  member.active 
                    ? 'border-slate-200 bg-white hover:border-[#00647c]/30 hover:bg-slate-50/50' 
                    : 'border-slate-100 bg-slate-50/70 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <img 
                      src={member.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'} 
                      alt={member.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                      member.active ? 'bg-green-500' : 'bg-slate-350'
                    }`} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[#0d1c2e] text-xs">
                      {member.name}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`px-1.5 py-0.2 rounded text-[8px] font-extrabold uppercase tracking-wider ${
                        member.role === Role.DVM ? 'bg-green-100 text-green-800' :
                        member.role === Role.TECH ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-850'
                      }`}>
                        {member.role === Role.OWNER ? 'MD/OWNER' : member.role}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {member.specialty || 'General Care'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Active Checkbox / Toggle Switch */}
                <button
                  type="button"
                  onClick={() => toggleStaffActive(member.id)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-[#00647c] transition-colors cursor-pointer"
                  title={member.active ? "Status: Active Duty" : "Status: Off Duty"}
                >
                  {member.active ? (
                    <ToggleRight className="w-7 h-7 text-[#00647c] shrink-0" />
                  ) : (
                    <ToggleLeft className="w-7 h-7 text-slate-350 shrink-0" />
                  )}
                </button>
              </div>
            ))}

            {filteredStaff.length === 0 && (
              <div className="text-center py-10 text-slate-400 text-xs">
                No veterinary staff match search criteria
              </div>
            )}
          </div>

          {/* Add Quick Role Button */}
          <button
            onClick={() => {
              setIsQuickShiftOpen(true);
            }}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-dashed border-slate-200 hover:border-[#00647c]/50 bg-slate-50/50 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-[#00647c] text-xs font-bold transition-all transition-colors cursor-pointer select-none"
          >
            <Plus className="w-4 h-4 shrink-0 text-[#00647c]" />
            <span>Schedule Shift Assignment</span>
          </button>
        </div>

        {/* RIGHT PANEL: Week Schedule Grid (2/3 Width) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden shadow-xs">
          
          {/* Week Calendar Headers */}
          <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-slate-200 bg-slate-50/85">
            <div className="h-12 flex items-center justify-center">
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            {daysOfWeek.map((day, idx) => {
              const isWedActive = idx === 2; // Wednesday May 17 is active in mockup
              return (
                <div 
                  key={day.name} 
                  className={`h-12 flex flex-col items-center justify-center border-l border-slate-200/50 ${
                    isWedActive ? 'bg-[#00647c]/5' : ''
                  }`}
                >
                  <span className={`text-[9px] font-bold uppercase ${
                    isWedActive ? 'text-[#00647c]' : 'text-slate-400'
                  }`}>
                    {day.name}
                  </span>
                  <span className={`text-xs font-extrabold ${
                    isWedActive ? 'text-[#00647c] font-black' : 'text-[#0d1c2e]'
                  }`}>
                    {day.dateNum}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Calendar Grid hours layout */}
          <div className="relative flex-grow min-h-[500px] overflow-y-auto">
            
            {/* Visual Red Current Time Line */}
            <div className="absolute top-[180px] inset-x-0 h-0.5 bg-red-500/70 z-10 pointer-events-none">
              <div className="absolute left-1 md:left-14 -top-1 w-2.5 h-2.5 bg-red-650 rounded-full animate-ping" />
              <div className="absolute left-1 md:left-14 -top-1 w-2.5 h-2.5 bg-red-600 rounded-full shadow-md" />
              <div className="absolute -top-3.5 left-16 bg-red-500 text-white text-[8px] font-mono font-bold px-1 py-0.2 rounded leading-none">
                09:15 AM Live
              </div>
            </div>

            {/* Time Slots rows (7 AM to 9 PM = 14 intervals) */}
            {Array.from({ length: 14 }).map((_, i) => {
              const hourNum = 7 + i;
              const formattedHour = hourNum < 12 
                ? `${hourNum}:00 AM` 
                : hourNum === 12 
                  ? '12:00 PM' 
                  : `${hourNum - 12}:00 PM`;

              return (
                <div 
                  key={i}
                  className="grid grid-cols-[60px_repeat(7,1fr)] h-12 border-b border-slate-100 hover:bg-slate-50/20"
                >
                  {/* Left Column labels */}
                  <div className="flex items-start justify-center pt-1.5 text-[9px] font-mono text-slate-400 font-semibold md:tracking-tight border-r border-slate-100">
                    {hourNum === 7 || hourNum % 2 === 1 ? formattedHour.replace(' AM', '').replace(' PM', '') : ''}
                  </div>
                  {/* Columns for Mon-Sun */}
                  {Array.from({ length: 7 }).map((_, colIdx) => (
                    <div 
                      key={colIdx} 
                      onClick={() => {
                        setNewShiftDay(colIdx);
                        setNewShiftStart(`${hourNum < 10 ? '0' + hourNum : hourNum}:00`);
                        setNewShiftEnd(`${(hourNum + 4) < 10 ? '0' + (hourNum + 4) : Math.min(21, hourNum + 4)}:00`);
                        setIsQuickShiftOpen(true);
                      }}
                      className={`border-l border-slate-100/70 transition-colors hover:bg-[#00647c]/3 cursor-pointer ${
                        colIdx === 2 ? 'bg-[#00647c]/[0.015]' : ''
                      }`}
                    />
                  ))}
                </div>
              );
            })}

            {/* Placed Shifts Stack elements with high resolution absolute positioning */}
            <div className="absolute inset-0 pl-[60px] pointer-events-none">
              <div className="grid grid-cols-7 h-full pointer-events-none">
                {Array.from({ length: 7 }).map((_, colIdx) => {
                  const dayShifts = shifts.filter(s => s.dayIndex === colIdx);
                  return (
                    <div key={colIdx} className="relative h-full px-1 py-0.5 pointer-events-none">
                      {dayShifts.map((sh, sIdx) => {
                        const topPerc = getTimeOffsetPerc(sh.startTime);
                        const durPerc = getDurationPerc(sh.startTime, sh.endTime);
                        
                        const staffMember = localStaff.find(m => m.id === sh.staffId);
                        const isInactive = staffMember && !staffMember.active;

                        // Distinct colors based on shift roles
                        const colorStyles = 
                          sh.role === 'Surgery' 
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-250 hover:bg-emerald-100' :
                          sh.role === 'Lab' 
                            ? 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100' :
                          sh.role === 'Reception'
                            ? 'bg-amber-50 text-amber-900 border-amber-250 hover:bg-amber-100' :
                            'bg-sky-50 text-sky-900 border-sky-200 hover:bg-sky-100';

                        const colorBadge = 
                          sh.role === 'Surgery' ? 'bg-emerald-200 text-emerald-800' :
                          sh.role === 'Lab' ? 'bg-slate-200 text-slate-700' :
                          sh.role === 'Reception' ? 'bg-amber-200 text-amber-800' :
                          'bg-sky-200 text-sky-800';

                        return (
                          <div 
                            key={sh.id}
                            className={`absolute left-1 right-1 border rounded-lg p-2 overflow-hidden shadow-xs transition-all pointer-events-auto cursor-pointer ${colorStyles} ${
                              isInactive ? 'opacity-30 line-through grayscale border-dashed border-slate-300' : ''
                            }`}
                            style={{ 
                              top: `${topPerc}%`, 
                              height: `${durPerc}%`,
                              minHeight: '44px',
                              zIndex: 20 + sIdx
                            }}
                          >
                            <div className="flex items-center justify-between pointer-events-none">
                              <span className={`text-[8px] font-black uppercase px-1 rounded ${colorBadge}`}>
                                {sh.role}
                              </span>
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteShift(sh.id, sh.staffName);
                                }}
                                className="text-slate-400 hover:text-red-500 pointer-events-auto p-0.5 rounded cursor-pointer"
                                title="Remove Assignment"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>

                            <p className="text-[10px] font-extrabold mt-1 tracking-tight truncate leading-tight">
                              {sh.staffName}
                            </p>
                            <p className="text-[9px] font-mono opacity-80 leading-none">
                              {sh.startTime} - {sh.endTime}
                            </p>

                            {/* Render sub-appointment pills if surgery (Fidelity feature) */}
                            {sh.appointments && sh.appointments.length > 0 && (
                              <div className="mt-1.5 space-y-1 pointer-events-none hidden md:block">
                                {sh.appointments.map((apt, idx) => (
                                  <div key={idx} className="bg-white/70 border-l-2 border-emerald-600 rounded text-[9px] font-bold px-1 py-0.5 text-emerald-900 break-words">
                                    {apt}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* FOOTER: Live shift telemetry footer bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500 font-bold">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#00647c]/10 rounded-lg text-[#00647c]">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] text-slate-450 uppercase leading-none">Total Scheduled Hours</p>
              <p className="text-sm font-black text-[#0d1c2e]">{computedTotalHours} hrs</p>
            </div>
          </div>

          <div className="flex items-center gap-2 border-l border-slate-100 pl-6">
            <div className="p-2 bg-green-50 rounded-lg text-green-700">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] text-slate-450 uppercase leading-none">Active Staff On Duty</p>
              <p className="text-sm font-black text-[#0d1c2e]">{staffOnDutyCount}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Export PDF</span>
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Print Grid</span>
          </button>
        </div>
      </div>
        </>
      )}

      {/* ACCESS RULES & DYNAMIC PERMISSIONS CONTROLLER */}
      {activeSubView === 'permissions' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-xs" id="permissions-manager-root">
          {/* Left Column: Staff Directory Selection */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-4 shadow-sm h-full min-h-[500px]">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h3 className="font-extrabold text-[#0d1c2e] text-xs uppercase tracking-wider flex items-center gap-2 font-sans">
                <Users className="w-4 h-4 text-[#00647c]" />
                <span>Practitioner Directory</span>
              </h3>
              <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                {localStaff.length} Members
              </span>
            </div>

            {/* Directory Staff List Cards */}
            <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[600px] pr-1">
              {localStaff.map((st) => (
                <button
                  type="button"
                  key={st.id}
                  onClick={() => setSelectedStaffIdPermissions(st.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                    selectedStaffIdPermissions === st.id
                      ? 'border-[#00647c] bg-[#00647c]/5 shadow-xs scale-[1.01]'
                      : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#0d1c2e] text-white flex items-center justify-center font-bold text-xs ring-2 ring-[#00647c]/20">
                      {st.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-[#0d1c2e] leading-snug">{st.name}</p>
                      <p className="text-[10px] text-slate-500 font-medium leading-none mt-1">{st.role}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 font-sans">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-extrabold uppercase tracking-wide opacity-90 ${
                      st.active !== false 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : 'bg-rose-50 text-rose-700'
                    }`}>
                      {st.active !== false ? 'Active' : 'On Leave'}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 font-bold">
                      {(st.permissions || getRoleDefaultPermissions(st.role)).length} rules
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsAddStaffOpen(true)}
              className="mt-auto flex items-center justify-center gap-1.5 w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 rounded-lg text-xs font-bold text-[#00647c] transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register New Staff</span>
            </button>
          </div>

          {/* Right Column: Detailed Security Profile & Core Toggles */}
          <div className="lg:col-span-2 space-y-6">
            {selectedStaffIdPermissions ? (() => {
              const currentStaffItem = localStaff.find(s => s.id === selectedStaffIdPermissions);
              if (!currentStaffItem) return null;

              // Helper for checking if custom rules are live vs template rules
              const roleDefaults = getRoleDefaultPermissions(editStaffRole);
              const hasCustomRuleOverrides = editStaffPermissions.some(p => !roleDefaults.includes(p)) || roleDefaults.some(p => !editStaffPermissions.includes(p));

              // Toggling singular privilege handler
              const handleTogglePermissionId = (permId: string) => {
                if (editStaffPermissions.includes(permId)) {
                  setEditStaffPermissions(prev => prev.filter(p => p !== permId));
                } else {
                  setEditStaffPermissions(prev => [...prev, permId]);
                }
              };

              // Revert to role default handler
              const handleResetToRoleDefaults = () => {
                setEditStaffPermissions(getRoleDefaultPermissions(editStaffRole));
                addToast(`Reset ${currentStaffItem.name} permissions to standard ${editStaffRole} template`, 'info');
              };

              // Saving entire form handler
              const handleSaveStaffSecurityCredentials = (e: React.FormEvent) => {
                e.preventDefault();
                const updatedStaffMember: Staff = {
                  ...currentStaffItem,
                  name: editStaffName,
                  email: editStaffEmail || `${editStaffName.toLowerCase().replace(/\s+/g, '')}@clinic.com`,
                  role: editStaffRole,
                  specialty: editStaffSpecialty,
                  billingRate: Number(editStaffBillingRate) || 0,
                  permissions: editStaffPermissions,
                };

                // Save locally first
                setLocalStaff(prev => prev.map(s => s.id === updatedStaffMember.id ? updatedStaffMember : s));
                // Call parent callback if configured
                if (onUpdateStaff) {
                  onUpdateStaff(updatedStaffMember);
                }
                addToast(`Successfully updated credentials and permissions for ${editStaffName}`, 'success');
              };

              return (
                <form onSubmit={handleSaveStaffSecurityCredentials} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
                  {/* Executive Header info card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="font-extrabold text-sm text-[#0d1c2e] font-sans">Manage Accessibility Passports</h3>
                      <p className="text-xs text-slate-500 mt-1 font-medium">Configure profile coordinates and toggle specific role permissions.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasCustomRuleOverrides ? (
                        <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200/50 flex items-center gap-1.5 font-sans">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
                          Custom Override Active
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-slate-50 text-slate-600 px-2.5 py-1 rounded-full border border-slate-150 flex items-center gap-1.5 font-sans">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          Matches Role Defaults
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Profiler properties deck */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-[#0d1c2e] uppercase tracking-widest block font-sans">Display Name</label>
                      <input
                        type="text"
                        required
                        value={editStaffName}
                        onChange={(e) => setEditStaffName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-[#00647c] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-[#0d1c2e] uppercase tracking-widest block font-sans">Contact Email</label>
                      <input
                        type="email"
                        required
                        value={editStaffEmail}
                        onChange={(e) => setEditStaffEmail(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-[#00647c] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-[#0d1c2e] uppercase tracking-widest block font-sans">Core Security Role</label>
                      <select
                        value={editStaffRole}
                        onChange={(e) => {
                          const newR = e.target.value as Role;
                          setEditStaffRole(newR);
                          setEditStaffPermissions(getRoleDefaultPermissions(newR));
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-[#00647c] focus:outline-none cursor-pointer font-bold font-sans"
                      >
                        {Object.values(Role).map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-[#0d1c2e] uppercase tracking-widest block font-sans">Specialization</label>
                        <input
                          type="text"
                          value={editStaffSpecialty}
                          onChange={(e) => setEditStaffSpecialty(e.target.value)}
                          placeholder="e.g. Surgery"
                          className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-[#00647c] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-[#0d1c2e] uppercase tracking-widest block font-sans">Billing Rate ($/hr)</label>
                        <input
                          type="number"
                          value={editStaffBillingRate}
                          onChange={(e) => setEditStaffBillingRate(Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-[#00647c] focus:outline-none font-bold font-sans"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Checker list */}
                  <div className="space-y-3 font-sans">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-xs text-[#0d1c2e] uppercase tracking-wider">Granular Permission Registers</h4>
                      <button
                        type="button"
                        onClick={handleResetToRoleDefaults}
                        className="text-[10px] font-extrabold text-[#00647c] hover:underline cursor-pointer font-bold"
                      >
                        Reset to {editStaffRole} Defaults
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        {
                          id: 'DASHBOARD_ACCESS',
                          title: 'Executive Dashboards',
                          desc: 'Viewing metrics graphs, dynamic charts & financial indicators',
                        },
                        {
                          id: 'APPOINTMENTS_VIEW',
                          title: 'Read Appointments',
                          desc: 'Accessing calendars, active schedules, and check-in rows',
                        },
                        {
                          id: 'APPOINTMENTS_EDIT',
                          title: 'Manage Appointments',
                          desc: 'Scheduling, rebooking, slot reserves and cancellation locks',
                        },
                        {
                          id: 'PATIENTS_VIEW',
                          title: 'View Health Records',
                          desc: 'Browsing pet clinical folders, vaccine charts and owner biodata',
                        },
                        {
                          id: 'PATIENTS_EDIT',
                          title: 'Register & Edit Profiles',
                          desc: 'Creating new client accounts, pet cards, and emergency notes',
                        },
                        {
                          id: 'SOAP_RECORDS_EDIT',
                          title: 'Authorize Clinical Notes',
                          desc: 'Creating SOAP documentation, diagnostic records, and procedures',
                        },
                        {
                          id: 'PHARMACY_Dispense',
                          title: 'Pharmacy Dispenser',
                          desc: 'Dispensing pharmacological inventory and prescription approvals',
                        },
                        {
                          id: 'BILLING_INVOICE',
                          title: 'Invoicing & Payments',
                          desc: 'Compiling service prices, printing invoice worksheets, and recording bills',
                        },
                        {
                          id: 'STAFF_PERMISSIONS_EDIT',
                          title: 'Rosters & Access Rules',
                          desc: 'Editing active staff shifts, modifying roles, and setting permissions',
                        },
                      ].map((perm) => {
                        const isChecked = editStaffPermissions.includes(perm.id);
                        return (
                          <div
                            key={perm.id}
                            onClick={() => handleTogglePermissionId(perm.id)}
                            className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer select-none ${
                              isChecked
                                ? 'border-[#00647c]/30 bg-[#00647c]/[0.02] hover:bg-[#00647c]/[0.04]'
                                : 'border-slate-150 bg-white hover:bg-slate-50/50'
                            }`}
                          >
                            <div className="mt-0.5 font-sans font-bold">
                              {isChecked ? (
                                <div className="w-5 h-5 rounded-md bg-[#00647c] text-white flex items-center justify-center shadow-xs">
                                  <Check className="w-3.5 h-3.5" />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-md border border-slate-300 bg-white" />
                              )}
                            </div>
                            <div className="space-y-0.5 pointer-events-none">
                              <p className="font-extrabold text-xs text-[#0d1c2e]">{perm.title}</p>
                              <p className="text-[10px] text-slate-500 leading-normal font-medium">{perm.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Form Trigger Row */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 font-sans">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStaffIdPermissions(null);
                        setActiveSubView('scheduler');
                      }}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-600 cursor-pointer"
                    >
                      Exit Permissions
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#00647c] hover:bg-[#007f9d] text-white rounded-lg text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Save Staff Policies</span>
                    </button>
                  </div>
                </form>
              );
            })() : (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 space-y-3">
                <ShieldCheck className="w-12 h-12 stroke-[1.2] text-[#00647c] mx-auto animate-bounce" />
                <p className="text-xs font-bold text-[#0d1c2e] font-sans">Select a Practitioner</p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto font-medium">Click any clinician or support team member on the left panel to examine their operational passport, edit details, and modify privilege levels dynamically.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DIALOG 1: Add staff member */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 bg-[#0d1c2e]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="add-staff-modal">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
            <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase text-[#0d1c2e] tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#00647c]" />
                <span>Register New Staff</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setIsAddStaffOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-slate-500 font-bold">Full Name</label>
                <input 
                  type="text"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder="e.g. Dr. Frank Marcus"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#00647c]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-500 font-bold">Roster Role</label>
                  <select 
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value as Role)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none cursor-pointer text-xs font-bold"
                  >
                    <option value={Role.DVM}>DVM (Doctor)</option>
                    <option value={Role.TECH}>Vet Technician</option>
                    <option value={Role.RECEPTION}>Reception Staff</option>
                    <option value={Role.ADMIN}>Administrator</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-500 font-bold">Specialty Focus</label>
                  <input 
                    type="text"
                    value={newStaffSpecialty}
                    onChange={(e) => setNewStaffSpecialty(e.target.value)}
                    placeholder="e.g. Dentistry, Admin"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500 font-bold">Secure Email Address</label>
                <input 
                  type="email"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  placeholder="e.g. marc@vethub.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#00647c]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddStaffOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-slate-600 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00647c] hover:bg-[#007f9d] rounded-lg font-bold text-white transition-colors cursor-pointer"
                >
                  Register Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIALOG 2: Schedule Shift Assignment */}
      {isQuickShiftOpen && (
        <div className="fixed inset-0 bg-[#0d1c2e]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="quick-shift-modal">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
            <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase text-[#0d1c2e] tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#00647c]" />
                <span>Schedule Shift Assignment</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setIsQuickShiftOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateShift} className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-slate-500 font-bold">Select Practitioner / Staff</label>
                <select
                  value={newShiftStaffId}
                  onChange={(e) => {
                    setNewShiftStaffId(e.target.value);
                    const matchedS = localStaff.find(s => s.id === e.target.value);
                    if (matchedS) {
                      setNewShiftRole(matchedS.role === Role.DVM ? 'Surgery' : matchedS.role === Role.TECH ? 'General' : 'Reception');
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none cursor-pointer font-bold"
                  required
                >
                  <option value="">-- Choose practitioner --</option>
                  {localStaff.map(st => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-500 font-bold">Roster Day</label>
                  <select 
                    value={newShiftDay}
                    onChange={(e) => setNewShiftDay(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none cursor-pointer"
                  >
                    {daysOfWeek.map((day, idx) => (
                      <option key={idx} value={idx}>{day.full} ({day.dateNum})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-500 font-bold">Assignment Type</label>
                  <input 
                    type="text"
                    value={newShiftRole}
                    onChange={(e) => setNewShiftRole(e.target.value)}
                    placeholder="e.g. Surgery, Lab, General"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-500 font-bold">Start Time</label>
                  <input 
                    type="time"
                    value={newShiftStart}
                    onChange={(e) => setNewShiftStart(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none cursor-pointer"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-500 font-bold">End Time</label>
                  <input 
                    type="time"
                    value={newShiftEnd}
                    onChange={(e) => setNewShiftEnd(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-none cursor-pointer"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsQuickShiftOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-slate-600 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00647c] hover:bg-[#007f9d] rounded-lg font-bold text-white transition-colors cursor-pointer"
                >
                  Assign Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Dynamic Feedback Toasts */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none" id="staff-feedback-toasts">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 p-4 rounded-xl shadow-xl border text-xs font-semibold tracking-wide transition-all duration-350 animate-slide-in ${
              toast.type === 'success' ? 'bg-[#00647c] border-cyan-500/30 text-white animate-pulse' :
              toast.type === 'error' ? 'bg-red-800 border-red-700 text-white' :
              'bg-slate-900 border-slate-700 text-slate-100'
            }`}
          >
            <span className="w-1.5 h-1.5 bg-white rounded-full" />
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
