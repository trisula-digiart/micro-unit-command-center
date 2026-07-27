'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserRole } from '@/types';
import { LayoutDashboard, AlertTriangle, FileText, Target, ShieldCheck } from 'lucide-react';

interface NavigationTabsProps {
role: UserRole;
}

export const NavigationTabs: React.FC = ({ role }) => {
const pathname = usePathname();

// Tab Menu Configurations based on Role
const areaHeadTabs = [
{
label: 'Executive Command',
href: '/area-head',
icon: LayoutDashboard,
},
{
label: 'NPL Watchlist (Risk)',
href: '/area-head/risk-watchlist',
icon: AlertTriangle,
},
];

const kepalaUnitTabs = [
{
label: 'Unit Performance',
href: '/kepala-unit',
icon: LayoutDashboard,
},
{
label: 'Pipeline Prospek',
href: '/kepala-unit/pipeline',
icon: Target,
},
{
label: 'Laporan Harian',
href: '/kepala-unit/reports',
icon: FileText,
},
];

const adminTabs = [
...areaHeadTabs,
{
label: 'Admin Control',
href: '/admin',
icon: ShieldCheck,
},
];

let activeTabs = areaHeadTabs;
if (role === 'KEPALA_UNIT') activeTabs = kepalaUnitTabs;
if (role === 'SUPER_ADMIN') activeTabs = adminTabs;

return (



{activeTabs.map((tab) => {
const Icon = tab.icon;
const isActive = pathname === tab.href;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
              isActive
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </div>
  </div>
</nav>


);
};