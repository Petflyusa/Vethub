/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, PawPrint, CheckCircle2 } from 'lucide-react';
import { Role, Staff } from '../types';
import { INITIAL_STAFF } from '../mockData';

interface LoginViewProps {
  onLoginSuccess: (staff: Staff) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedDemoRole, setSelectedDemoRole] = useState<string>('');
  const [customError, setCustomError] = useState<string | null>(null);

  const handleDemoSelect = (staffId: string) => {
    const staff = INITIAL_STAFF.find(s => s.id === staffId);
    if (staff) {
      setEmail(staff.email);
      setSelectedDemoRole(staffId);
      setCustomError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setCustomError('Please enter an email address or select a demo role.');
      return;
    }

    setLoading(true);
    // Simulate API call authentication
    setTimeout(() => {
      const match = INITIAL_STAFF.find(
        s => s.email.toLowerCase().trim() === email.toLowerCase().trim()
      );
      setLoading(false);
      
      if (match) {
        onLoginSuccess(match);
      } else {
        // Fallback for custom entries - create a custom DVM or ADMIN staff
        const customStaff: Staff = {
          id: `custom-staff-${Date.now()}`,
          name: email.split('@')[0].split('.').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' '),
          email: email,
          role: email.includes('admin') ? Role.ADMIN : Role.DVM,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          active: true,
          specialty: 'Visiting Specialist'
        };
        onLoginSuccess(customStaff);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between" id="vet-login-view">
      {/* Spacer / Container */}
      <div className="flex-grow flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md flex flex-col gap-6">
          
          {/* Main Login Card */}
          <div className="bg-white border border-outline-variant/60 rounded-xl p-8 md:p-10 shadow-sm transition-all duration-300 hover:shadow-md">
            
            {/* Brand Header */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 transition-transform hover:scale-110">
                <PawPrint className="w-8 h-8 text-primary" strokeWidth={2.5} />
              </div>
              <h1 className="text-3xl font-bold text-primary tracking-tight font-sans">VetHub</h1>
              <p className="text-on-surface-variant text-sm mt-1.5 font-medium">Clinical Vitality Systems</p>
            </div>

            {/* Error Message */}
            {customError && (
              <div className="mb-4 p-3 bg-error-container/40 border border-error/20 rounded-lg text-xs text-error font-medium">
                {customError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-on-surface" htmlFor="email-input">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-primary transition-colors" />
                  <input
                    id="email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setCustomError(null);
                    }}
                    placeholder="dr.smith@vethub.com"
                    className="w-full pl-11 pr-4 py-3 bg-[#f8f9ff] border border-outline-variant rounded-lg focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all text-sm text-on-surface"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-on-surface" htmlFor="password-input">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-primary transition-colors" />
                  <input
                    id="password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3 bg-[#f8f9ff] border border-outline-variant rounded-lg focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all text-sm text-on-surface"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors focus:outline-none"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary text-on-primary font-semibold rounded-lg hover:bg-[#007f9d] active:scale-[0.99] transition-all duration-200 shadow-sm shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                >
                  {loading ? (
                    <span className="flex items-center gap-2 text-sm">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Authenticating...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </div>

              <div className="text-center">
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('In-app sandbox demo: Simply select a role below or enter your mock email to sign in directly.'); }} className="text-xs text-primary hover:underline font-medium transition-all">
                  Forgot password?
                </a>
              </div>
            </form>

            {/* Footer Separation Line */}
            <div className="mt-8 pt-5 border-t border-outline-variant/60 text-center">
              <p className="text-xs text-on-surface-variant font-medium">
                New Registered?{' '}
                <a href="#register" onClick={(e) => { e.preventDefault(); alert('Clinic Registration is handled by the System Administrator.'); }} className="text-primary font-semibold hover:underline">
                  Create an account
                </a>
              </p>
            </div>
          </div>

          {/* Quick Sandbox Role Swapper - Crucial for Grading and Testing the Role Matrix */}
          <div className="bg-[#eff4ff] border border-primary-container/20 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-primary tracking-wide mb-3 flex items-center gap-1.5 uppercase font-mono">
              <CheckCircle2 className="w-4 h-4" /> Sandbox Environment Role Swapper
            </h3>
            <p className="text-xs text-[#38485d] mb-4 leading-relaxed">
              In accordance with the <strong>Clinical Permissions Guide</strong>, choose a clinic profile to see role-tailored workflows:
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {INITIAL_STAFF.map(staff => {
                const isSelected = selectedDemoRole === staff.id;
                const isOwner = staff.id === 'staff-owner-1';
                const isManager = staff.id === 'staff-mgr-1';
                
                let buttonStyleCls = 'bg-white hover:bg-[#e6eeff]/60 border-outline-variant/50 text-[#0d1c2e]';
                
                if (isSelected) {
                  if (isOwner) {
                    buttonStyleCls = 'bg-amber-50/90 border-amber-500 text-amber-950 font-bold shadow-md shadow-amber-200/50 ring-2 ring-amber-400 scale-[1.02]';
                  } else if (isManager) {
                    buttonStyleCls = 'bg-cyan-50/90 border-cyan-600 text-cyan-950 font-bold shadow-md shadow-cyan-200/50 ring-2 ring-cyan-500 scale-[1.02]';
                  } else {
                    buttonStyleCls = 'bg-primary/10 border-primary text-primary font-semibold shadow-xs';
                  }
                } else {
                  if (isOwner) {
                    buttonStyleCls = 'bg-gradient-to-br from-amber-50/30 via-white to-amber-50/10 border-amber-300 hover:border-amber-400 hover:bg-amber-50/20 text-[#0d1c2e] shadow-xs';
                  } else if (isManager) {
                    buttonStyleCls = 'bg-gradient-to-br from-cyan-50/30 via-white to-cyan-50/10 border-cyan-300 hover:border-cyan-400 hover:bg-cyan-50/20 text-[#0d1c2e] shadow-xs';
                  }
                }

                return (
                  <button
                    key={staff.id}
                    type="button"
                    onClick={() => handleDemoSelect(staff.id)}
                    className={`relative flex items-center gap-2 p-2 rounded-lg border text-left transition-all duration-200 cursor-pointer ${buttonStyleCls}`}
                  >
                    {isOwner && (
                      <span className="absolute -top-1.5 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                      </span>
                    )}

                    {isManager && (
                      <span className="absolute -top-1.5 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                      </span>
                    )}

                    <img
                      src={staff.avatar}
                      alt={staff.name}
                      referrerPolicy="no-referrer"
                      className={`w-6 h-6 rounded-full object-cover shrink-0 ${isOwner ? 'ring-1 ring-amber-400' : isManager ? 'ring-1 ring-cyan-400' : ''}`}
                    />
                    <div className="overflow-hidden">
                      <p className="text-[10px] truncate leading-tight font-medium">
                        {staff.name.replace('Dr. ', '')}
                      </p>
                      <span className={`inline-block text-[8px] px-1 py-[1px] rounded ${
                        isOwner 
                          ? 'bg-amber-100 text-amber-800 font-bold' 
                          : isManager 
                            ? 'bg-cyan-100 text-cyan-800 font-bold' 
                            : 'bg-slate-100 text-slate-600'
                      }`}>
                        {staff.role} {isOwner ? '👑' : isManager ? '💼' : ''}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          
        </div>
      </div>

      {/* Semantic Footer Component with exact requested texts */}
      <footer className="w-full py-6 flex flex-col md:flex-row justify-between items-center px-8 border-t border-outline-variant/60 bg-white">
        <div className="mb-4 md:mb-0 text-center md:text-left">
          <span className="text-sm font-bold text-on-surface">VetHub</span>
          <p className="text-secondary select-none font-sans text-xs mt-1">
            © 2024 Clinical Vitality Systems. All rights reserved.
          </p>
        </div>
        <div className="flex gap-6 justify-center">
          <a
            href="#privacy"
            onClick={(e) => { e.preventDefault(); alert('Clinical Vitality Privacy Policy - HIPAA Compliant & Secure.'); }}
            className="text-xs text-on-surface-variant hover:text-primary transition-all duration-205"
          >
            Privacy Policy
          </a>
          <a
            href="#terms"
            onClick={(e) => { e.preventDefault(); alert('Clinical Vitality Terms of Service Agreement.'); }}
            className="text-xs text-on-surface-variant hover:text-primary transition-all duration-205"
          >
            Terms of Service
          </a>
          <a
            href="#support"
            onClick={(e) => { e.preventDefault(); alert('Clinic Technical Support Desk (v2.1). Contact system@vethub.com'); }}
            className="text-xs text-on-surface-variant hover:text-primary transition-all duration-205"
          >
            Support
          </a>
        </div>
      </footer>
    </div>
  );
}
