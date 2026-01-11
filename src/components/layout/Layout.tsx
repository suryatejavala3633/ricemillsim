import { ReactNode, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  LogOut,
  User,
  Menu,
  X,
  LayoutDashboard,
  Calculator,
  TrendingUp,
  Package,
  FileText,
  Users,
  Settings,
  Zap,
  ChevronRight,
  ShoppingCart,
  Boxes
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  currentView?: string;
  onViewChange?: (view: string) => void;
}

export default function Layout({ children, currentView, onViewChange }: LayoutProps) {
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await signOut();
    }
  };

  const navItems = [
    { id: 'cmr-paddy', label: 'CMR Paddy Overview', icon: LayoutDashboard },
    { id: 'production', label: 'Production', icon: TrendingUp },
    { id: 'lorry-freight', label: 'Lorry Freight', icon: Package },
    { id: 'wages', label: 'Wages & Salaries', icon: Users },
    { id: 'hamali', label: 'Hamali Work', icon: ShoppingCart },
    { id: 'inventory', label: 'Inventory & Stock', icon: Boxes },
    { id: 'sales', label: 'By-Product Sales', icon: FileText },
    { id: 'pricing', label: 'Price Management', icon: FileText },
    { id: 'power-factor', label: 'Power Factor', icon: Zap },
    { id: 'calculator', label: 'Calculators', icon: Calculator },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gMTAwIDAgTCAwIDAgMCAxMDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAyIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

      <div className="relative z-10 flex h-screen overflow-hidden">
        <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 ease-out bg-black/20 backdrop-blur-2xl border-r border-white/5 flex flex-col`}>
          <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
            {sidebarOpen && (
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <span className="text-white font-bold text-sm">SM</span>
                </div>
                <div>
                  <div className="text-white font-semibold text-sm tracking-tight">Surya Industries</div>
                  <div className="text-gray-500 text-xs">Rice Mill</div>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-white/5 rounded-lg transition-all text-gray-400 hover:text-white"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange?.(item.id)}
                  className={`w-full flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'} px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon size={18} className={isActive ? '' : 'group-hover:scale-110 transition-transform'} />
                    {sidebarOpen && <span className="text-sm font-medium tracking-tight">{item.label}</span>}
                  </div>
                  {sidebarOpen && isActive && <ChevronRight size={14} />}
                </button>
              );
            })}
          </nav>

          <div className="border-t border-white/5 p-4 space-y-3">
            {sidebarOpen ? (
              <div className="bg-white/[0.02] rounded-xl p-3 border border-white/5">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                    {user?.email?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-xs font-medium truncate">{user?.email?.split('@')[0]}</div>
                    <div className="text-gray-500 text-[10px] truncate">{user?.email}</div>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 rounded-lg transition-all text-xs font-medium"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center p-2 hover:bg-red-500/10 text-gray-400 hover:text-red-400 rounded-lg transition-all"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 bg-black/20 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between px-6">
            <h1 className="text-white text-lg font-semibold tracking-tight">
              {navItems.find(item => item.id === currentView)?.label || 'Dashboard'}
            </h1>
            <div className="flex items-center space-x-3">
              <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl backdrop-blur-xl">
                <span className="text-blue-400 text-xs font-medium tracking-wide">Season: Rabi 24-25</span>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
