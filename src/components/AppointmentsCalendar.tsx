import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Users, 
  User, Clock, AlertTriangle, Plus, Check, Trash2, X, Filter,
  Tag, Info, PlusCircle, CheckCircle, HelpCircle, Search
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
  const [petSearchQuery, setPetSearchQuery] = useState('');
  const [newStaffId, setNewStaffId] = useState(allStaff.filter(s => s.role === Role.DVM)[0]?.id || '');
  const [newDate, setNewDate] = useState('2026-05-21');
  const [newTime, setNewTime] = useState('10:00');
  const [newDuration, setNewDuration] = useState(30);
  const [newReason, setNewReason] = useState('Checkup');
  const [newCustomReasonDetail, setNewCustomReasonDetail] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Search Results computation for pet/client search bar
  const filteredPetsForSearch = useMemo(() => {
    if (!petSearchQuery) return [];
    const query = petSearchQuery.toLowerCase().trim();
    return pets.filter(p => {
      const client = clients.find(c => c.id === p.ownerId);
      const petNameMatch = p.name.toLowerCase().includes(query);
      const ownerNameMatch = client ? client.name.toLowerCase().includes(query) : false;
      const breedMatch = p.breed.toLowerCase().includes(query);
      const speciesMatch = p.species.toLowerCase().includes(query);
      return petNameMatch || ownerNameMatch || breedMatch || speciesMatch;
    }).slice(0, 5);
  }, [petSearchQuery, pets, clients]);

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
    if (l.includes('dent') || l.includes('tooth') || l.includes('scaling')) return 'Dental';
    if (l.includes('acute') || l.includes('limp') || l.includes('cough') || l.includes('emergency') || l.includes('wound') || l.includes('vomit')) return 'Emergency';
    return 'Checkup';
  };

  const getReasonColorClasses = (category: string) => {
    switch (category) {
      case 'Vaccination':
        return {
          bg: 'bg-indigo-50/60 border-indigo-200 text-indigo-950 font-medium',
          badge: 'bg-indigo-950 text-white',
          dot: 'bg-indigo-500',
          accent: 'border-indigo-500'
        };
      case 'Surgery':
        return {
          bg: 'bg-rose-50/60 border-rose-200 text-rose-950 font-medium',
          badge: 'bg-rose-950 text-white',
          dot: 'bg-rose-500',
          accent: 'border-rose-500'
        };
      case 'Dental':
        return {
          bg: 'bg-violet-50/60 border-violet-200 text-violet-950 font-medium',
          badge: 'bg-violet-950 text-white',
          dot: 'bg-violet-500',
          accent: 'border-violet-500'
        };
      case 'Emergency':
        return {
          bg: 'bg-amber-50/60 border-amber-200 text-amber-950 font-medium',
          badge: 'bg-amber-950 text-white',
          dot: 'bg-amber-500',
          accent: 'border-amber-500'
        };
      default: // Checkup
        return {
          bg: 'bg-[#F3F4F6] border-slate-200 text-slate-900 font-medium',
          badge: 'bg-black text-white',
          dot: 'bg-emerald-600',
          accent: 'border-emerald-600'
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
    <div className="flex flex-col lg:flex-row gap-6 bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden h-full min-h-[750px] font-sans">
      
      {/* 1. Left Sidebar Filter Drawer */}
      <aside className="w-full lg:w-72 bg-slate-50 border-r border-slate-100 p-6 flex flex-col gap-6" id="calendar-left-filters">
        
        {/* Dynamic Mini Picker */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-100/80 shadow-3xs">
          <div className="flex justify-between items-center mb-3.5">
            <h3 className="text-xs font-bold text-slate-800 tracking-wide font-medium">
              {monthYearLabel}
            </h3>
            <div className="flex gap-1 bg-slate-50 p-0.5 rounded-lg border border-slate-150/50">
              <button 
                onClick={handlePrevWeek}
                title="Previous Week"
                className="p-1 hover:bg-white text-slate-500 hover:text-slate-800 rounded-md transition-all cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={handleNextWeek}
                title="Next Week"
                className="p-1 hover:bg-white text-slate-500 hover:text-slate-800 rounded-md transition-all cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          
          {/* Mini week day picker grid representation */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-2 border-b border-dashed border-slate-100 pb-1.5 font-mono">
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
                  className={`text-[11px] h-7 w-7 inline-flex items-center justify-center rounded-lg font-bold cursor-pointer transition-all ${
                    isTodayStyle 
                      ? 'bg-primary text-white shadow-sm shadow-primary/20 scale-105' 
                      : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
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
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Duty Schedule
          </h3>
          <div className="space-y-1.5 bg-white p-3 rounded-2xl border border-slate-100/80 shadow-3xs" id="doctor-checklist">
            {doctorsList.map(doc => {
              const isChecked = selectedDoctors.includes(doc.id);
              return (
                <div 
                  key={doc.id} 
                  onClick={() => handleDoctorCheckboxChange(doc.id)}
                  className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                    isChecked 
                      ? 'bg-primary/5 border-primary/20' 
                      : 'bg-transparent border-transparent hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img 
                      src={doc.avatar} 
                      alt={doc.name} 
                      className="w-6.5 h-6.5 rounded-full object-cover shrink-0 border border-slate-100 shadow-3xs"
                      referrerPolicy="no-referrer"
                    />
                    <span className={`text-[11px] font-semibold truncate transition-colors duration-150 ${isChecked ? 'text-primary' : 'text-slate-600'}`}>
                      {doc.name}
                    </span>
                  </div>
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                    isChecked 
                      ? 'bg-primary border-primary text-white shadow-3xs' 
                      : 'border-slate-300 bg-white'
                  }`}>
                    {isChecked && <Check className="w-2.5 h-2.5 stroke-[3.5]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Service types / colors map */}
        <div>
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4 text-primary" />
            Service Filter
          </h3>
          <div className="space-y-1.5 bg-white p-3 rounded-2xl border border-slate-100/80 shadow-3xs">
            {['Checkup', 'Vaccination', 'Surgery', 'Dental', 'Emergency'].map(cat => {
              const isChecked = selectedReasonCategories.includes(cat);
              const colors = getReasonColorClasses(cat);
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryToggle(cat)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all cursor-pointer border ${
                    isChecked 
                      ? 'bg-slate-50/80 border-slate-200' 
                      : 'border-transparent opacity-60 hover:opacity-100 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 font-semibold text-slate-700">
                    <span className={`w-2 h-2 rounded-full ${colors.dot} ring-2 ring-white shadow-xs`} />
                    <span>{cat}</span>
                  </div>
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                    isChecked 
                      ? 'bg-primary border-primary text-white' 
                      : 'border-slate-200 bg-white'
                  }`}>
                    {isChecked && <Check className="w-2.5 h-2.5 stroke-[3.5]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Toggle to include cancelled */}
        <div className="mt-auto pt-4 border-t border-slate-200/60 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Show Cancelled</span>
          <button
            type="button"
            onClick={() => setShowCancelled(!showCancelled)}
            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              showCancelled ? 'bg-primary' : 'bg-slate-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                showCancelled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

      </aside>

      {/* 2. Right Main Calendar Area */}
      <main className="flex-1 flex flex-col bg-white overflow-hidden" id="calendar-board-root">
        
        {/* Weekly Header Controls Bar */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-205 shadow-3xs">
              <button 
                onClick={handleGoToToday}
                className="px-4 py-1.5 text-xs font-bold bg-white text-primary rounded-lg shadow-2xs hover:bg-slate-50 transition-all cursor-pointer active:scale-95"
              >
                Today
              </button>
              <div className="flex items-center bg-white rounded-lg border border-slate-200/50 p-0.5">
                <button 
                  onClick={handlePrevWeek}
                  className="p-1 px-1.5 hover:bg-slate-50 rounded-md transition-colors cursor-pointer"
                  title="Previous Week"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-600" />
                </button>
                <button 
                  onClick={handleNextWeek}
                  className="p-1 px-1.5 hover:bg-slate-50 rounded-md transition-colors cursor-pointer"
                  title="Next Week"
                >
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>
            
            <h2 className="text-sm md:text-base font-semibold text-slate-800 tracking-tight">
              {weekHeaderRangeLabel}
            </h2>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-emerald-55/75 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full text-[10px] font-bold text-emerald-800 uppercase tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE QUEUE SYNC</span>
            </div>
            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
              <span className="px-3 py-1 font-semibold bg-white text-primary rounded-lg shadow-3xs border border-slate-150">Week View</span>
            </div>
          </div>
        </div>

        {/* Scrollable Calendar Week Grid Board */}
        <div className="flex-1 overflow-y-auto relative bg-slate-50/15" style={{ maxHeight: '720px' }}>
          
          <div className="min-w-[700px] relative pb-10 select-none">
            
            {/* Header Line containing the days of the week */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-xs z-20 grid grid-cols-[65px_repeat(7,_1fr)] border-b border-slate-150 shadow-3xs h-18">
              <div className="border-r border-slate-150 bg-slate-50/10" /> {/* Spacer */}
              {weekDays.map((day, idx) => {
                const isToday = day.toDateString() === new Date().toDateString();
                return (
                  <div key={idx} className={`text-center py-2 flex flex-col justify-center border-r border-slate-100/50 last:border-r-0 relative ${isToday ? 'bg-primary/[0.01]' : ''}`}>
                    <p className={`text-[10px] uppercase tracking-wider font-bold ${isToday ? 'text-primary' : 'text-slate-400'}`}>
                      {getDayNameShort(day)}
                    </p>
                    {isToday ? (
                      <p className="text-sm font-bold bg-primary text-white h-7 w-7 rounded-lg flex items-center justify-center mx-auto mt-1 shadow-sm shadow-primary/20 scale-105">
                        {getDayFormatted(day)}
                      </p>
                    ) : (
                      <p className="text-base font-semibold text-slate-800 mt-1 leading-none">
                        {getDayFormatted(day)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Absolute-positioned and gridded schedule blocks */}
            <div className="relative mt-0 z-10 grid grid-cols-[65px_repeat(7,_1fr)]" style={{ height: '800px' }}>
              
              {/* Left-side Hour Indicators (8:00 to 18:00) */}
              <div className="col-span-1 border-r border-slate-150 bg-white flex flex-col select-none text-[10px] text-slate-405 font-medium divide-y divide-slate-100/50">
                {Array.from({ length: 11 }).map((_, hourOffset) => {
                  const hourLabel = 8 + hourOffset;
                  const ampm = hourLabel >= 12 ? 'PM' : 'AM';
                  const formattedHour = hourLabel > 12 ? hourLabel - 12 : hourLabel;
                  return (
                    <div key={hourOffset} className="h-20 text-right pr-3.5 pt-2 flex flex-col justify-start">
                      <span className="font-semibold text-slate-600">{String(formattedHour).padStart(2, '0')}:00</span>
                      <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wide">{ampm}</span>
                    </div>
                  );
                })}
              </div>

              {/* Day grid grids background pattern */}
              {Array.from({ length: 7 }).map((_, dayIdx) => (
                <div key={dayIdx} className="col-span-1 border-r border-slate-100/50 min-h-[800px] relative divide-y divide-slate-100/50 bg-white">
                  {Array.from({ length: 11 }).map((_, hourIdx) => (
                    <div 
                      key={hourIdx} 
                      className="h-20 border-b border-dashed border-slate-100/60 hover:bg-primary/[0.02]/30 hover:bg-slate-50 transition-all cursor-crosshair"
                      onClick={() => {
                        const targetDay = weekDays[dayIdx];
                        setNewDate(targetDay.toISOString().split('T')[0]);
                        const hour = 8 + hourIdx;
                        setNewTime(`${String(hour).padStart(2, '0')}:00`);
                        setNewPetId('');
                        setPetSearchQuery('');
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
                const leftPercentage = `calc(65px + (100% - 65px) / 7 * ${dayIndex})`;
                const widthPercentage = `calc((100% - 65px) / 7)`;

                const isSelected = selectedAppointmentId === app.id;

                return (
                  <div
                    key={app.id}
                    className="absolute p-1 z-20 cursor-pointer"
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
                      className={`h-full rounded-xl border border-slate-100 pr-2.5 pl-3 py-2 transition-all duration-300 overflow-hidden shadow-2xs hover:-translate-y-0.5 hover:shadow-xs flex flex-col justify-between ${colors.bg} ${colors.accent} border-l-[4px] ${
                        isSelected 
                          ? 'ring-2 ring-primary ring-offset-2 scale-[1.01] z-30 font-semibold shadow-md' 
                          : ''
                      } ${app.status === 'CANCELLED' ? 'line-through grayscale opacity-50' : ''}`}
                    >
                      <div>
                        <div className="flex justify-between items-start gap-1 overflow-hidden">
                          <span className="text-[11px] font-bold tracking-tight truncate text-slate-800">
                            {assignedPet ? assignedPet.name : 'Unknown Pet'}
                          </span>
                          <span className="text-[8.5px] font-semibold text-slate-500 shrink-0 font-mono bg-white/70 px-1 py-0.5 rounded border border-slate-150">
                            {startHourStr}
                          </span>
                        </div>
                        <p className="text-[9.5px] font-medium text-slate-650 truncate mt-1 leading-tight">
                          {app.reason}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[8px] mt-1.5 shrink-0 overflow-hidden font-sans text-slate-500">
                        <span className="truncate max-w-[80px] font-semibold">
                          👨‍⚕️ {assignedVet ? assignedVet.name.split(' ').pop() : 'DVM'}
                        </span>
                        <span className={`px-1.5 py-[1.5px] rounded-md text-[7px] font-bold text-white uppercase tracking-wider ${
                          app.status === 'CONFIRMED' ? 'bg-[#059669]' :
                          app.status === 'CHECKED_IN' ? 'bg-primary' :
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
          className="fixed inset-0 z-45 bg-black/35 backdrop-blur-3xs transition-all flex items-center justify-center"
          onClick={() => setSelectedAppointmentId(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] p-6 z-50 w-full max-w-sm font-sans relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-slate-100 text-black border border-slate-200">
                  <CalendarIcon className="w-5 h-5 text-black" />
                </span>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
                    Appointment Info
                  </h4>
                  <p className="text-[9px] text-slate-400 font-mono">
                    ID: {activePopoverAppointment.id}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAppointmentId(null)}
                className="text-slate-400 hover:text-black bg-slate-50 border border-[#E5E7EB] p-1 rounded-md text-xs font-bold cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {reschedulingId === activePopoverAppointment.id ? (
              /* Inline Edit Reschedule View */
              <form onSubmit={handleSaveReschedule} className="space-y-4 bg-[#FAFAFA] p-4 rounded-xl border border-[#E5E7EB]">
                <p className="text-[10px] font-bold text-black uppercase tracking-wider font-mono">
                  ⚡ Reschedule Time Slot
                </p>
                <div>
                  <label className="block text-[9px] font-bold uppercase text-slate-500 mb-1 font-mono">New Date</label>
                  <input 
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-[#E5E7EB] focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase text-slate-500 mb-1 font-mono">New Start Time</label>
                  <input 
                    type="time"
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-[#E5E7EB] focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white"
                    required
                  />
                </div>
                <div className="flex gap-2 p-1 border-t">
                  <button 
                    type="submit"
                    className="flex-1 bg-black hover:bg-black/90 text-white py-2 text-xs rounded-lg font-bold font-mono uppercase tracking-wider transition-all"
                  >
                    Confirm Change
                  </button>
                  <button 
                    type="button"
                    onClick={() => setReschedulingId(null)}
                    className="bg-white hover:bg-slate-50 border border-slate-250 text-slate-700 px-3 py-2 text-xs rounded-lg font-bold font-mono uppercase tracking-wider"
                  >
                    Back
                  </button>
                </div>
              </form>
            ) : (
              /* Regular Popover details state layout mirroring uploaded design precisely */
              <div className="space-y-4">
                
                {/* Pet Quick info Card */}
                <div className="flex items-center gap-3 bg-[#FAFAFA] p-3.5 rounded-xl border border-[#E5E7EB]">
                  <img 
                    src={activePopoverPet?.avatar || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=100'} 
                    alt={activePopoverPet?.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-200"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-none flex items-center gap-2">
                      {activePopoverPet?.name || 'Unknown Pet'}
                      <span className="text-[9px] bg-slate-100 text-slate-800 px-1.5 py-[1px] rounded font-mono font-bold tracking-wider uppercase border border-slate-200">
                        {activePopoverPet?.species}
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Breed: <span className="font-semibold text-slate-700">{activePopoverPet?.breed}</span> • {activePopoverPet?.age}
                    </p>
                  </div>
                </div>

                {/* Details list */}
                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Owner: <strong className="text-slate-800 font-semibold">{activePopoverClient?.name || 'Walk-in Client'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Time: <strong className="text-slate-800 font-semibold">
                      {new Date(activePopoverAppointment.dateTime).toLocaleTimeString('en-US', {
                        hour: 'numeric', minute: '2-digit'
                      })}
                    </strong> ({activePopoverAppointment.duration} mins)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Info className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Doctor: <strong className="text-slate-800 font-semibold">{activePopoverDoctor?.name || 'Unassigned'}</strong></span>
                  </div>

                  {activePopoverPet?.alertAllergies && activePopoverPet.alertAllergies.length > 0 && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-900 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-mono text-[9px] uppercase tracking-wider">Clinical Alerts:</strong>
                        <span>Allergies: {activePopoverPet.alertAllergies.join(', ')}</span>
                      </div>
                    </div>
                  )}

                  {activePopoverAppointment.notes && (
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[11px] italic text-slate-500">
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
                      className="w-full bg-black hover:bg-[#111827] active:scale-95 text-white py-2.5 rounded-lg font-bold text-xs uppercase hover:bg-cyan-700 transition-all col-span-2 shadow-xs cursor-pointer flex items-center justify-center gap-2 font-mono tracking-wider"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Check In Patient
                    </button>
                  )}

                  {activePopoverAppointment.status === 'CHECKED_IN' && (
                    <button 
                      onClick={() => handleStatusChange(activePopoverAppointment.id, 'IN_PROGRESS')}
                      className="w-full bg-black hover:bg-[#111827] active:scale-95 text-white py-2.5 rounded-lg font-bold text-xs uppercase transition-all col-span-2 shadow-xs cursor-pointer flex items-center justify-center gap-2 font-mono tracking-wider"
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
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-[#E5E7EB] py-2.5 rounded-lg font-bold text-xs uppercase cursor-pointer text-center font-mono tracking-wider transition-all"
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
                    className="border border-red-200 hover:bg-red-50 text-red-650 text-red-600 py-2.5 rounded-lg font-bold text-xs uppercase cursor-pointer text-center font-mono tracking-wider transition-all"
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-3xs flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] w-full max-w-md overflow-hidden flex flex-col">
            <div className="bg-[#FAFAFA] px-5 py-4 border-b border-[#E5E7EB] flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-2 font-mono">
                <PlusCircle className="w-4 h-4 text-black" />
                📅 Schedule Patient Appointment
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-black font-bold cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewAppointmentForm} className="p-5 space-y-4 text-xs">
              
              {/* Client & Pet Search Field */}
              <div className="relative">
                <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>1. Client &amp; Pet Search</span>
                  <span className="text-[9px] font-mono text-slate-400">Search instantly</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={petSearchQuery}
                    onChange={(e) => {
                      setPetSearchQuery(e.target.value);
                      if (!e.target.value) {
                        setNewPetId('');
                      }
                    }}
                    placeholder="Type client name, pet name, or breed..."
                    className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-[#E5E7EB] focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white"
                  />
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-[11px] text-slate-400" />
                </div>

                {/* Live suggestion list */}
                {filteredPetsForSearch.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto divide-y divide-slate-100">
                    {filteredPetsForSearch.map(p => {
                      const client = clients.find(c => c.id === p.ownerId);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setNewPetId(p.id);
                            setPetSearchQuery(`${p.name} (Owner: ${client ? client.name : 'Unknown'})`);
                          }}
                          className="w-full text-left px-3 py-2.5 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer text-xs"
                        >
                          <div>
                            <p className="font-bold text-slate-800">{p.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{p.species} • {p.breed}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] bg-slate-100 text-slate-700 font-mono px-1.5 py-0.5 rounded border border-slate-200">
                              Owner: {client ? client.name : 'Walk-in'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Selected Pet Details Badge */}
                {newPetId && (
                  <div className="mt-1.5 flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    <span>
                      Selected Asset: <strong>{pets.find(p => p.id === newPetId)?.name || 'Unknown'}</strong> 
                      {(() => {
                        const pet = pets.find(p => p.id === newPetId);
                        const owner = pet ? clients.find(c => c.id === pet.ownerId) : null;
                        return owner ? ` (Owner: ${owner.name})` : '';
                      })()}
                    </span>
                  </div>
                )}
              </div>

              {/* Doctors Select list */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  2. Assigned DVM (Veterinarian Consultant)
                </label>
                <select
                  value={newStaffId}
                  onChange={(e) => setNewStaffId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#E5E7EB] bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
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
                    className="w-full text-xs p-2.5 rounded-xl border border-[#E5E7EB] bg-white text-slate-700 focus:outline-none"
                    required
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Start Time</label>
                  <input 
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#E5E7EB] bg-white text-slate-700 focus:outline-none"
                    required
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Duration</label>
                  <select
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#E5E7EB] bg-white text-slate-700 focus:outline-none"
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
                  className="w-full text-xs p-2.5 rounded-xl border border-[#E5E7EB] bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                >
                  <option value="Checkup">General Checkup &amp; Routine Wellness</option>
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
                    className="w-full text-xs mt-2 p-2.5 rounded-xl border border-[#E5E7EB] focus:outline-none"
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
                  className="w-full text-xs p-2.5 rounded-xl border border-[#E5E7EB] h-16 resize-none focus:outline-none"
                />
              </div>

              {/* Submit panel */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-[#E5E7EB] hover:bg-slate-50 text-slate-700 uppercase font-bold text-[10px] rounded-lg tracking-wider font-mono transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!newPetId}
                  className="px-5 py-2 bg-black text-white rounded-lg hover:bg-[#111827] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all uppercase font-bold text-[10px] tracking-wider font-mono"
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
        onClick={() => {
          setNewPetId('');
          setPetSearchQuery('');
          setShowAddModal(true);
        }}
        className="fixed bottom-8 right-8 bg-black hover:bg-[#111827] text-white h-14 px-5 rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center gap-2.5 z-40 group cursor-pointer border-2 border-white font-mono uppercase tracking-wider"
        title="Schedule Live Appointment"
      >
        <Plus className="w-5 h-5 shrink-0" />
        <span className="font-bold text-xs">Book Slot</span>
      </button>

    </div>
  );
};
