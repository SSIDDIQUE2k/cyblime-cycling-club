import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Map,
  Users,
  Flag,
  TrendingUp,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Moon,
  Sun,
  Trophy,
  MessageSquare,
  Instagram,
  Shield,
  PenTool,
  Quote,
  Sliders
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoadingAuth, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (!isLoadingAuth && (!user || user.role !== 'admin')) {
      navigate('/', { replace: true });
    }
  }, [user, isLoadingAuth, navigate]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('admin_theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('admin_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('admin_theme', 'light');
    }
  };

  const { data: pendingReports = [] } = useQuery({
    queryKey: ['pendingReports'],
    queryFn: () => base44.entities.Report.filter({ status: 'pending' }, null, 50),
    staleTime: 2 * 60 * 1000
  });

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", page: "AdminDashboard", badge: null },
    { icon: Flag, label: "Moderation", page: "AdminModeration", badge: pendingReports.length > 0 ? pendingReports.length.toString() : null },
    { icon: TrendingUp, label: "Analytics", page: "AdminAnalytics", badge: null },
    { icon: FileText, label: "Blog Posts", page: "AdminBlogManagement", badge: null },
    { icon: Calendar, label: "Events", page: "AdminEventManagement", badge: null },
    { icon: Map, label: "Routes", page: "AdminRouteManagement", badge: null },
    { icon: MessageSquare, label: "Forum", page: "AdminForumManagement", badge: null },
    { icon: Users, label: "Users", page: "AdminUserManagement", badge: null },
    { icon: Trophy, label: "Challenges", page: "AdminChallengeManagement", badge: null },
    { icon: Instagram, label: "Instagram", page: "AdminInstagramSettings", badge: null },
    { icon: PenTool, label: "Page Content", page: "AdminPageContent", badge: null },
    { icon: Quote, label: "Testimonials", page: "AdminTestimonials", badge: null },
    { icon: Sliders, label: "Site Settings", page: "AdminSiteSettings", badge: null },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const isActive = (page) => location.pathname.includes(page);

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      <style>{`
        .dark {
          color-scheme: dark;
        }
        .dark .admin-sidebar {
          background: linear-gradient(180deg, #0f172a 0%, #020617 100%);
          border-right-color: rgba(255, 255, 255, 0.05);
        }
        .dark .admin-card {
          background: rgba(15, 23, 42, 0.8);
          border-color: rgba(255, 255, 255, 0.05);
        }
        .dark .admin-topbar {
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(12px);
          border-bottom-color: rgba(255, 255, 255, 0.05);
        }
        .glassmorphism {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .dark .glassmorphism {
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
      `}</style>

      {/* Sidebar - Desktop */}
      <aside className={`fixed left-0 top-0 h-full z-40 transition-all duration-300 admin-sidebar ${
        sidebarOpen ? 'w-64' : 'w-20'
      } ${darkMode ? 'bg-gray-900 border-r border-white/5' : 'bg-white border-r border-gray-200'} hidden lg:block`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c9a227] to-[#b89123] flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-white" />
              </div>
              {sidebarOpen && (
                <div>
                  <h1 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>Admin Portal</h1>
                  <p className="text-xs text-gray-500">Cyblime Cycling</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.page);
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                    active
                      ? darkMode
                        ? 'bg-[#c9a227]/20 text-[#c9a227]'
                        : 'bg-[#c9a227]/10 text-[#c9a227]'
                      : darkMode
                      ? 'text-gray-400 hover:bg-white/5 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-[#c9a227]' : ''}`} />
                  {sidebarOpen && (
                    <>
                      <span className="font-medium">{item.label}</span>
                      {item.badge && (
                        <Badge className="ml-auto bg-red-500 text-white border-0 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-200 dark:border-white/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c9a227] to-[#b89123] flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">
                  {user.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {user.full_name || user.email?.split('@')[0] || "User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              )}
            </div>
            {sidebarOpen && (
              <Button
                onClick={() => logout()}
                variant="outline"
                className="w-full justify-start text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                size="sm"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-64 z-50 transition-transform duration-300 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } ${darkMode ? 'bg-gray-900' : 'bg-white'} lg:hidden`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c9a227] to-[#b89123] flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Admin</h1>
              </div>
            </div>
            <button onClick={() => setMobileMenuOpen(false)}>
              <X className={`w-6 h-6 ${darkMode ? 'text-white' : 'text-gray-900'}`} />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.page);
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    active
                      ? 'bg-[#c9a227]/10 text-[#c9a227]'
                      : darkMode
                      ? 'text-gray-400 hover:bg-white/5'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <Badge className="ml-auto bg-red-500 text-white border-0 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* Top Bar */}
        <header className={`sticky top-0 z-30 admin-topbar ${
          darkMode ? 'bg-gray-900/80 border-b border-white/5' : 'bg-white/80 border-b border-gray-200'
        } backdrop-blur-xl`}>
          <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden"
              >
                <Menu className={`w-6 h-6 ${darkMode ? 'text-white' : 'text-gray-900'}`} />
              </button>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden lg:block"
              >
                <Menu className={`w-5 h-5 ${darkMode ? 'text-white' : 'text-gray-900'}`} />
              </button>
              
              {/* Search */}
              <div className="hidden md:block relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <Input
                  placeholder="Search..."
                  className={`pl-10 w-64 ${darkMode ? 'bg-white/5 border-white/10 text-white' : ''}`}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="md:hidden"
              >
                <Search className={`w-5 h-5 ${darkMode ? 'text-white' : 'text-gray-900'}`} />
              </button>
              
              <Link to={createPageUrl("AdminModeration")}>
                <button className="relative hover:opacity-80 transition-opacity">
                  <Bell className={`w-5 h-5 ${darkMode ? 'text-white' : 'text-gray-900'}`} />
                  {pendingReports.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                      {pendingReports.length}
                    </span>
                  )}
                </button>
              </Link>

              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          {searchOpen && (
            <div className="px-6 pb-4 md:hidden">
              <Input
                placeholder="Search..."
                className={darkMode ? 'bg-white/5 border-white/10 text-white' : ''}
              />
            </div>
          )}
        </header>

        {/* Page Content */}
        <main className="p-3 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}