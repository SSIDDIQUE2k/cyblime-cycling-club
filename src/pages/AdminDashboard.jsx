import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "../utils";
import { motion } from "framer-motion";
import AdminLayout from "../components/admin/AdminLayout";
import {
  Users,
  FileText,
  Calendar,
  Map,
  TrendingUp,
  MessageSquare,
  Flag,
  Activity,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const StatCard = ({ icon: Icon, title, value, change, trend, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -4 }}
    className="relative overflow-hidden"
  >
    <Card className="admin-card dark:bg-gray-800/50 dark:border-white/5 hover:shadow-xl transition-all duration-300">
      <CardContent className="px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{title}</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">{value}</h3>
            {change && (
              <div className="flex items-center gap-2">
                {trend === 'up' ? (
                  <ArrowUp className="w-4 h-4 text-green-500" />
                ) : (
                  <ArrowDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm font-semibold ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {change}%
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">vs last month</span>
              </div>
            )}
          </div>
          <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const QuickAction = ({ icon: Icon, label, onClick, color }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`p-4 rounded-2xl ${color} text-white flex flex-col items-center gap-2 hover:shadow-lg transition-all`}
  >
    <Icon className="w-6 h-6" />
    <span className="text-sm font-semibold">{label}</span>
  </motion.button>
);

const ActivityItem = ({ icon: Icon, title, description, time, color }) => (
  <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-gray-900 dark:text-white">{title}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{description}</p>
    </div>
    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{time}</span>
  </div>
);

function formatTimeAgo(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Only fetch what the dashboard actually displays — small limits for speed
  const { data: users = [] } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => base44.entities.User.list(null, 100),
    staleTime: 5 * 60 * 1000
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['adminBlogPosts'],
    queryFn: () => base44.entities.BlogPost.list('-created_date', 20),
    staleTime: 5 * 60 * 1000
  });

  const { data: events = [] } = useQuery({
    queryKey: ['adminEvents'],
    queryFn: () => base44.entities.Event.list('-created_date', 20),
    staleTime: 5 * 60 * 1000
  });

  const { data: routes = [] } = useQuery({
    queryKey: ['adminRoutes'],
    queryFn: () => base44.entities.Route.list('-created_date', 10),
    staleTime: 5 * 60 * 1000
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['adminReports'],
    queryFn: () => base44.entities.Report.filter({ status: 'pending' }, null, 50),
    staleTime: 2 * 60 * 1000
  });

  const { data: forumPosts = [] } = useQuery({
    queryKey: ['adminForumPosts'],
    queryFn: () => base44.entities.ForumPost.list('-created_date', 10),
    staleTime: 5 * 60 * 1000
  });

  const pendingReports = reports.length;

  // Build real activity feed from recent blog posts, events, forum posts, and routes
  const activityFeed = useMemo(() => {
    const items = [];

    posts.slice(0, 5).forEach(post => {
      items.push({
        icon: FileText,
        title: "Blog Post",
        description: post.title || "Untitled post",
        time: formatTimeAgo(post.created_date),
        date: new Date(post.created_date),
        color: "bg-purple-500"
      });
    });

    events.slice(0, 5).forEach(event => {
      items.push({
        icon: Calendar,
        title: "Event",
        description: event.title || event.name || "Untitled event",
        time: formatTimeAgo(event.created_date || event.date),
        date: new Date(event.created_date || event.date),
        color: "bg-green-500"
      });
    });

    forumPosts.slice(0, 5).forEach(fp => {
      items.push({
        icon: MessageSquare,
        title: "Forum Post",
        description: fp.title || fp.content?.substring(0, 60) || "New forum post",
        time: formatTimeAgo(fp.created_date),
        date: new Date(fp.created_date),
        color: "bg-blue-500"
      });
    });

    routes.slice(0, 5).forEach(route => {
      items.push({
        icon: Map,
        title: "Route Added",
        description: `${route.name || "Untitled route"}${route.distance ? ` - ${route.distance}km` : ""}`,
        time: formatTimeAgo(route.created_date),
        date: new Date(route.created_date),
        color: "bg-[#c9a227]"
      });
    });

    // Sort by date descending, take most recent 8
    items.sort((a, b) => b.date - a.date);
    return items.slice(0, 8);
  }, [posts, events, forumPosts, routes]);

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's what's happening today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Users}
            title="Total Users"
            value={users.length}
            change={12.5}
            trend="up"
            color="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <StatCard
            icon={FileText}
            title="Blog Posts"
            value={posts.length}
            change={8.2}
            trend="up"
            color="bg-gradient-to-br from-purple-500 to-purple-600"
          />
          <StatCard
            icon={Calendar}
            title="Events"
            value={events.length}
            change={-3.1}
            trend="down"
            color="bg-gradient-to-br from-green-500 to-green-600"
          />
          <StatCard
            icon={Flag}
            title="Pending Reports"
            value={pendingReports}
            change={null}
            trend={null}
            color="bg-gradient-to-br from-red-500 to-red-600"
          />
        </div>

        {/* Quick Actions */}
        <Card className="admin-card dark:bg-gray-800/50 dark:border-white/5">
          <CardHeader>
            <CardTitle className="dark:text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <QuickAction
                icon={FileText}
                label="New Post"
                onClick={() => navigate(createPageUrl("AdminBlogManagement"))}
                color="bg-gradient-to-br from-[#c9a227] to-[#b89123]"
              />
              <QuickAction
                icon={Calendar}
                label="New Event"
                onClick={() => navigate(createPageUrl("AdminEventManagement"))}
                color="bg-gradient-to-br from-green-500 to-green-600"
              />
              <QuickAction
                icon={Map}
                label="New Route"
                onClick={() => navigate(createPageUrl("AdminRouteManagement"))}
                color="bg-gradient-to-br from-blue-500 to-blue-600"
              />
              <QuickAction
                icon={Flag}
                label="Moderation"
                onClick={() => navigate(createPageUrl("AdminModeration"))}
                color="bg-gradient-to-br from-red-500 to-red-600"
              />
            </div>
          </CardContent>
        </Card>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Activity - real data */}
          <Card className="admin-card dark:bg-gray-800/50 dark:border-white/5">
            <CardHeader>
              <CardTitle className="dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {activityFeed.length > 0 ? (
                activityFeed.map((item, i) => (
                  <ActivityItem
                    key={i}
                    icon={item.icon}
                    title={item.title}
                    description={item.description}
                    time={item.time}
                    color={item.color}
                  />
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 p-4">No recent activity yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Popular Content */}
          <Card className="admin-card dark:bg-gray-800/50 dark:border-white/5">
            <CardHeader>
              <CardTitle className="dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Popular This Week
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {posts.slice(0, 5).map((post) => (
                <div key={post.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">{post.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{post.view_count || 0} views</span>
                      <span className="text-sm text-gray-400 dark:text-gray-500">&bull;</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{post.category}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Stats Overview */}
        <Card className="admin-card dark:bg-gray-800/50 dark:border-white/5">
          <CardHeader>
            <CardTitle className="dark:text-white">Content Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-3">
                  <Map className="w-8 h-8 text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{routes.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Routes</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{forumPosts.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Forum Posts</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{posts.filter(p => p.published).length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Published Posts</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#c9a227] to-[#b89123] flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.filter(u => u.role === 'admin').length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
