/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Heart, 
  ShieldAlert, 
  BadgeInfo, 
  Plus, 
  Info, 
  CheckCircle, 
  Dog, 
  Cat, 
  Eye, 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Check,
  Edit2,
  Filter
} from 'lucide-react';
import { Pet, Client, MedicalRecord, Staff } from '../types';

interface PetListProps {
  pets: Pet[];
  clients: Client[];
  medicalRecords: MedicalRecord[];
  allStaff: Staff[];
  onAddNewPet: (pet: Pet, client: Client) => void;
  onEditMedicalRecord?: (record: MedicalRecord, petName: string) => void;
  onUpdatePet?: (pet: Pet) => void;
  onUpdateClient?: (client: Client) => void;
}

export default function PetList({
  pets,
  clients,
  medicalRecords,
  allStaff,
  onAddNewPet,
  onEditMedicalRecord,
  onUpdatePet,
  onUpdateClient
}: PetListProps) {
  // Navigation & filtering state
  const [activeSubTab, setActiveSubTab] = useState<'patients' | 'clients'>('patients');
  const [searchTerm, setSearchTerm] = useState('');
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Selected Patients state
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  // Selected Client Profiles state
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedPetInProfileId, setSelectedPetInProfileId] = useState<string | null>(null);
  const [showAddPetToOwnerForm, setShowAddPetToOwnerForm] = useState(false);

  // Form State for "Create Pet & Client"
  const [newPetName, setNewPetName] = useState('');
  const [newPetSpecies, setNewPetSpecies] = useState<'Dog' | 'Cat' | 'Bird' | 'Rabbit' | 'Exotic'>('Dog');
  const [newPetBreed, setNewPetBreed] = useState('');
  const [newPetAge, setNewPetAge] = useState('');
  const [newPetWeight, setNewPetWeight] = useState(5.0);
  const [newPetGender, setNewPetGender] = useState<'Male' | 'Female' | 'Neutered Male' | 'Spayed Female'>('Neutered Male');
  const [newPetAllergies, setNewPetAllergies] = useState('');
  
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');

  // Form State for "Add Pet to Existing Client"
  const [ownerPetName, setOwnerPetName] = useState('');
  const [ownerPetSpecies, setOwnerPetSpecies] = useState<'Dog' | 'Cat' | 'Bird' | 'Rabbit' | 'Exotic'>('Dog');
  const [ownerPetBreed, setOwnerPetBreed] = useState('');
  const [ownerPetAge, setOwnerPetAge] = useState('');
  const [ownerPetWeight, setOwnerPetWeight] = useState(5.0);
  const [ownerPetGender, setOwnerPetGender] = useState<'Male' | 'Female' | 'Neutered Male' | 'Spayed Female'>('Neutered Male');
  const [ownerPetAllergies, setOwnerPetAllergies] = useState('');

  // Patient Filters
  const [speciesFilter, setSpeciesFilter] = useState<'All' | 'Dog' | 'Cat' | 'Bird' | 'Rabbit' | 'Exotic'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Checked In' | 'In Surgery' | 'In Treatment' | 'Discharged'>('All');
  const [allergyFilter, setAllergyFilter] = useState<'All' | 'Has Allergies' | 'No Allergies'>('All');

  // Pet Profile Edit States
  const [isEditingPet, setIsEditingPet] = useState(false);
  const [editPetName, setEditPetName] = useState('');
  const [editPetSpecies, setEditPetSpecies] = useState<'Dog' | 'Cat' | 'Bird' | 'Rabbit' | 'Exotic'>('Dog');
  const [editPetBreed, setEditPetBreed] = useState('');
  const [editPetAge, setEditPetAge] = useState('');
  const [editPetWeight, setEditPetWeight] = useState(5.0);
  const [editPetGender, setEditPetGender] = useState<'Male' | 'Female' | 'Neutered Male' | 'Spayed Female'>('Neutered Male');
  const [editPetStatus, setEditPetStatus] = useState<'Checked In' | 'In Surgery' | 'In Treatment' | 'Discharged'>('Checked In');
  const [editPetAllergies, setEditPetAllergies] = useState('');

  // Client Profile Edit States
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [editClientName, setEditClientName] = useState('');
  const [editClientEmail, setEditClientEmail] = useState('');
  const [editClientPhone, setEditClientPhone] = useState('');
  const [editClientAddress, setEditClientAddress] = useState('');
  const [editClientMembership, setEditClientMembership] = useState<'Standard' | 'Gold' | 'Platinum'>('Standard');

  // Sync state for edit modes
  const handleStartEditPet = (pet: Pet) => {
    setEditPetName(pet.name);
    setEditPetSpecies(pet.species);
    setEditPetBreed(pet.breed);
    setEditPetAge(pet.age);
    setEditPetWeight(pet.weight);
    setEditPetGender(pet.gender);
    setEditPetStatus(pet.status);
    setEditPetAllergies(pet.alertAllergies.join(', '));
    setIsEditingPet(true);
  };

  const handleStartEditClient = (client: Client) => {
    setEditClientName(client.name);
    setEditClientEmail(client.email);
    setEditClientPhone(client.phone);
    setEditClientAddress(client.address);
    setEditClientMembership(client.membershipType);
    setIsEditingClient(true);
  };

  // Set initial selected entities on load
  useEffect(() => {
    if (pets.length > 0 && selectedPetId === null) {
      setSelectedPetId(pets[0].id);
    }
  }, [pets]);

  useEffect(() => {
    if (clients.length > 0 && selectedClientId === null) {
      setSelectedClientId(clients[0].id);
    }
  }, [clients]);

  // Sync selected pet in profile when client selection changes
  useEffect(() => {
    if (selectedClientId) {
      const clientPets = pets.filter(p => p.ownerId === selectedClientId);
      if (clientPets.length > 0) {
        setSelectedPetInProfileId(clientPets[0].id);
      } else {
        setSelectedPetInProfileId(null);
      }
    }
  }, [selectedClientId, pets]);

  // Reset active editing modes when switching selections
  useEffect(() => {
    setIsEditingPet(false);
  }, [selectedPetId]);

  useEffect(() => {
    setIsEditingClient(false);
  }, [selectedClientId]);

  // Filtering list calculators
  const filteredPets = pets.filter((pet) => {
    const owner = clients.find(c => c.id === pet.ownerId);
    const searchString = `${pet.name} ${pet.breed} ${owner?.name || ''}`.toLowerCase();
    
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    const matchesSpecies = speciesFilter === 'All' || pet.species === speciesFilter;
    const matchesStatus = statusFilter === 'All' || pet.status === statusFilter;
    const matchesAllergies = allergyFilter === 'All' 
      ? true 
      : allergyFilter === 'Has Allergies' 
        ? pet.alertAllergies.length > 0 
        : pet.alertAllergies.length === 0;

    return matchesSearch && matchesSpecies && matchesStatus && matchesAllergies;
  });

  const filteredClients = clients.filter((client) => {
    const clientPetsList = pets.filter(p => p.ownerId === client.id).map(p => p.name).join(' ');
    const searchString = `${client.name} ${client.email} ${client.phone} ${client.address} ${clientPetsList}`.toLowerCase();
    return searchString.includes(clientSearchTerm.toLowerCase());
  });

  // Current selections
  const selectedPet = pets.find(p => p.id === selectedPetId);
  const selectedOwnerOfPet = selectedPet ? clients.find(c => c.id === selectedPet.ownerId) : null;
  const petRecords = selectedPet ? medicalRecords.filter(mr => mr.petId === selectedPet.id) : [];

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const selectedClientPets = selectedClient ? pets.filter(p => p.ownerId === selectedClient.id) : [];
  const selectedPetInProfile = pets.find(p => p.id === selectedPetInProfileId);
  const selectedPetInProfileRecords = selectedPetInProfile 
    ? medicalRecords.filter(mr => mr.petId === selectedPetInProfile.id) 
    : [];

  const handleCreatePetAndClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPetName || !newClientName) return;

    const clientId = `client-new-${Date.now()}`;
    const newClient: Client = {
      id: clientId,
      name: newClientName,
      email: newClientEmail || 'client@vethub-sandbox.com',
      phone: newClientPhone || '555-0100',
      address: newClientAddress || 'Springfield Clinic Vicinity',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      joinedDate: new Date().toISOString().split('T')[0],
      membershipType: 'Standard'
    };

    const allergiesArr = newPetAllergies
      ? newPetAllergies.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const newPet: Pet = {
      id: `pet-new-${Date.now()}`,
      name: newPetName,
      species: newPetSpecies,
      breed: newPetBreed || 'Mixed Breed',
      age: newPetAge || 'Under 1 year',
      weight: Number(newPetWeight) || 5.0,
      gender: newPetGender,
      status: 'Checked In',
      ownerId: clientId,
      alertAllergies: allergiesArr,
      avatar: newPetSpecies === 'Dog'
        ? 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=200&auto=format&fit=crop&q=80'
    };

    onAddNewPet(newPet, newClient);
    setSelectedPetId(newPet.id);
    setSelectedClientId(clientId);
    
    // Reset inputs
    setNewPetName('');
    setNewPetBreed('');
    setNewPetAge('');
    setNewPetWeight(5.0);
    setNewPetAllergies('');
    setNewClientName('');
    setNewClientEmail('');
    setNewClientPhone('');
    setNewClientAddress('');
    
    setShowAddForm(false);
  };

  const handleAddPetToExistingClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !ownerPetName) return;

    const currentClientObj = clients.find(c => c.id === selectedClientId)!;

    const allergiesArr = ownerPetAllergies
      ? ownerPetAllergies.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const newPet: Pet = {
      id: `pet-new-${Date.now()}`,
      name: ownerPetName,
      species: ownerPetSpecies,
      breed: ownerPetBreed || 'Mixed Breed',
      age: ownerPetAge || 'Under 1 year',
      weight: Number(ownerPetWeight) || 5.0,
      gender: ownerPetGender,
      status: 'Checked In',
      ownerId: selectedClientId,
      alertAllergies: allergiesArr,
      avatar: ownerPetSpecies === 'Dog'
        ? 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=200&auto=format&fit=crop&q=80'
    };

    onAddNewPet(newPet, currentClientObj);
    setSelectedPetInProfileId(newPet.id);
    setSelectedPetId(newPet.id);
    
    // Reset owner pet inputs
    setOwnerPetName('');
    setOwnerPetBreed('');
    setOwnerPetAge('');
    setOwnerPetWeight(5.0);
    setOwnerPetAllergies('');
    
    setShowAddPetToOwnerForm(false);
  };

  const handleSavePetEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPet) return;
    const allergiesArr = editPetAllergies
      ? editPetAllergies.split(',').map(s => s.trim()).filter(Boolean)
      : [];
    const updated: Pet = {
      ...selectedPet,
      name: editPetName,
      species: editPetSpecies,
      breed: editPetBreed,
      age: editPetAge,
      weight: Number(editPetWeight) || 5.0,
      gender: editPetGender,
      status: editPetStatus,
      alertAllergies: allergiesArr
    };
    if (onUpdatePet) {
      onUpdatePet(updated);
    }
    setIsEditingPet(false);
  };

  const handleSaveClientEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    const updated: Client = {
      ...selectedClient,
      name: editClientName,
      email: editClientEmail,
      phone: editClientPhone,
      address: editClientAddress,
      membershipType: editClientMembership
    };
    if (onUpdateClient) {
      onUpdateClient(updated);
    }
    setIsEditingClient(false);
  };

  const statusColors = (status: string) => {
    switch (status) {
      case 'Checked In':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'In Surgery':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'In Treatment':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Discharged':
        return 'bg-[#eff4ff] text-[#3e484d] border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // EHR Record Renderer helper to keep tabs clean & visually identical
  const renderEhrRecords = (recordsToRender: MedicalRecord[], targetPetName: string) => {
    if (recordsToRender.length === 0) {
      return (
        <div className="bg-white border rounded-xl p-8 text-center text-xs text-[#545d62]">
          No compiled EHR notes available for {targetPetName}. Book an appointment to initialize a clinical record chart!
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {recordsToRender.map((record) => {
          const treatingVet = allStaff.find(s => s.id === record.dvmId);
          return (
            <div key={record.id} className="bg-white border border-outline-variant/60 rounded-xl p-5 shadow-xs space-y-4">
              
              {/* Record Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/50 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] bg-[#dbe4ea] text-[#3e484d] font-bold px-2 py-0.5 rounded font-mono uppercase">
                    SOAP ENTRY
                  </span>
                  <span className="text-xs font-bold text-[#3e484d] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 inline text-slate-400" />
                    {record.date}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-right">
                    <span className="text-[10px] text-[#545d62] font-semibold leading-none">Treating Surgeon:</span>
                    <span className="text-[10px] font-bold text-primary leading-none">{treatingVet?.name || 'Unassigned'}</span>
                  </div>
                  
                  {/* Live Edit Action */}
                  {onEditMedicalRecord && (
                    <button
                      type="button"
                      onClick={() => onEditMedicalRecord(record, targetPetName)}
                      className="px-2.5 py-1 hover:bg-[#e6eeff] border border-outline-variant hover:border-primary text-primary transition-all rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> View / Edit Notes
                    </button>
                  )}
                </div>
              </div>

              {/* Diagnostic SOAP Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-[#f8f9ff] rounded-lg">
                  <span className="text-[9px] uppercase font-bold text-primary tracking-wider font-mono">S - Subjective Symptoms</span>
                  <p className="text-xs text-[#0d1c2e] mt-1 whitespace-pre-wrap">{record.soap.subjective}</p>
                </div>
                <div className="p-3 bg-[#f8f9ff] rounded-lg">
                  <span className="text-[9px] uppercase font-bold text-primary tracking-wider font-mono">O - Objective Vitals</span>
                  <p className="text-xs text-[#0d1c2e] mt-1 whitespace-pre-wrap">{record.soap.objective}</p>
                </div>
                <div className="p-3 bg-[#f8f9ff] rounded-lg">
                  <span className="text-[9px] uppercase font-bold text-primary tracking-wider font-mono">A - Assessment Info</span>
                  <p className="text-xs text-[#0d1c2e] mt-1 whitespace-pre-wrap">{record.soap.assessment}</p>
                </div>
                <div className="p-3 bg-[#f8f9ff] rounded-lg">
                  <span className="text-[9px] uppercase font-bold text-primary tracking-wider font-mono">P - Treatment Plan</span>
                  <p className="text-xs text-[#0d1c2e] mt-1 whitespace-pre-wrap">{record.soap.plan}</p>
                </div>
              </div>

              {/* Completed signed Prescriptions */}
              {record.prescriptions.length > 0 && (
                <div className="border border-outline-variant/50 rounded-lg p-3 bg-emerald-50/20">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide">📦 Dispatched Medications</span>
                  <div className="mt-2 space-y-1.5">
                    {record.prescriptions.map((rx) => (
                      <div key={rx.id} className="text-xs text-[#0d1c2e]">
                        • <strong className="text-emerald-700">{rx.medicationName}</strong>: {rx.dosage} ({rx.frequency}) for {rx.duration}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vaccine records history */}
              {record.vaccinations && record.vaccinations.length > 0 && (
                <div className="border border-[#dce9ff] rounded-lg p-3 bg-sky-50/20">
                  <span className="text-[10px] font-bold text-sky-850 uppercase tracking-wide flex items-center gap-1.5 font-sans">
                    💉 Verified Immunizations &amp; Vaccine Boosters
                  </span>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {record.vaccinations.map((vac) => (
                      <div key={vac.id} className="text-xs bg-white border border-[#e6eeff]/70 p-2.5 rounded-lg flex justify-between items-center shadow-3xs">
                        <div>
                          <strong className="text-slate-800 font-bold block">{vac.name}</strong>
                          <div className="text-[10px] text-slate-500 font-medium font-mono">
                            Administered: {vac.date} | dose: {vac.dosage || '1.0 mL'}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`inline-block text-[8px] font-black uppercase px-2 py-0.5 rounded font-mono ${
                            vac.status === 'Administered' ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' :
                            vac.status === 'Overdue' ? 'text-red-700 bg-red-50 border border-red-100 animate-pulse' :
                            'text-amber-700 bg-amber-50 border border-amber-100'
                          }`}>
                            {vac.status}
                          </span>
                          <div className="text-[9px] text-[#545d62] font-semibold mt-1 font-mono">
                            Next Due: {vac.nextDueDate}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Imaging uploads */}
              {record.images.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-[#545d62] uppercase tracking-wide">📷 Attached Dental Orthopantomogram</span>
                  <div className="grid grid-cols-2 gap-4">
                    {record.images.map((img) => (
                      <div key={img.id} className="border border-outline-variant rounded-lg p-2.5 bg-white space-y-1.5">
                        <img
                          src={img.url}
                          alt={img.name}
                          className="w-full h-32 object-cover rounded border"
                        />
                        <div className="text-[10px]">
                          <h5 className="font-bold text-[#0d1c2e]">{img.name}</h5>
                          {img.notes && <p className="text-[#545d62] italic text-[9px]">{img.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6" id="clients-and-pets-view-wrapper">
      
      {/* View Mode Switcher Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-outline-variant/60 rounded-xl p-4 shadow-2xs">
        <div>
          <h2 className="text-sm font-bold text-[#0d1c2e] uppercase tracking-wide">
            📁 Select Database View Style
          </h2>
          <p className="text-[11px] text-[#545d62] mt-0.5">
            Switch between a pet patient records queue or a full context client account profile ledger.
          </p>
        </div>
        
        <div className="flex bg-[#eff4ff] p-1 rounded-lg border w-full sm:w-auto" id="subtab-selectors">
          <button
            onClick={() => {
              setActiveSubTab('patients');
              setShowAddForm(false);
              setShowAddPetToOwnerForm(false);
            }}
            className={`flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-md transition-all cursor-pointer w-full sm:w-auto ${
              activeSubTab === 'patients'
                ? 'bg-white text-[#00647c] shadow-xs border border-slate-100'
                : 'text-[#545d62] hover:text-[#0d1c2e]'
            }`}
          >
            <Dog className="w-4 h-4" />
            Patient Registry ({pets.length})
          </button>
          <button
            onClick={() => {
              setActiveSubTab('clients');
              setShowAddForm(false);
              setShowAddPetToOwnerForm(false);
            }}
            className={`flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-md transition-all cursor-pointer w-full sm:w-auto ${
              activeSubTab === 'clients'
                ? 'bg-white text-[#00647c] shadow-xs border border-slate-100'
                : 'text-[#545d62] hover:text-[#0d1c2e]'
            }`}
          >
            <Users className="w-4 h-4" />
            Client Profiles ({clients.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="database-split">
        
        {/* ==================================== */}
        {/* LEFT COLUMN: REGISTRY 목록 & 검색 BAR */}
        {/* ==================================== */}
        <div className="space-y-4">
          
          {/* Patients Mode Left Panel */}
          {activeSubTab === 'patients' && (
            <>
              {/* Search header & action */}
              <div className="bg-white border border-outline-variant/60 rounded-xl p-4 shadow-xs flex flex-col gap-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-[#0d1c2e] uppercase tracking-wide">
                    🐾 Patient Records
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddForm(!showAddForm);
                      setShowAddPetToOwnerForm(false);
                    }}
                    className="flex items-center gap-1 bg-[#00647c] text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-lg hover:bg-cyan-700 active:scale-95 cursor-pointer transition-all shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New Record
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search dog, cat, or human..."
                    className="w-full text-xs pl-9 pr-4 py-2 border border-outline-variant rounded-lg bg-[#eff4ff]/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00647c]/20 focus:border-[#00647c] transition-all"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>

                {/* Patient Records Quick Filters Panel */}
                <div className="grid grid-cols-3 gap-1.5 pt-1.5 border-t border-slate-150">
                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-[#545d62] font-black mb-1 font-mono">Species</label>
                    <select
                      value={speciesFilter}
                      onChange={(e: any) => setSpeciesFilter(e.target.value)}
                      className="w-full text-[10px] py-1 px-1.5 border border-outline-variant bg-[#f8f9ff] rounded-md focus:outline-none font-bold cursor-pointer text-[#0d1c2e]"
                    >
                      <option value="All">🐾 All</option>
                      <option value="Dog">Dog</option>
                      <option value="Cat">Cat</option>
                      <option value="Bird">Bird</option>
                      <option value="Rabbit">Rabbit</option>
                      <option value="Exotic">Exotic</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-[#545d62] font-black mb-1 font-mono">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e: any) => setStatusFilter(e.target.value)}
                      className="w-full text-[10px] py-1 px-1.5 border border-outline-variant bg-[#f8f9ff] rounded-md focus:outline-none font-bold cursor-pointer text-[#0d1c2e]"
                    >
                      <option value="All">🚦 All</option>
                      <option value="Checked In">Checked In</option>
                      <option value="In Surgery">In Surgery</option>
                      <option value="In Treatment">In Treatment</option>
                      <option value="Discharged">Discharged</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase tracking-wider text-[#545d62] font-black mb-1 font-mono">Allergies</label>
                    <select
                      value={allergyFilter}
                      onChange={(e: any) => setAllergyFilter(e.target.value)}
                      className="w-full text-[10px] py-1 px-1.5 border border-outline-variant bg-[#f8f9ff] rounded-md focus:outline-none font-bold cursor-pointer text-[#0d1c2e]"
                    >
                      <option value="All">⚠️ All</option>
                      <option value="Has Allergies">Has Risks</option>
                      <option value="No Allergies">No Risks</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* List of active matches */}
              <div className="space-y-2 max-h-[calc(100vh-270px)] overflow-y-auto pr-1">
                {filteredPets.length === 0 ? (
                  <div className="bg-white rounded-xl p-6 border border-dashed text-center text-xs text-[#545d62]">
                    No patients match your search.
                  </div>
                ) : (
                  filteredPets.map((pet) => {
                    const petOwner = clients.find(c => c.id === pet.ownerId);
                    const isActive = selectedPetId === pet.id;
                    return (
                      <button
                        key={pet.id}
                        onClick={() => {
                          setSelectedPetId(pet.id);
                          setShowAddForm(false);
                          setShowAddPetToOwnerForm(false);
                        }}
                        className={`w-full flex items-center justify-between p-3 border rounded-xl text-left transition-all hover:translate-x-0.5 cursor-pointer ${
                          isActive
                            ? 'bg-gradient-to-r from-[#e6eeff]/60 to-[#eff4ff]/30 border-[#00647c] shadow-xs'
                            : 'bg-white border-outline-variant/60 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <img
                            src={pet.avatar}
                            alt={pet.name}
                            className="w-11 h-11 rounded-xl object-cover shrink-0 border"
                          />
                          <div className="overflow-hidden">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-[#0d1c2e] truncate">{pet.name}</p>
                              {pet.alertAllergies.length > 0 && (
                                <span className="w-2 h-2 rounded-full bg-red-650" title="Critical Allergies!" />
                              )}
                            </div>
                            <p className="text-[10px] text-[#545d62] truncate">
                              {pet.gender} • {pet.breed}
                            </p>
                            <p className="text-[9px] text-[#6e797e] font-mono mt-0.5 truncate">
                              Owner: {petOwner?.name || 'Unassigned'}
                            </p>
                          </div>
                        </div>

                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 scale-95 ${statusColors(pet.status)}`}>
                          {pet.status}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </>
          )}

          {/* Clients Mode Left Panel */}
          {activeSubTab === 'clients' && (
            <>
              {/* Search header */}
              <div className="bg-white border border-outline-variant/60 rounded-xl p-4 shadow-xs flex flex-col gap-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-[#0d1c2e] uppercase tracking-wide text-primary">
                    👤 Registered Clients
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddForm(true);
                      setShowAddPetToOwnerForm(false);
                    }}
                    className="flex items-center gap-1 bg-[#00647c] text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-lg hover:bg-cyan-700 active:scale-95 cursor-pointer transition-all shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New Client
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={clientSearchTerm}
                    onChange={(e) => setClientSearchTerm(e.target.value)}
                    placeholder="Search name, phone, email..."
                    className="w-full text-xs pl-9 pr-4 py-2 border border-outline-variant rounded-lg bg-[#eff4ff]/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00647c]/20 focus:border-[#00647c] transition-all"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* List of client matches */}
              <div className="space-y-2 max-h-[calc(100vh-270px)] overflow-y-auto pr-1">
                {filteredClients.length === 0 ? (
                  <div className="bg-white rounded-xl p-6 border border-dashed text-center text-xs text-[#545d62]">
                    No clients match your parameters.
                  </div>
                ) : (
                  filteredClients.map((client) => {
                    const isSelected = selectedClientId === client.id;
                    const clientPets = pets.filter((p) => p.ownerId === client.id);
                    return (
                      <button
                        key={client.id}
                        onClick={() => {
                          setSelectedClientId(client.id);
                          setShowAddForm(false);
                          setShowAddPetToOwnerForm(false);
                        }}
                        className={`w-full flex items-center justify-between p-3 border rounded-xl text-left transition-all hover:translate-x-0.5 cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-[#e6eeff]/60 to-[#eff4ff]/30 border-[#00647c] shadow-xs'
                            : 'bg-white border-outline-variant/60 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <img
                            src={client.avatar}
                            alt={client.name}
                            className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-250"
                          />
                          <div className="overflow-hidden">
                            <h4 className="text-xs font-bold text-[#0d1c2e] truncate">{client.name}</h4>
                            <p className="text-[9px] text-[#545d62] truncate">📞 {client.phone}</p>
                            <p className="text-[9px] text-[#6e797e] font-mono truncate">{client.email}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className={`text-[8px] tracking-tight font-extrabold px-1.5 py-0.5 rounded border ${
                            client.membershipType === 'Platinum' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            client.membershipType === 'Gold' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {client.membershipType}
                          </span>
                          <span className="text-[8px] text-primary bg-[#eff4ff] px-1.5 py-0.5 rounded font-black uppercase">
                            {clientPets.length} {clientPets.length === 1 ? 'Pet' : 'Pets'}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </>
          )}

        </div>

        {/* ==================================== */}
        {/* RIGHT COLUMN: 상세 EHR VIEW OR CLIENT PROFILE VIEW */}
        {/* ==================================== */}
        <div className="lg:col-span-2 space-y-4">
          
          {showAddForm ? (
            /* GENERAL ADD PATIENT + CLIENT FORM */
            <div className="bg-white border border-outline-variant/60 rounded-xl p-6 shadow-xs animate-fade-in">
              <h3 className="text-sm font-bold text-[#00647c] uppercase tracking-wide border-b border-outline-variant/50 pb-3 mb-5">
                Add New Patient Record and Owner Profile
              </h3>
              
              <form onSubmit={handleCreatePetAndClient} className="space-y-6">
                {/* Pet details subdivision */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-[#00647c] uppercase font-mono tracking-wider flex items-center gap-1.5 bg-[#eff4ff] px-2.5 py-1 rounded w-fit">
                    🐾 Patient Details
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[#545d62] mb-1">Pet Name *</label>
                      <input
                        type="text"
                        required
                        value={newPetName}
                        onChange={(e) => setNewPetName(e.target.value)}
                        placeholder="e.g. Max"
                        className="w-full text-xs p-2.5 border border-outline-variant rounded-lg focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#545d62] mb-1">Species *</label>
                      <select
                        value={newPetSpecies}
                        onChange={(e) => setNewPetSpecies(e.target.value as any)}
                        className="w-full text-xs p-2.5 border border-outline-variant rounded-lg focus:outline-none"
                      >
                        <option value="Dog">Dog</option>
                        <option value="Cat">Cat</option>
                        <option value="Bird">Bird</option>
                        <option value="Rabbit">Rabbit</option>
                        <option value="Exotic">Exotic</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#545d62] mb-1">Breed</label>
                      <input
                        type="text"
                        value={newPetBreed}
                        onChange={(e) => setNewPetBreed(e.target.value)}
                        placeholder="e.g. Golden Retriever"
                        className="w-full text-xs p-2.5 border border-outline-variant rounded-lg focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#545d62] mb-1">Age</label>
                      <input
                        type="text"
                        value={newPetAge}
                        onChange={(e) => setNewPetAge(e.target.value)}
                        placeholder="e.g. 2 years 4 months"
                        className="w-full text-xs p-2.5 border border-outline-variant rounded-lg focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#545d62] mb-1">Weight (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={newPetWeight}
                        onChange={(e) => setNewPetWeight(Number(e.target.value))}
                        className="w-full text-xs p-2.5 border border-outline-variant rounded-lg focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#545d62] mb-1">Gender</label>
                      <select
                        value={newPetGender}
                        onChange={(e) => setNewPetGender(e.target.value as any)}
                        className="w-full text-xs p-2.5 border border-outline-variant rounded-lg focus:outline-none"
                      >
                        <option value="Neutered Male">Neutered Male</option>
                        <option value="Spayed Female">Spayed Female</option>
                        <option value="Male">Intact Male</option>
                        <option value="Female">Intact Female</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#545d62] mb-1">Allergies (comma separated)</label>
                    <input
                      type="text"
                      value={newPetAllergies}
                      onChange={(e) => setNewPetAllergies(e.target.value)}
                      placeholder="e.g. Penicillin, Soy derivatives"
                      className="w-full text-xs p-2.5 border border-outline-variant rounded-lg focus:outline-none"
                    />
                  </div>
                </div>

                {/* Owner details subdivision */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-bold text-[#00647c] uppercase font-mono tracking-wider flex items-center gap-1.5 bg-[#eff4ff] px-2.5 py-1 rounded w-fit">
                    👤 Primary Owner Details
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-[#545d62] mb-1">Owner Full Name *</label>
                      <input
                        type="text"
                        required
                        value={newClientName}
                        onChange={(e) => setNewClientName(e.target.value)}
                        placeholder="Sarah Connor"
                        className="w-full text-xs p-2.5 border border-outline-variant rounded-lg focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#545d62] mb-1">Phone Number *</label>
                      <input
                        type="text"
                        required
                        value={newClientPhone}
                        onChange={(e) => setNewClientPhone(e.target.value)}
                        placeholder="555-0144"
                        className="w-full text-xs p-2.5 border border-outline-variant rounded-lg focus:outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-[#545d62] mb-1">Email Address</label>
                      <input
                        type="email"
                        value={newClientEmail}
                        onChange={(e) => setNewClientEmail(e.target.value)}
                        placeholder="sconnor@cyberdyne.net"
                        className="w-full text-xs p-2.5 border border-outline-variant rounded-lg focus:outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-[#545d62] mb-1">Residential Address</label>
                      <input
                        type="text"
                        value={newClientAddress}
                        onChange={(e) => setNewClientAddress(e.target.value)}
                        placeholder="e.g. 120 Rogue Highway, Los Angeles"
                        className="w-full text-xs p-2.5 border border-outline-variant rounded-lg focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 border border-outline-variant text-[#0d1c2e] text-xs font-semibold rounded-lg hover:bg-[#f8f9ff] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#00647c] text-white text-xs font-bold rounded-lg hover:bg-cyan-700 cursor-pointer shadow-sm transition-all"
                  >
                    Save Patient &amp; Owner Profile
                  </button>
                </div>
              </form>
            </div>
          ) : activeSubTab === 'patients' ? (
            
            /* ========================================================= */
            /* PATIENTS TAB: SINGLE SELECTED PET DETAILED EHR VIEWER     */
            /* ========================================================= */
            selectedPet ? (
              <div className="space-y-6 animate-fade-in">
                
                {/* Header medical profile box / Edit Mode Switcher */}
                {isEditingPet ? (
                  <div className="bg-white border border-outline-variant/60 rounded-xl p-6 shadow-xs animate-fade-in">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-5">
                      <h3 className="text-xs font-black text-[#00647c] uppercase tracking-wide flex items-center gap-1.5">
                        ✏️ Edit Patient Profile: {selectedPet.name}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsEditingPet(false)}
                        className="text-xs text-slate-400 hover:text-slate-700 font-bold"
                      >
                        ✕ Cancel
                      </button>
                    </div>

                    <form onSubmit={handleSavePetEdit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-[#545d62] mb-1">Pet Name *</label>
                          <input
                            type="text"
                            required
                            value={editPetName}
                            onChange={(e) => setEditPetName(e.target.value)}
                            className="w-full text-xs p-2.5 border border-outline-variant rounded-lg focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[#545d62] mb-1">Species *</label>
                          <select
                            value={editPetSpecies}
                            onChange={(e) => setEditPetSpecies(e.target.value as any)}
                            className="w-full text-xs p-2.5 border border-outline-variant rounded-lg focus:outline-none"
                          >
                            <option value="Dog">Dog</option>
                            <option value="Cat">Cat</option>
                            <option value="Bird">Bird</option>
                            <option value="Rabbit">Rabbit</option>
                            <option value="Exotic">Exotic</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[#545d62] mb-1">Breed</label>
                          <input
                            type="text"
                            value={editPetBreed}
                            onChange={(e) => setEditPetBreed(e.target.value)}
                            className="w-full text-xs p-2.5 border border-outline-variant rounded-lg focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[#545d62] mb-1">Age</label>
                          <input
                            type="text"
                            value={editPetAge}
                            onChange={(e) => setEditPetAge(e.target.value)}
                            className="w-full text-xs p-2.5 border border-outline-variant rounded-lg focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[#545d62] mb-1">Weight (kg)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={editPetWeight}
                            onChange={(e) => setEditPetWeight(Number(e.target.value))}
                            className="w-full text-xs p-2.5 border border-outline-variant rounded-lg focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[#545d62] mb-1">Sex / Gender</label>
                          <select
                            value={editPetGender}
                            onChange={(e) => setEditPetGender(e.target.value as any)}
                            className="w-full text-xs p-2.5 border border-outline-variant rounded-lg focus:outline-none"
                          >
                            <option value="Neutered Male">Neutered Male</option>
                            <option value="Spayed Female">Spayed Female</option>
                            <option value="Male">Intact Male</option>
                            <option value="Female">Intact Female</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold text-[#545d62] mb-1">Status</label>
                          <select
                            value={editPetStatus}
                            onChange={(e) => setEditPetStatus(e.target.value as any)}
                            className="w-full text-xs p-2.5 border border-outline-variant rounded-lg focus:outline-none"
                          >
                            <option value="Checked In">Checked In</option>
                            <option value="In Surgery">In Surgery</option>
                            <option value="In Treatment">In Treatment</option>
                            <option value="Discharged">Discharged</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-[#545d62] mb-1">Allergies (comma separated)</label>
                        <input
                          type="text"
                          value={editPetAllergies}
                          onChange={(e) => setEditPetAllergies(e.target.value)}
                          placeholder="e.g. Penicillin, Soy derivatives"
                          className="w-full text-xs p-2.5 border border-outline-variant rounded-lg focus:outline-none"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setIsEditingPet(false)}
                          className="px-3.5 py-1.5 border hover:bg-slate-50 text-xs rounded-lg transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-[#00647c] text-white text-xs font-bold rounded-lg hover:bg-cyan-700 transition-all shadow-sm cursor-pointer"
                        >
                          Save Profile Changes
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="bg-white border border-outline-variant/60 rounded-xl p-6 shadow-xs flex flex-col md:flex-row gap-6">
                    {/* Pet Photo */}
                    <div className="relative shrink-0">
                      <img
                        src={selectedPet.avatar}
                        alt={selectedPet.name}
                        className="w-24 h-24 md:w-28 md:h-28 rounded-xl object-cover border border-outline-variant/60"
                      />
                      <span className={`absolute -bottom-2 -right-2 px-2.5 py-1 text-[9px] font-bold rounded-full border shadow-sm ${statusColors(selectedPet.status)}`}>
                        {selectedPet.status}
                      </span>
                    </div>

                    {/* Central Info block */}
                    <div className="grow space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2 justify-between">
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-bold text-[#0d1c2e] leading-none">
                            {selectedPet.name}
                          </h2>
                          <span className="text-[10px] bg-[#eff4ff] text-primary/80 font-bold px-2 py-0.5 rounded font-sans uppercase font-mono">
                            {selectedPet.species}
                          </span>
                        </div>
                        <button
                          onClick={() => handleStartEditPet(selectedPet)}
                          className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-[#00647c] bg-[#eff4ff] hover:bg-[#ccdfff] px-2.5 py-1.5 rounded transition-all cursor-pointer shadow-3xs border border-[#00647c]/20"
                        >
                          <Edit2 className="w-3 h-3" /> Edit Profile
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                        <div>
                          <span className="block text-[9px] text-[#545d62] uppercase font-bold tracking-wider font-mono">Breed</span>
                          <span className="text-xs font-bold text-[#0d1c2e]">{selectedPet.breed}</span>
                        </div>
                        <div>
                          <span className="block text-[9px] text-[#545d62] uppercase font-bold tracking-wider font-mono">Age</span>
                          <span className="text-xs font-bold text-[#0d1c2e]">{selectedPet.age}</span>
                        </div>
                        <div>
                          <span className="block text-[9px] text-[#545d62] uppercase font-bold tracking-wider font-mono">Weight</span>
                          <span className="text-xs font-bold text-[#0d1c2e]">{selectedPet.weight} kg</span>
                        </div>
                        <div>
                          <span className="block text-[9px] text-[#545d62] uppercase font-bold tracking-wider font-mono">Sex</span>
                          <span className="text-xs font-bold text-[#0d1c2e]">{selectedPet.gender}</span>
                        </div>
                      </div>

                      {/* Critical Allergies Box */}
                      {selectedPet.alertAllergies.length > 0 ? (
                        <div className="mt-4 p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700 font-medium">
                          <ShieldAlert className="w-4 h-4 shrink-0" />
                          <p className="text-[10px]">
                            <strong>Critical Allergy Warning:</strong> {selectedPet.alertAllergies.join(', ')}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-4 p-2.5 bg-slate-50 border border-outline-variant/30 rounded-lg flex items-center gap-2 text-xs text-[#545d62] font-semibold">
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span className="text-[10px]">No allergies reported. Safe for standard clinical medicine.</span>
                        </div>
                      )}
                    </div>

                    {/* Owner Info box */}
                    {selectedOwnerOfPet && (
                      <div className="w-full md:w-56 bg-slate-50 border border-outline-variant/50 rounded-lg p-3.5 space-y-2 shrink-0">
                        <div className="flex items-center gap-2">
                          <img
                            src={selectedOwnerOfPet.avatar}
                            alt={selectedOwnerOfPet.name}
                            className="w-7 h-7 rounded-full object-cover border"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-[#0d1c2e]">{selectedOwnerOfPet.name}</h4>
                            <span className="text-[8px] bg-amber-100 text-amber-800 font-bold px-1 rounded uppercase">
                              {selectedOwnerOfPet.membershipType} Tier
                            </span>
                          </div>
                        </div>
                        <div className="text-[10px] space-y-1 text-[#545d62] font-medium border-t border-slate-200 pt-2 font-sans">
                          <p className="truncate">📞 {selectedOwnerOfPet.phone}</p>
                          <p className="truncate">✉️ {selectedOwnerOfPet.email}</p>
                          <p className="truncate">🏠 {selectedOwnerOfPet.address}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Medical history records */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-[#0d1c2e] uppercase tracking-wide flex items-center gap-2">
                    📋 Electronic Health Records (EHR) History
                  </h3>
                  {renderEhrRecords(petRecords, selectedPet.name)}
                </div>

              </div>
            ) : (
              <div className="bg-white border rounded-xl p-8 text-center text-xs text-[#545d62]">
                Please select a patient from the registry to inspect detailed clinical logs.
              </div>
            )
          ) : (
            
            /* ========================================================= */
            /* CLIENTS TAB: MULTI-PET DEDICATED CLIENT PROFILE VIEW       */
            /* ========================================================= */
            selectedClient ? (
              <div className="space-y-6 animate-fade-in" id="client-profile-dashboard">
                
                {/* 1. Client Bio Profile Card / Edit Mode Switcher */}
                {isEditingClient ? (
                  <div className="bg-white border border-outline-variant/60 rounded-xl p-6 shadow-xs animate-fade-in relative">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-5">
                      <h3 className="text-xs font-black text-[#00647c] uppercase tracking-wide flex items-center gap-1.5 font-sans">
                        ✏️ Edit Client Account: {selectedClient.name}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsEditingClient(false)}
                        className="text-xs text-slate-400 hover:text-slate-700 font-bold"
                      >
                        ✕ Cancel
                      </button>
                    </div>

                    <form onSubmit={handleSaveClientEdit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-[#545d62] mb-1">Client Name *</label>
                          <input
                            type="text"
                            required
                            value={editClientName}
                            onChange={(e) => setEditClientName(e.target.value)}
                            className="w-full text-xs p-2.5 border border-outline-variant rounded-lg focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[#545d62] mb-1">Email *</label>
                          <input
                            type="email"
                            required
                            value={editClientEmail}
                            onChange={(e) => setEditClientEmail(e.target.value)}
                            className="w-full text-xs p-2.5 border border-outline-variant rounded-lg focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[#545d62] mb-1">Phone Number *</label>
                          <input
                            type="text"
                            required
                            value={editClientPhone}
                            onChange={(e) => setEditClientPhone(e.target.value)}
                            className="w-full text-xs p-2.5 border border-outline-variant rounded-lg focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[#545d62] mb-1">Membership Tier</label>
                          <select
                            value={editClientMembership}
                            onChange={(e) => setEditClientMembership(e.target.value as any)}
                            className="w-full text-xs p-2.5 border border-outline-variant rounded-lg focus:outline-none font-sans font-semibold"
                          >
                            <option value="Standard">Standard Tier</option>
                            <option value="Gold">Gold Tier (10% Discount)</option>
                            <option value="Platinum">Platinum Tier (15% Discount)</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold text-[#545d62] mb-1">Physical Address *</label>
                          <input
                            type="text"
                            required
                            value={editClientAddress}
                            onChange={(e) => setEditClientAddress(e.target.value)}
                            className="w-full text-xs p-2.5 border border-outline-variant rounded-lg focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setIsEditingClient(false)}
                          className="px-3.5 py-1.5 border hover:bg-slate-50 text-xs rounded-lg transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-[#00647c] text-white text-xs font-bold rounded-lg hover:bg-cyan-700 transition-all shadow-sm cursor-pointer"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="bg-white border border-outline-variant/60 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                    
                    <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-bl-full pointer-events-none" />

                    <div className="flex items-center gap-4">
                      <img
                        src={selectedClient.avatar}
                        alt={selectedClient.name}
                        className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-primary/20 bg-slate-100 shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-lg md:text-xl font-bold text-[#0d1c2e] leading-tight">
                            {selectedClient.name}
                          </h2>
                          <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                            selectedClient.membershipType === 'Platinum' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                            selectedClient.membershipType === 'Gold' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {selectedClient.membershipType} Tier Member
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1 text-[10px] text-[#545d62] font-semibold">
                          <p className="flex items-center gap-1 bg-[#eff4ff] px-2 py-0.5 rounded text-primary">
                            <Users className="w-3 h-3" />
                            Client ID: {selectedClient.id}
                          </p>
                          <p className="hidden md:inline">• Joined: {selectedClient.joinedDate}</p>
                        </div>
                      </div>
                    </div>

                    {/* Operational Contacts & Actions */}
                    <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
                      <div className="text-[10px] space-y-1 text-[#545d62] font-medium bg-slate-50 p-3 rounded-lg border border-slate-100 min-w-[200px]">
                        <p className="truncate flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{selectedClient.phone}</span>
                        </p>
                        <p className="truncate flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{selectedClient.email}</span>
                        </p>
                        <p className="truncate flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{selectedClient.address}</span>
                        </p>
                      </div>

                      <div className="flex flex-col gap-1.5 w-full">
                        <button
                          onClick={() => handleStartEditClient(selectedClient)}
                          className="w-full flex items-center justify-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-[#0d1c2e] text-[10px] uppercase tracking-wider font-extrabold px-3 py-2 rounded-lg active:scale-98 transition-all cursor-pointer shadow-3xs bg-white"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                          Edit Client Profile
                        </button>
                        <button
                          onClick={() => setShowAddPetToOwnerForm(!showAddPetToOwnerForm)}
                          className="w-full flex items-center justify-center gap-1.5 bg-[#00647c] text-white text-[10px] uppercase tracking-wider font-extrabold px-3 py-2 rounded-lg hover:bg-cyan-700 active:scale-98 transition-all cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Register Another Pet
                        </button>
                      </div>
                    </div>

                  </div>
                )}

                {/* 2. Embedded Owner Add Pet Form */}
                {showAddPetToOwnerForm && (
                  <div className="bg-[#eff4ff]/30 border border-primary/20 rounded-xl p-5 shadow-inner animate-slide-down space-y-4">
                    <div className="flex justify-between items-center border-b border-primary/10 pb-2">
                      <h4 className="text-xs font-bold text-[#0d1c2e] uppercase flex items-center gap-1.5">
                        🐶 Registering Another Pet under {selectedClient.name}
                      </h4>
                      <button 
                        type="button" 
                        onClick={() => setShowAddPetToOwnerForm(false)}
                        className="text-xs text-slate-400 hover:text-slate-700 font-bold"
                      >
                        ✕ Close
                      </button>
                    </div>

                    <form onSubmit={handleAddPetToExistingClient} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-[#545d62] mb-1">Pet Name *</label>
                        <input
                          type="text"
                          required
                          value={ownerPetName}
                          onChange={(e) => setOwnerPetName(e.target.value)}
                          placeholder="e.g. Bella"
                          className="w-full text-xs p-2 bg-white border border-outline-variant rounded-lg focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#545d62] mb-1">Species *</label>
                        <select
                          value={ownerPetSpecies}
                          onChange={(e) => setOwnerPetSpecies(e.target.value as any)}
                          className="w-full text-xs p-2 bg-white border border-outline-variant rounded-lg focus:outline-none"
                        >
                          <option value="Dog">Dog</option>
                          <option value="Cat">Cat</option>
                          <option value="Bird">Bird</option>
                          <option value="Rabbit">Rabbit</option>
                          <option value="Exotic">Exotic</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#545d62] mb-1">Breed</label>
                        <input
                          type="text"
                          value={ownerPetBreed}
                          onChange={(e) => setOwnerPetBreed(e.target.value)}
                          placeholder="e.g. Pug"
                          className="w-full text-xs p-2 bg-white border border-outline-variant rounded-lg focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#545d62] mb-1">Age</label>
                        <input
                          type="text"
                          value={ownerPetAge}
                          onChange={(e) => setOwnerPetAge(e.target.value)}
                          placeholder="e.g. 1 year 2 months"
                          className="w-full text-xs p-2 bg-white border border-outline-variant rounded-lg focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#545d62] mb-1">Weight (kg)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={ownerPetWeight}
                          onChange={(e) => setOwnerPetWeight(Number(e.target.value))}
                          className="w-full text-xs p-2 bg-white border border-outline-variant rounded-lg focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#545d62] mb-1">Sex / Gender</label>
                        <select
                          value={ownerPetGender}
                          onChange={(e) => setOwnerPetGender(e.target.value as any)}
                          className="w-full text-xs p-2 bg-white border border-outline-variant rounded-lg focus:outline-none"
                        >
                          <option value="Neutered Male">Neutered Male</option>
                          <option value="Spayed Female">Spayed Female</option>
                          <option value="Male">Intact Male</option>
                          <option value="Female">Intact Female</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-[#545d62] mb-1">Allergies (comma separated)</label>
                        <input
                          type="text"
                          value={ownerPetAllergies}
                          onChange={(e) => setOwnerPetAllergies(e.target.value)}
                          placeholder="e.g. Penicillin, Lactose sensitive"
                          className="w-full text-xs p-2 bg-white border border-outline-variant rounded-lg focus:outline-none"
                        />
                      </div>

                      <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAddPetToOwnerForm(false)}
                          className="px-3 py-1.5 border hover:bg-white text-xs rounded-lg transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-primary text-on-primary text-xs font-bold rounded-lg hover:bg-primary-container transition-all"
                        >
                          Confirm &amp; Register Pet
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* 3. Associated Pets Card Grid */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-[#0d1c2e] uppercase tracking-wide flex items-center gap-2">
                    🐕 Registered Pets of this Owner ({selectedClientPets.length})
                  </h3>

                  {selectedClientPets.length === 0 ? (
                    <div className="bg-white border rounded-xl p-8 text-center text-xs text-[#545d62] border-dashed">
                      No registered pets located for {selectedClient.name}. Click "Register Another Pet" to add their first animal friend!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedClientPets.map((pet) => {
                        const isPetSelectedInProfile = selectedPetInProfileId === pet.id;
                        return (
                          <div
                            key={pet.id}
                            onClick={() => setSelectedPetInProfileId(pet.id)}
                            className={`p-4 border rounded-xl bg-white text-left transition-all relative cursor-pointer group hover:shadow-xs ${
                              isPetSelectedInProfile
                                ? 'border-[#00647c] ring-2 ring-[#00647c]/10'
                                : 'border-outline-variant/65 hover:border-slate-350'
                            }`}
                          >
                            <div className="flex items-start gap-3.5">
                              <img
                                src={pet.avatar}
                                alt={pet.name}
                                className="w-14 h-14 rounded-xl object-cover border"
                              />

                              <div className="space-y-1 grow min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <h4 className="text-xs font-bold text-[#0d1c2e] truncate group-hover:text-primary transition-colors">
                                    {pet.name}
                                  </h4>
                                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${statusColors(pet.status)} shrink-0 scale-95`}>
                                    {pet.status}
                                  </span>
                                </div>
                                <p className="text-[10px] text-[#545d62] truncate">
                                  {pet.gender} • {pet.breed}
                                </p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase font-mono tracking-wider">
                                  {pet.species} • {pet.age} • {pet.weight} kg
                                </p>
                              </div>

                              {isPetSelectedInProfile && (
                                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </div>
                              )}
                            </div>

                            {/* Allergy Warning Overlay inside Pet Bio */}
                            {pet.alertAllergies.length > 0 && (
                              <div className="mt-3 py-1 px-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-[9px] font-medium flex items-center gap-1.5 overflow-hidden">
                                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">Allergies: {pet.alertAllergies.join(', ')}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 4. Active Selected Pet's Dynamic EHR History Under Profile */}
                {selectedPetInProfile && (
                  <div className="space-y-4 pt-2 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black text-[#0d1c2e] uppercase tracking-wide flex items-center gap-2">
                        📋 Compiled Charts &amp; Health Files for {selectedPetInProfile.name}
                      </h3>
                      <span className="text-[9px] bg-[#eff4ff] text-primary font-bold px-2 py-0.5 rounded uppercase font-mono">
                        Active EHR Focus
                      </span>
                    </div>

                    {renderEhrRecords(selectedPetInProfileRecords, selectedPetInProfile.name)}
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-white border rounded-xl p-8 text-center text-xs text-[#545d62]">
                Please select a client from the registry on the left to inspect their profile dashboard and patient histories.
              </div>
            )

          )}

        </div>

      </div>

    </div>
  );
}
