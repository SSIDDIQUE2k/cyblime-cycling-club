import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import AdminLayout from "../components/admin/AdminLayout";
import {
  Users,
  TrendingUp,
  Activity,
  Eye,
  Calendar,
  Map,
  Award
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MetricCard = ({ icon: Icon, title, value, subtitle, color, trend }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -4 }}
  >
    <Card className="admin-card dark:bg-gray-800/50 dark:border-white/5 hover:shadow-xl transition-all">
      <CardContent className="px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/20">
              <TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400" />
              <span className="text-xs font-semibold text-green-600 dark:text-green-400">{trend}%</span>
            </div>
          )}
        </div>
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</h3>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-500">{subtitle}</p>
      </CardContent>
    </Card>
  </motion.div>
);

const TopItem = ({ rank, name, value, metric, avatar }) => (
  <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
      rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
      rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
      rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
      'bg-gray-400'
    }`}>
      {rank}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-gray-900 dark:text-white truncate">{name}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">{metric}</p>
    </div>
    <span className="text-lg font-bold text-gray-900 dark:text-white">{value}</span>
  </div>
);

export default function AdminAnalytics() {
  const { data: users = [] } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => base44.entities.User.list()
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['adminBlogPosts'],
    queryFn: () => base44.entities.BlogPost.list()
  });

  const { data: events = [] } = useQuery({
    queryKey: ['adminEvents'],
    queryFn: () => base44.entities.Event.list()
  });

  const { data: routes = [] } = useQuery({
    queryKey: ['adminRoutes'],
    queryFn: () => base44.entities.Route.list()
  });

  const totalViews = posts.reduce((sum, post) => sum + (post.view_count || 0), 0);
  const avgViews = posts.length > 0 ? Math.round(totalViews / posts.length) : 0;

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">Insights and metrics for your platform</p>
        </div>

        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            icon={Users}
            title="Total Users"
            value={users.length}
            subtitle="All registered members"
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            trend={12}
          />
          <MetricCard
            icon={Eye}
            title="Total Views"
            value={totalViews.toLocaleString()}
            subtitle={`${avgViews} avg per post`}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
            trend={24}
          />
          <MetricCard
            icon={Activity}
            title="Active Content"
            value={posts.filter(p => p.published).length + routes.length}
            subtitle="Published posts & routes"
            color="bg-gradient-to-br from-green-500 to-green-600"
            trend={8}
          />
          <MetricCard
            icon={Calendar}
            title="Upcoming Events"
            value={events.filter(e => new Date(e.date) > new Date()).length}
            subtitle="Scheduled events"
            color="bg-gradient-to-br from-[#c9a227] to-[#b89123]"
          />
        </div>

        {/* Content Performance */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Posts */}
          <Card className="admin-card dark:bg-gray-800/50 dark:border-white/5">
            <CardHeader>
              <CardTitle className="dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Top Blog Posts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {posts
                .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
                .slice(0, 5)
                .map((post, index) => (
                  <TopItem
                    key={post.id}
                    rank={index + 1}
                    name={post.title}
                    value={post.view_count || 0}
                    metric="views"
                  />
                ))}
            </CardContent>
          </Card>

          {/* Top Routes */}
          <Card className="admin-card dark:bg-gray-800/50 dark:border-white/5">
            <CardHeader>
              <CardTitle className="dark:text-white flex items-center gap-2">
                <Map className="w-5 h-5" />
                Popular Routes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {routes
                .sort((a, b) => (b.total_rides || 0) - (a.total_rides || 0))
                .slice(0, 5)
                .map((route, index) => (
                  <TopItem
                    key={route.id}
                    rank={index + 1}
                    name={route.name}
                    value={route.total_rides || 0}
                    metric="rides"
                  />
                ))}
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown */}
        <Card className="admin-card dark:bg-gray-800/50 dark:border-white/5">
          <CardHeader>
            <CardTitle className="dark:text-white">Content by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              {['news', 'tips', 'stories', 'gear', 'training'].map((cat) => {
                const count = posts.filter(p => p.category === cat).length;
                return (
                  <div key={cat} className="text-center p-4 rounded-2xl bg-gray-50 dark:bg-white/5">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{count}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{cat}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* User Engagement */}
        <Card className="admin-card dark:bg-gray-800/50 dark:border-white/5">
          <CardHeader>
            <CardTitle className="dark:text-white">User Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-[#c9a227] to-[#b89123] text-white">
                <Award className="w-12 h-12 mx-auto mb-3 opacity-80" />
                <p className="text-2xl sm:text-3xl font-bold mb-2">{users.filter(u => u.role === 'admin').length}</p>
                <p className="text-sm opacity-90">Administrators</p>
              </div>
              <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-80" />
                <p className="text-2xl sm:text-3xl font-bold mb-2">{users.filter(u => u.role === 'user').length}</p>
                <p className="text-sm opacity-90">Regular Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}