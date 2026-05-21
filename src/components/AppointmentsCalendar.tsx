import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Users, 
  User, Clock, AlertTriangle, Plus, Check, Trash2, X, Filter,
  Tag, Info, PlusCircle, CheckCircle, HelpCircle
} from 'lucide-react';
import { Appointment, Pet, Client, Staff, Role } from '../types';

interface AppointmentsCalendarProps {
  appointments: Appointment[];
  pets: Pet[];
  clients: Client[];
  allStaff: Staff[];
  onUpdateAppointment: (updated: Appointment) => void;
  onAddAppointment: (newApp: Appointment) => void;
}

export const AppointmentsCalendar: React.FC<AppointmentsCalendarProps> = ({
  appointments,
  pets,
  clients,
  allStaff,
  onUpdateAppointment,
  onAddAppointment,
}) => {
  // Calendar Navigation State (centered around March 11-17, 2024 to match mock unless user transitions)
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    // Default to the week containing May 21, 2026 to align with mock and today's date
    const d = new Date('2026-05-18'); // May 18, 2026 is Monday
    return d;
  });

  // Sidebar Filter States
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>(() => {
    const dvms = allStaff.filter(s => s.role === Role.DVM).map(s => s.id);
    return dvms;
  });
  const [selectedReasonCategories, setSelectedReasonCategories] = useState<string[]>([
    'Checkup', 'Vaccination', 'Surgery', 'Dental', 'Emergency'
  ]);
  const [showCancelled, setShowCancelled] = useState(false);

  // Active appointment detail modal state
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  
  // Reschedule Form State
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('2026-05-21');
  const [rescheduleTime, setRescheduleTime] = useState('09:30');

  // New Appointment Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPetId, setNewPetId] = useState(pets[0]?.id || '');
  const [newStaffId, setNewStaffId] = useState(allStaff.filter(s => s.role === Role.DVM)[0]?.id || '');
  const [newDate, setNewDate] = useState('2026-05-21');
  const [newTime, setNewTime] = useState('10:00');
  const [newDuration, setNewDuration] = useState(30);
  const [newReason, setNewReason] = useState('Checkup');
  const [newCustomReasonDetail, setNewCustomReasonDetail] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Auxiliary Helper lists
  const doctorsList = useMemo(() => {
    return allStaff.filter(s => s.role === Role.DVM || s.role === Role.OWNER || s.role === Role.MANAGER);
  }, [allStaff]);

  // Generate 7 days of the selected week
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentWeekStart);
      day.setDate(currentWeekStart.getDate() + i);
      days.push(day);
    }
    return days;
  }, [currentWeekStart]);

  const monthYearLabel = useMemo(() => {
    return currentWeekStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [currentWeekStart]);

  const weekHeaderRangeLabel = useMemo(() => {
    const start = currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${start} – ${end}`;
  }, [currentWeekStart, weekDays]);

  // Navigate Weeks
  const handlePrevWeek = () => {
    const prev = new Date(currentWeekStart);
    prev.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(next);
  };

  const handleGoToToday = () => {
    // Align with mock date week
    setCurrentWeekStart(new Date('2026-05-18'));
  };

  // Helper: get the category group (Checkup, Vaccination, Surgery, Dental, Emergency)
  const getCategoryFromReason = (reason: string): 'Checkup' | 'Vaccination' | 'Surgery' | 'Dental' | 'Emergency' => {
    const l = reason.toLowerCase();
    if (l.includes('vacc') || l.includes('booster') || l.includes('rabies') || l.includes('shot')) return 'Vaccination';
    if (l.includes('surgery') || l.includes('spay') || l.includes('neuter') || l.includes('op')) return 'Surgery';
    if (l.includes('dent') || l.includes('牙') || l.includes('scaling')) return 'Dental';
    if (l.includes('acute') || l.includes('limp') || l.includes('cough') || l.includes('emergency') || l.includes('wound') || l.includes('vomit')) return 'Emergency';
    return 'Checkup';
  };

  const getReasonColorClasses = (category: string) => {
    switch (category) {
      case 'Vaccination':
        return {
          bg: 'bg-blue-50 border-blue-500 text-blue-700',
          badge: 'bg-blue-600',
          dot: 'bg-blue-500',
          accent: 'border-blue-500'
        };
      case 'Surgery':
        return {
          bg: 'bg-red-50 border-red-500 text-red-700',
          badge: 'bg-red-600',
          dot: 'bg-red-500',
          accent: 'border-red-500'
        };
      case 'Dental':
        return {
          bg: 'bg-purple-50 border-purple-500 text-purple-700',
          badge: 'bg-purple-600',
          dot: 'bg-purple-500',
          accent: 'border-purple-500'
        };
      case 'Emergency':
        return {
          bg: 'bg-orange-50 border-orange-500 text-orange-700',
          badge: 'bg-orange-600',
          dot: 'bg-orange-500',
          accent: 'border-orange-500'
        };
      default: // Checkup
        return {
          bg: 'bg-emerald-50 border-emerald-500 text-emerald-700',
          badge: 'bg-emerald-600',
          dot: 'bg-emerald-500',
          accent: 'border-emerald-500'
        };
    }
  };

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter(app => {
      // 1. Filter by Doctor
      if (!selectedDoctors.includes(app.staffId)) return false;

      // 2. Filter by Category
      const cat = getCategoryFromReason(app.reason);
      if (!selectedReasonCategories.includes(cat)) return false;

      // 3. Filter by Cancelled
      if (!showCancelled && app.status === 'CANCELLED') return false;

      return true;
    });
  }, [appointments, selectedDoctors, selectedReasonCategories, showCancelled]);

  // Group appointments by date string ('YYYY-MM-DD') for easier rendering if needed,
  // or compile exact absolute style layout coordinates relative to days
  const appointmentsToRenderCoords = useMemo(() => {
    return filteredAppointments.map(app => {
      const appDate = new Date(app.dateTime);
      const appDateStr = appDate.toISOString().split('T')[0];
      
      // Find day index within standard week (Mon-Sun)
      const dateIndex = weekDays.findIndex(day => {
        const dStr = day.toISOString().split('T')[0];
        return dStr === appDateStr;
      });

      if (dateIndex === -1) return null; // Outside current visible week scope

      const hours = appDate.getHours();
      const minutes = appDate.getMinutes();
      
      // Calculate top position. Base: 08:00 AM. Row is 80px per hour (1.33px per minute).
      const baseHour = 8;
      const timeDiffInHours = (hours + minutes / 60) - baseHour;
      
      // If appointment is scheduled earlier than 8 AM, clamp to top. If later than 6 PM, clamp to max.
      const topOffset = Math.max(0, timeDiffInHours * 80);
      const height = (app.duration / 60) * 80;

      return {
        app,
        dayIndex: dateIndex,
        top: topOffset,
        height: Math.max(40, height), // Ensure minimum look density
        category: getCategoryFromReason(app.reason),
      };
    }).filter(Boolean) as { app: Appointment; dayIndex: number; top: number; height: number; category: string }[];
  }, [filteredAppointments, weekDays]);

  // Handle doctors selection toggles
  const handleDoctorCheckboxChange = (docId: string) => {
    if (selectedDoctors.includes(docId)) {
      if (selectedDoctors.length > 1) {
        setSelectedDoctors(selectedDoctors.filter(id => id !== docId));
      }
    } else {
      setSelectedDoctors([...selectedDoctors, docId]);
    }
  };

  // Handle service categories selection toggles
  const handleCategoryToggle = (category: string) => {
    if (selectedReasonCategories.includes(category)) {
      setSelectedReasonCategories(selectedReasonCategories.filter(c => c !== category));
    } else {
      setSelectedReasonCategories([...selectedReasonCategories, category]);
    }
  };

  const activePopoverAppointment = useMemo(() => {
    if (!selectedAppointmentId) return null;
    return appointments.find(a => a.id === selectedAppointmentId) || null;
  }, [selectedAppointmentId, appointments]);

  const activePopoverPet = useMemo(() => {
    if (!activePopoverAppointment) return null;
    return pets.find(p => p.id === activePopoverAppointment.petId) || null;
  }, [activePopoverAppointment, pets]);

  const activePopoverClient = useMemo(() => {
    if (!activePopoverAppointment) return null;
    return clients.find(c => c.id === activePopoverAppointment.clientId) || null;
  }, [activePopoverAppointment, clients]);

  const activePopoverDoctor = useMemo(() => {
    if (!activePopoverAppointment) return null;
    return allStaff.find(s => s.id === activePopoverAppointment.staffId) || null;
  }, [activePopoverAppointment, allStaff]);

  // Change Appointment Status handlers
  const handleStatusChange = (aptId: string, nextStatus: Appointment['status']) => {
    const apt = appointments.find(a => a.id === aptId);
    if (apt) {
      const updated = { ...apt, status: nextStatus };
      onUpdateAppointment(updated);
      
      // Sync pet status if checking in or completing
      if (nextStatus === 'CHECKED_IN') {
        const pet = pets.find(p => p.id === apt.petId);
        if (pet) {
          // Trigger optional simulation feedback
          console.log(`Synced pet ${pet.name} status to Checked In`);
        }
      }
    }
  };

  // Reschedule Trigger handler
  const handleSaveReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingId) return;

    const apt = appointments.find(a => a.id === reschedulingId);
    if (apt) {
      // Re-compile dateTime string
      const fullIso = `${rescheduleDate}T${rescheduleTime}:00Z`;
      const updated = { ...apt, dateTime: fullIso, status: 'CONFIRMED' as const };
      onUpdateAppointment(updated);
      setReschedulingId(null);
      setSelectedAppointmentId(null);
    }
  };

  // Form Submit for new appointment
  const handleCreateNewAppointmentForm = (e: React.FormEvent) => {
    e.preventDefault();
    const compoundReason = newReason === 'Other' ? newCustomReasonDetail : newReason;
    
    const petObj = pets.find(p => p.id === newPetId);
    if (!petObj) return;

    const newAppObj: Appointment = {
      id: `apt-${Date.now()}`,
      petId: newPetId,
      clientId: petObj.ownerId,
      staffId: newStaffId,
      dateTime: `${newDate}T${newTime}:00Z`,
      duration: Number(newDuration),
      reason: compoundReason || 'Routine Checkup',
      status: 'CONFIRMED',
      notes: newNotes,
    };

    onAddAppointment(newAppObj);
    setShowAddModal(false);
    
    // Reset inputs
    setNewNotes('');
    setNewCustomReasonDetail('');
  };

  const getDayFormatted = (day: Date) => {
    return day.toLocaleDateString('en-US', { day: 'numeric' });
  };

  const getDayNameShort = (day: Date) => {
    return day.toLocaleDateString('en-US', { weekday: 'short' });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 bg-white rounded-xl border border-outline-variant/60 shadow-xs overflow-hidden h-full min-h-[700px]">
      
      {/* 1. Left Sidebar Filter Drawer */}
      <aside className="w-full lg:w-72 bg-[#eff4ff] border-r border-[#d5e3fc] p-5 flex flex-col gap-6" id="calendar-left-filters">
        
        {/* Dynamic Mini Picker */}
        <div className="bg-white p-4 rounded-xl border border-[#dce9ff]">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold text-[#0d1c2e] uppercase tracking-wide">
              {monthYearLabel}
            </h3>
            <div className="flex gap-1">
              <button 
                onClick={handlePrevWeek}
                title="Previous Week"
                className="p-1 hover:bg-[#e6eeff] text-slate-600 rounded-lg transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={handleNextWeek}
                title="Next Week"
                className="p-1 hover:bg-[#e6eeff] text-slate-600 rounded-lg transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Mini week day picker grid representation */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-[#3e484d] mb-2 border-b pb-1.5">
            <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {weekDays.map((day, idx) => {
              const isTodayStyle = day.toDateString() === new Date().toDateString();
              return (
                <button
                  key={idx}
                  onClick={() => {
                    const Monday = new Date(day);
                    Monday.setDate(Monday.getDate() - ((Monday.getDay() + 6) % 7));
                    setCurrentWeekStart(Monday);
                  }}
                  className={`text-[11px] p-1 rounded-full font-bold cursor-pointer transition-all ${
                    isTodayStyle 
                      ? 'bg-[#00647c] text-white' 
                      : 'hover:bg-[#e6eeff] text-[#0d1c2e]'
                  }`}
                >
                  {getDayFormatted(day)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Doctor Filters Selection list */}
        <div>
          <h3 className="text-xs font-bold text-[#0d1c2e] uppercase tracking-wider mb-2.5 flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-[#00647c]" />
            Doctors Duty Checklist
          </h3>
          <div className="space-y-2.5 bg-white p-3.5 rounded-xl border border-[#dce9ff]" id="doctor-checklist">
            {doctorsList.map(doc => {
              const isChecked = selectedDoctors.includes(doc.id);
              return (
                <label key={doc.id} className="flex items-center gap-2.5 cursor-pointer group">
                  <input 
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleDoctorCheckboxChange(doc.id)}
                    className="rounded border-[#6e797e] text-[#00647c] focus:ring-[#00647c] w-3.5 h-3.5 transition-all cursor-pointer"
                  />
                  <div className="flex items-center gap-2">
                    <img 
                      src={doc.avatar} 
                      alt={doc.name} 
                      className="w-5 h-5 rounded-full object-cover shrink-0 ring-1 ring-[#cbd5e1]"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-xs font-bold text-slate-700 group-hover:text-[#00647c] transition-colors truncate max-w-[140px]">
                      {doc.name}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Service types / colors map */}
        <div>
          <h3 className="text-xs font-bold text-[#0d1c2e] uppercase tracking-wider mb-2.5 flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-[#00647c]" />
            Filter Service Category
          </h3>
          <div className="space-y-2 bg-white p-3.5 rounded-xl border border-[#dce9ff]">
            {['Checkup', 'Vaccination', 'Surgery', 'Dental', 'Emergency'].map(cat => {
              const isChecked = selectedReasonCategories.includes(cat);
              const colors = getReasonColorClasses(cat);
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryToggle(cat)}
                  className={`w-full flex items-center justify-between p-1.5 rounded-lg text-left text-xs transition-all duration-150 cursor-pointer ${
                    isChecked ? 'bg-slate-50 border border-slate-200' : 'opacity-40 hover:opacity-75'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${colors.dot} ring-2 ring-white shadow-xs`} />
                    <span className="font-semibold text-slate-800">{cat}</span>
                  </div>
                  {isChecked && <Check className="w-3.5 h-3.5 text-[#00647c]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Toggle to include cancelled */}
        <div className="mt-auto pt-4 border-t border-[#d5e3fc] flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#3e484d]">Show Cancelled</span>
          <button
            type="button"
            onClick={() => setShowCancelled(!showCancelled)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              showCancelled ? 'bg-[#00647c]' : 'bg-[#bdc8ce]'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                showCancelled ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

      </aside>

      {/* 2. Right Main Calendar Area */}
      <main className="flex-1 flex flex-col bg-white overflow-hidden" id="calendar-board-root">
        
        {/* Weekly Header Controls Bar */}
        <div className="px-6 py-4 border-b border-outline-variant/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg border">
              <button 
                onClick={handleGoToToday}
                className="px-3.5 py-1 text-xs font-bold bg-white text-[#00647c] rounded-md shadow-xs hover:bg-slate-50 transition-all cursor-pointer"
              >
                Today
              </button>
              <div className="flex">
                <button 
                  onClick={handlePrevWeek}
                  className="p-1 hover:bg-white rounded transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-700" />
                </button>
                <button 
                  onClick={handleNextWeek}
                  className="p-1 hover:bg-white rounded transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4 text-slate-700" />
                </button>
              </div>
            </div>
            
            <h2 className="text-sm md:text-base font-bold text-[#0d1c2e] uppercase tracking-wide">
              {weekHeaderRangeLabel}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-[#e6eeff] text-primary px-2 py-1 rounded-md font-bold font-mono border">
              LIVE CLINIC QUEUE
            </span>
            <div className="flex bg-slate-100 p-1 rounded-lg border text-xs">
              <span className="px-2.5 py-1 font-bold bg-white text-[#00647c] rounded shadow-xs">Week View</span>
            </div>
          </div>
        </div>

        {/* Scrollable Calendar Week Grid Board */}
        <div className="flex-1 overflow-y-auto relative bg-slate-50/40" style={{ maxHeight: '700px' }}>
          
          <div className="min-w-[700px] relative pb-10 select-none">
            
            {/* Header Line containing the days of the week */}
            <div className="sticky top-0 bg-white z-20 grid grid-cols-[60px_repeat(7,_1fr)] border-b border-outline-variant/60 shadow-2xs h-18">
              <div className="border-r bg-slate-50/60" /> {/* Spacer */}
              {weekDays.map((day, idx) => {
                const isToday = day.toDateString() === new Date().toDateString();
                return (
                  <div key={idx} className={`text-center py-2 flex flex-col justify-center border-r border-[#e2e8f0] last:border-r-0 ${isToday ? 'bg-[#eff4ff]/30' : ''}`}>
                    <p className={`text-[9px] uppercase tracking-wider font-bold ${isToday ? 'text-[#00647c] font-black' : 'text-slate-400'}`}>
                      {getDayNameShort(day)}
                    </p>
                    <p className={`text-base font-bold leading-none mt-1 ${isToday ? 'text-[#00647c]' : 'text-slate-800'}`}>
                      {getDayFormatted(day)}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Absolute-positioned and gridded schedule blocks */}
            <div className="relative mt-0 z-10 grid grid-cols-[60px_repeat(7,_1fr)]" style={{ height: '800px' }}>
              
              {/* Left-side Hour Indicators (8:00 to 18:00) */}
              <div className="col-span-1 border-r bg-white flex flex-col select-none text-[10px] text-slate-400 font-bold divide-y divide-[#e2e8f0]/40">
                {Array.from({ length: 11 }).map((_, hourOffset) => {
                  const hourLabel = 8 + hourOffset;
                  const ampm = hourLabel >= 12 ? 'PM' : 'AM';
                  const formattedHour = hourLabel > 12 ? hourLabel - 12 : hourLabel;
                  return (
                    <div key={hourOffset} className="h-20 text-right pr-2 pt-1 flex flex-col justify-start">
                      <span>{String(formattedHour).padStart(2, '0')}:00</span>
                      <span className="text-[8px] opacity-75">{ampm}</span>
                    </div>
                  );
                })}
              </div>

              {/* Day grid grids background pattern */}
              {Array.from({ length: 7 }).map((_, dayIdx) => (
                <div key={dayIdx} className="col-span-1 border-r border-slate-200/50 min-h-[800px] relative divide-y divide-[#e2e8f0]/30">
                  {Array.from({ length: 11 }).map((_, hourIdx) => (
                    <div 
                      key={hourIdx} 
                      className="h-20 border-b border-dashed border-[#e2e8f0]/30 hover:bg-[#e6eeff]/20 transition-all cursor-crosshair"
                      onClick={() => {
                        const targetDay = weekDays[dayIdx];
                        setNewDate(targetDay.toISOString().split('T')[0]);
                        const hour = 8 + hourIdx;
                        setNewTime(`${String(hour).padStart(2, '0')}:00`);
                        setShowAddModal(true);
                      }}
                      title="Click directly to log appointment at this day slot"
                    />
                  ))}
                </div>
              ))}

              {/* Dynamic Coordinate Mapped Appointment Cards */}
              {appointmentsToRenderCoords.map(({ app, dayIndex, top, height, category }) => {
                const colors = getReasonColorClasses(category);
                const assignedPet = pets.find(p => p.id === app.petId);
                const assignedVet = allStaff.find(s => s.id === app.staffId);
                
                // Formulate hour tag
                const startHourStr = new Date(app.dateTime).toLocaleTimeString('en-US', {
                  hour: '2-digit', minute: '2-digit', hour12: false
                });

                // Calculate relative percentage offset from Left and width of dynamic columns
                const leftPercentage = `calc(60px + (100% - 60px) / 7 * ${dayIndex})`;
                const widthPercentage = `calc((100% - 60px) / 7)`;

                const isSelected = selectedAppointmentId === app.id;

                return (
                  <div
                    key={app.id}
                    className="absolute p-0.5 z-20 cursor-pointer"
                    style={{
                      left: leftPercentage,
                      width: widthPercentage,
                      top: `${top}px`,
                      height: `${height}px`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAppointmentId(app.id);
                    }}
                  >
                    <div 
                      className={`h-full rounded-r-lg border-l-4 p-2 transition-all duration-200 overflow-hidden shadow-2xs hover:scale-[1.01] hover:shadow-xs flex flex-col justify-between ${colors.bg} ${
                        isSelected 
                          ? 'ring-2 ring-[#00647c] ring-offset-1 scale-[1.01] z-30 font-bold shadow-md' 
                          : ''
                      } ${app.status === 'CANCELLED' ? 'line-through grayscale opacity-50' : ''}`}
                    >
                      <div>
                        <div className="flex justify-between items-start gap-1 overflow-hidden">
                          <span className="text-[10px] font-black truncate text-[#0d1c2e]">
                            {assignedPet ? assignedPet.name : 'Unknown Pet'}
                          </span>
                          <span className="text-[8px] font-bold opacity-80 shrink-0 font-mono">
                            {startHourStr}
                          </span>
                        </div>
                        <p className="text-[9px] font-bold opacity-80 truncate leading-tight mt-0.5">
                          {app.reason}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[8px] mt-1 shrink-0 overflow-hidden">
                        <span className="truncate opacity-90 max-w-[80px]">
                          👨‍⚕️ {assignedVet ? assignedVet.name : 'Assigned DVM'}
                        </span>
                        <span className={`px-1 py-[1px] rounded-[3px] text-[7px] font-bold text-white uppercase ${
                          app.status === 'CONFIRMED' ? 'bg-emerald-600' :
                          app.status === 'CHECKED_IN' ? 'bg-blue-600' :
                          app.status === 'IN_PROGRESS' ? 'bg-amber-600' :
                          app.status === 'COMPLETED' ? 'bg-slate-500' : 'bg-red-600'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

            </div>

          </div>
        </div>

      </main>

      {/* 3. Floating Action Details Tooltip Popover if card is highlighted */}
      {selectedAppointmentId && activePopoverAppointment && (
        <div 
          className="fixed inset-0 z-40 bg-black/10 backdrop-blur-3xs"
          onClick={() => setSelectedAppointmentId(null)}
        >
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl border border-outline-variant p-5 z-50 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-[#eff4ff] text-primary">
                  <CalendarIcon className="w-5 h-5 text-[#00647c]" />
                </span>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Appointment Details
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono">
                    ID: {activePopoverAppointment.id}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAppointmentId(null)}
                className="text-slate-400 hover:text-slate-700 bg-slate-50 border p-1 rounded-md text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {reschedulingId === activePopoverAppointment.id ? (
              /* Inline Edit Reschedule View */
              <form onSubmit={handleSaveReschedule} className="space-y-3 bg-[#eff4ff] p-3 rounded-lg border">
                <p className="text-[10px] font-bold text-[#00647c] uppercase">
                  ⚡ Reschedule Time Slot
                </p>
                <div>
                  <label className="block text-[8px] font-bold uppercase text-slate-500 mb-1">New Date</label>
                  <input 
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full text-xs p-1.5 rounded border border-[#cbd5e1] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-bold uppercase text-slate-500 mb-1">New Start Time</label>
                  <input 
                    type="time"
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="w-full text-xs p-1.5 rounded border border-[#cbd5e1] focus:outline-none"
                    required
                  />
                </div>
                <div className="flex gap-1.5">
                  <button 
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-1 text-xs rounded font-bold uppercase"
                  >
                    Confirm Change
                  </button>
                  <button 
                    type="button"
                    onClick={() => setReschedulingId(null)}
                    className="bg-slate-400 text-white px-3 py-1 text-xs rounded font-bold"
                  >
                    Back
                  </button>
                </div>
              </form>
            ) : (
              /* Regular Popover details state layout mirroring uploaded design precisely */
              <div className="space-y-4">
                
                {/* Pet Quick info Card */}
                <div className="flex items-center gap-3 bg-[#f8f9ff] p-3 rounded-xl border border-slate-100">
                  <img 
                    src={activePopoverPet?.avatar || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=100'} 
                    alt={activePopoverPet?.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-100"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 leading-none flex items-center gap-2">
                      {activePopoverPet?.name || 'Unknown Pet'}
                      <span className="text-[10px] bg-sky-100 text-[#00647c] px-1.5 py-[1px] rounded font-bold">
                        {activePopoverPet?.species}
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Breed: <span className="font-semibold">{activePopoverPet?.breed}</span> • {activePopoverPet?.age}
                    </p>
                  </div>
                </div>

                {/* Details list */}
                <div className="space-y-2.5 text-xs text-slate-705">
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Owner: <strong className="text-slate-800">{activePopoverClient?.name || 'Walk-in Client'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Time: <strong className="text-slate-800">
                      {new Date(activePopoverAppointment.dateTime).toLocaleTimeString('en-US', {
                        hour: 'numeric', minute: '2-digit'
                      })}
                    </strong> ({activePopoverAppointment.duration} mins)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Info className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Doctor: <strong className="text-slate-800">{activePopoverDoctor?.name || 'Unassigned'}</strong></span>
                  </div>

                  {activePopoverPet?.alertAllergies && activePopoverPet.alertAllergies.length > 0 && (
                    <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-lg text-[11px] text-amber-900 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        <strong className="block">CRITICAL EHR LABELS:</strong>
                        <span>Allergies: {activePopoverPet.alertAllergies.join(', ')}</span>
                      </div>
                    </div>
                  )}

                  {activePopoverAppointment.notes && (
                    <div className="p-2 bg-slate-50 rounded-lg text-[10px] italic text-slate-500">
                      <strong>Notes:</strong> "{activePopoverAppointment.notes}"
                    </div>
                  )}
                </div>

                {/* Multi-action controller bar */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t">
                  
                  {/* Status Dependent Direct actions */}
                  {activePopoverAppointment.status !== 'CHECKED_IN' && activePopoverAppointment.status !== 'COMPLETED' && (
                    <button 
                      onClick={() => handleStatusChange(activePopoverAppointment.id, 'CHECKED_IN')}
                      className="w-full bg-[#00647c] text-white py-2 rounded-lg font-bold text-xs uppercase hover:bg-cyan-700 transition-colors col-span-2 shadow-xs cursor-pointer flex items-center justify-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Check In Patient
                    </button>
                  )}

                  {activePopoverAppointment.status === 'CHECKED_IN' && (
                    <button 
                      onClick={() => handleStatusChange(activePopoverAppointment.id, 'IN_PROGRESS')}
                      className="w-full bg-amber-500 text-white py-2 rounded-lg font-bold text-xs uppercase hover:bg-amber-600 transition-colors col-span-2 shadow-xs cursor-pointer flex items-center justify-center gap-1"
                    >
                      🧪 Escalate to Treatment
                    </button>
                  )}

                  <button 
                    onClick={() => {
                      const dt = new Date(activePopoverAppointment.dateTime);
                      setRescheduleDate(dt.toISOString().split('T')[0]);
                      setRescheduleTime(dt.toTimeString().split(' ')[0].substring(0, 5));
                      setReschedulingId(activePopoverAppointment.id);
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg font-bold text-xs uppercase transition-colors cursor-pointer"
                  >
                    Reschedule
                  </button>

                  <button 
                    onClick={() => {
                      if (confirm('Cancel this scheduled appointment?')) {
                        handleStatusChange(activePopoverAppointment.id, 'CANCELLED');
                        setSelectedAppointmentId(null);
                      }
                    }}
                    className="border border-red-350 text-red-650 text-red-700 hover:bg-red-50 py-2 rounded-lg font-bold text-xs uppercase transition-colors cursor-pointer"
                  >
                    Cancel Slot
                  </button>
                </div>

              </div>
            )}
            
          </div>
        </div>
      )}

      {/* 4. Beautiful New Appointment Popup/Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-3xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-outline-variant/60 w-full max-w-md overflow-hidden flex flex-col">
            <div className="bg-[#eff4ff] px-5 py-4 border-b flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wide text-[#0d1c2e] flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-[#00647c]" />
                📅 Schedule New Appointment Slot
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewAppointmentForm} className="p-5 space-y-3.5 text-xs">
              
              {/* Pet Selection */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  1. Choose Pet &amp; Co-Owner Chart
                </label>
                <select
                  value={newPetId}
                  onChange={(e) => setNewPetId(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border focus:ring-[#00647c] focus:border-[#00647c]"
                  required
                >
                  {pets.map(p => {
                    const client = clients.find(c => c.id === p.ownerId);
                    return (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.species} – {p.breed}) owner: {client ? client.name : 'Unknown'}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Doctors Select list */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  2. Assigned DVM (Veterinarian Consultant)
                </label>
                <select
                  value={newStaffId}
                  onChange={(e) => setNewStaffId(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border focus:ring-[#00647c] focus:border-[#00647c]"
                  required
                >
                  {doctorsList.map(doc => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} ({doc.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Slot Schedule and duration grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Date</label>
                  <input 
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border"
                    required
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Start Time</label>
                  <input 
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border"
                    required
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Duration</label>
                  <select
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full text-xs p-2 rounded-lg border"
                  >
                    <option value={15}>15m Slot</option>
                    <option value={30}>30m Slot</option>
                    <option value={45}>45m Slot</option>
                    <option value={60}>1h Slot</option>
                    <option value={120}>2h Slot (Surgical)</option>
                  </select>
                </div>
              </div>

              {/* Services Selector with Custom trigger */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  3. Primary Consultation Indicator
                </label>
                <select
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border focus:ring-[#00647c] focus:border-[#00647c]"
                >
                  <option value="Checkup">General Checkup &amp; Routine Wellnes</option>
                  <option value="Vaccination">Vaccination and Booster Boost</option>
                  <option value="Surgery">Ovariosalpingectomy / Surgery Spay Prep</option>
                  <option value="Dental">Dental Scaling &amp; Abscess Scaling</option>
                  <option value="Emergency">Ambulance Emergency Walk-in Urgent</option>
                  <option value="Other">Custom Reason Description...</option>
                </select>

                {newReason === 'Other' && (
                  <input 
                    type="text"
                    value={newCustomReasonDetail}
                    onChange={(e) => setNewCustomReasonDetail(e.target.value)}
                    placeholder="Enter custom medical consultation symptoms..."
                    className="w-full text-xs mt-2 p-2 rounded-lg border"
                    required
                  />
                )}
              </div>

              {/* Notes block */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Clinical Intake Comments</label>
                <textarea 
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Requests weight counseling, stress indicators..."
                  className="w-full text-xs p-2 rounded-lg border h-16 resize-none"
                />
              </div>

              {/* Submit panel */}
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-slate-50 text-slate-700 uppercase font-bold text-[10px]"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-[#00647c] text-white rounded-lg hover:bg-cyan-700 transition-colors uppercase font-bold text-[10px]"
                >
                  Book Appointment
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Primary Floating Action "+ New" Button inside Week Calendar Container */}
      <button 
        type="button"
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-8 right-8 bg-[#00647c] text-white h-14 px-5 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2.5 z-40 group cursor-pointer border-2 border-white"
        title="Schedule Live Appointment"
      >
        <Plus className="w-5 h-5 shrink-0" />
        <span className="font-bold text-xs uppercase tracking-wider">Book Slot</span>
      </button>

    </div>
  );
};
