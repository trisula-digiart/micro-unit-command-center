'use client';

import React from 'react';
import { UserRole, UserProfile } from '@/types';
import { Shield, Building2, UserCheck, Activity, ChevronDown } from 'lucide-react';

interface HeaderProps {
currentUser: UserProfile;
onRoleSwitch: (role: UserRole) => void;
isConnected?: boolean;
}

export const Header: React.FC = ({
currentUser,
onRoleSwitch,
isConnected = true,
}) => {
return (




      {/* Brand & System Title */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-500/30">
          <Building2 className="h-6 w-6" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-bold text-lg tracking-wide text-slate-100">
              COMMAND CENTER
            </h1>
            <span className="text-xs bg-blue-950 text-blue-400 font-semibold px-2 py-0.5 rounded border border-blue-800">
              v1.0
            </span>
          </div>
          <p className="text-xs text-slate-400">
            17 Micro-Unit Area Regional Command
          </p>
        </div>
      </div>

      {/* Right Section: System Health & Role Switcher */}
      <div className="flex items-center space-x-6">
        
        {/* Realtime API / DB Connection Status */}
        <div className="hidden md:flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700">
          <span className="relative flex h-2.5 w-2.5">
            {isConnected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isConnected ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            ></span>
          </span>
          <span className="text-xs font-medium text-slate-300">
            {isConnected ? 'System Online' : 'Offline / Sync Error'}
          </span>
          <Activity className="h-3.5 w-3.5 text-slate-400 ml-1" />
        </div>

        {/* Role Switcher & Active Profile Info */}
        <div className="flex items-center space-x-3 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-200">
              {currentUser.full_name}
            </p>
            <p className="text-[10px] text-slate-400">
              {currentUser.unit?.name || 'Kantor Regional Area'}
            </p>
          </div>

          <div className="relative inline-block text-left">
            <div className="flex items-center space-x-1.5 bg-slate-900 text-blue-400 px-2.5 py-1 rounded border border-slate-700 text-xs font-bold">
              <Shield className="h-3.5 w-3.5" />
              <span>{currentUser.role.replace('_', ' ')}</span>
            </div>
          </div>

          {/* Quick Role Simulation Selector for Testing */}
          <div className="relative group">
            <button
              type="button"
              className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
              title="Switch Role Preview"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-md shadow-xl border border-slate-700 py-1 hidden group-hover:block z-50">
              <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-700">
                Simulasi Akses Peran
              </div>
              <button
                onClick={() => onRoleSwitch('AREA_HEAD')}
                className={`w-full text-left px-3 py-1.5 text-xs flex items-center space-x-2 hover:bg-slate-700 ${
                  currentUser.role === 'AREA_HEAD' ? 'text-blue-400 font-bold' : 'text-slate-300'
                }`}
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span>Area Head</span>
              </button>
              <button
                onClick={() => onRoleSwitch('KEPALA_UNIT')}
                className={`w-full text-left px-3 py-1.5 text-xs flex items-center space-x-2 hover:bg-slate-700 ${
                  currentUser.role === 'KEPALA_UNIT' ? 'text-blue-400 font-bold' : 'text-slate-300'
                }`}
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span>Kepala Unit</span>
              </button>
              <button
                onClick={() => onRoleSwitch('SUPER_ADMIN')}
                className={`w-full text-left px-3 py-1.5 text-xs flex items-center space-x-2 hover:bg-slate-700 ${
                  currentUser.role === 'SUPER_ADMIN' ? 'text-blue-400 font-bold' : 'text-slate-300'
                }`}
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span>Super Admin</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  </div>
</header>


);
};