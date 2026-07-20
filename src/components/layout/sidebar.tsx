'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowUpDown,
  BarChart3,
  Camera,
  AlertTriangle,
  FileText,
  History,
  LayoutDashboard,
  Package,
  Settings,
  Truck,
  Users,
} from 'lucide-react';
import { useStudio } from '@/context/studio-context';

export function Sidebar() {
  const pathname = usePathname();
  const { userRole, items, settings } = useStudio();

  const lowStockCount = items.filter((i) => i.is_low_stock).length;

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Inventory Materials', href: '/inventory', icon: Package, badge: lowStockCount > 0 ? lowStockCount : undefined },
    { label: 'Stock Movements', href: '/stock-movements', icon: ArrowUpDown },
    { label: 'Invoices & Rentals', href: '/invoices', icon: FileText },
    { label: 'Suppliers', href: '/suppliers', icon: Truck },
    { label: 'Studio Clients', href: '/customers', icon: Users },
    { label: 'Reports & Export', href: '/reports', icon: BarChart3 },
    { label: 'Audit Trail', href: '/activity-log', icon: History },
  ];

  if (userRole === 'admin') {
    navItems.push({ label: 'Studio Settings', href: '/settings', icon: Settings });
  }

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800/80 flex flex-col justify-between h-screen sticky top-0 z-40 backdrop-blur-md">
      <div>
        {/* Brand Logo Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Camera className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent tracking-tight">
              {settings?.studio_name || 'Daylight Media'}
            </h1>
            <p className="text-[11px] text-slate-400 font-medium tracking-wider uppercase">Daylight Media SMS</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/90 to-purple-600/90 text-white shadow-md shadow-indigo-500/20 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Low Stock Alert Footer */}
      <div className="p-4 border-t border-slate-800/80">
        {lowStockCount > 0 ? (
          <Link
            href="/inventory?filter=low-stock"
            className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 group hover:bg-amber-500/20 transition-all"
          >
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 group-hover:scale-105 transition-transform">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-300">{lowStockCount} Low Stock Alert{lowStockCount > 1 ? 's' : ''}</p>
              <p className="text-[11px] text-amber-400/70">Click to view reorder items</p>
            </div>
          </Link>
        ) : (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Package className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-300">Inventory Healthy</p>
              <p className="text-[11px] text-emerald-400/70">All levels above reorder point</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
