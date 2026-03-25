import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "../components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Users, Shield, User, Mail } from "lucide-react";

export default function AdminUserManagement() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => base44.entities.User.list()
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }) => base44.entities.User.update(id, { role }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminUsers'] }),
    onError: (err) => alert("Failed to update role: " + (err?.message || "Please try again."))
  });

  const filtered = users.filter(u => {
    const matchesSearch = !search ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">User Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage member roles and permissions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="dark:bg-gray-800/50 dark:border-white/5">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
              </div>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-800/50 dark:border-white/5">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#c9a227] flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.filter(u => u.role === 'admin').length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Admins</p>
              </div>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-800/50 dark:border-white/5">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.filter(u => u.role !== 'admin').length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Members</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-0 sm:min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 dark:bg-gray-800 dark:border-white/10 dark:text-white"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-40 dark:bg-gray-800 dark:border-white/10 dark:text-white">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* User Table */}
        <Card className="dark:bg-gray-800/50 dark:border-white/5">
          <CardHeader>
            <CardTitle className="dark:text-white">Members ({filtered.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">Loading users...</div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-white/5">
                {filtered.map((u) => (
                  <div key={u.id} className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex-wrap gap-3">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c9a227] to-[#b89123] flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">
                          {(u.full_name || u.email || '?').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{u.full_name || 'Unknown'}</p>
                        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                          <Mail className="w-3 h-3" />
                          {u.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={u.role === 'admin' ? 'bg-[#c9a227] text-white border-0' : 'bg-gray-100 text-gray-700 border-0'}>
                        {u.role || 'user'}
                      </Badge>
                      <Select
                        value={u.role || 'user'}
                        onValueChange={(role) => updateRoleMutation.mutate({ id: u.id, role })}
                      >
                        <SelectTrigger className="w-32 h-8 text-xs dark:bg-gray-700 dark:border-white/10 dark:text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Member</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">No users found</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}