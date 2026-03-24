import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import AdminLayout from "../components/admin/AdminLayout";
import {
  Flag,
  CheckCircle,
  XCircle,
  Eye,
  AlertTriangle,
  Filter
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ReportCard = ({ report, onApprove, onReject, onView }) => {
  const reasonColors = {
    spam: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
    inappropriate: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    harassment: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
    other: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
  };

  const typeColors = {
    forum_post: "bg-blue-500",
    forum_reply: "bg-green-500",
    route_comment: "bg-purple-500",
    user: "bg-red-500"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="group"
    >
      <Card className="admin-card dark:bg-gray-800/50 dark:border-white/5 hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className={`w-12 h-12 rounded-2xl ${typeColors[report.content_type]} flex items-center justify-center flex-shrink-0`}>
              <Flag className="w-6 h-6 text-white" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={reasonColors[report.reason]}>
                    {report.reason}
                  </Badge>
                  <Badge variant="outline" className="text-xs dark:border-white/10 dark:text-gray-400">
                    {report.content_type.replace('_', ' ')}
                  </Badge>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {new Date(report.created_date).toLocaleDateString()}
                </span>
              </div>

              <p className="text-sm text-gray-900 dark:text-white font-medium mb-2">
                Content ID: {report.content_id ? report.content_id.substring(0, 8) + '...' : 'N/A'}
              </p>

              {report.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                  {report.description}
                </p>
              )}

              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
                <span>Reported by: {report.created_by ? report.created_by.split('@')[0] : 'Unknown'}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => onApprove(report.id)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onReject(report.id)}
                  className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onView(report)}
                  className="ml-auto"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function AdminModeration() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState(null);

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['adminReports'],
    queryFn: () => base44.entities.Report.list('-created_date')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Report.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReports'] });
    }
  });

  const filteredReports = reports.filter(report => {
    const statusMatch = filter === "all" || report.status === filter;
    const typeMatch = typeFilter === "all" || report.content_type === typeFilter;
    return statusMatch && typeMatch;
  });

  const pendingCount = reports.filter(r => r.status === 'pending').length;
  const resolvedCount = reports.filter(r => r.status === 'resolved').length;

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Moderation Queue</h1>
            <p className="text-gray-600 dark:text-gray-400">Review and manage reported content</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingCount}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{resolvedCount}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Resolved</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 text-white"
          >
            <AlertTriangle className="w-8 h-8 mb-2 opacity-80" />
            <p className="text-2xl font-bold">{pendingCount}</p>
            <p className="text-sm opacity-90">Needs Review</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white"
          >
            <CheckCircle className="w-8 h-8 mb-2 opacity-80" />
            <p className="text-2xl font-bold">{resolvedCount}</p>
            <p className="text-sm opacity-90">Resolved</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white"
          >
            <Eye className="w-8 h-8 mb-2 opacity-80" />
            <p className="text-2xl font-bold">{reports.filter(r => r.status === 'reviewed').length}</p>
            <p className="text-sm opacity-90">Reviewed</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-2xl bg-gradient-to-br from-gray-500 to-gray-600 text-white"
          >
            <XCircle className="w-8 h-8 mb-2 opacity-80" />
            <p className="text-2xl font-bold">{reports.filter(r => r.status === 'dismissed').length}</p>
            <p className="text-sm opacity-90">Dismissed</p>
          </motion.div>
        </div>

        {/* Filters */}
        <Card className="admin-card dark:bg-gray-800/50 dark:border-white/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <div className="flex-1 flex gap-4">
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-48 dark:bg-white/5 dark:border-white/10">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Reports</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="dismissed">Dismissed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-48 dark:bg-white/5 dark:border-white/10">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="forum_post">Forum Posts</SelectItem>
                    <SelectItem value="forum_reply">Forum Replies</SelectItem>
                    <SelectItem value="route_comment">Route Comments</SelectItem>
                    <SelectItem value="user">Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {filteredReports.length} reports
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Reports List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              Loading reports...
            </div>
          ) : filteredReports.length === 0 ? (
            <Card className="admin-card dark:bg-gray-800/50 dark:border-white/5">
              <CardContent className="p-12 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  All Clear!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  No reports match your current filters.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onApprove={(id) => updateMutation.mutate({ id, status: 'resolved' })}
                onReject={(id) => updateMutation.mutate({ id, status: 'dismissed' })}
                onView={(report) => setSelectedReport(report)}
              />
            ))
          )}
        </div>
      </div>

        {/* Report Detail Dialog */}
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="max-w-lg dark:bg-gray-800 dark:border-white/10">
            <DialogHeader>
              <DialogTitle className="dark:text-white">Report Details</DialogTitle>
            </DialogHeader>
            {selectedReport && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Type</p>
                    <p className="font-medium dark:text-white">{selectedReport.content_type?.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Reason</p>
                    <p className="font-medium dark:text-white capitalize">{selectedReport.reason}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Status</p>
                    <p className="font-medium dark:text-white capitalize">{selectedReport.status}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Date</p>
                    <p className="font-medium dark:text-white">{new Date(selectedReport.created_date).toLocaleString()}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500 dark:text-gray-400">Reported By</p>
                    <p className="font-medium dark:text-white">{selectedReport.created_by}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500 dark:text-gray-400">Content ID</p>
                    <p className="font-mono text-xs dark:text-white bg-gray-100 dark:bg-gray-700 p-2 rounded">{selectedReport.content_id}</p>
                  </div>
                  {selectedReport.description && (
                    <div className="col-span-2">
                      <p className="text-gray-500 dark:text-gray-400">Description</p>
                      <p className="dark:text-white mt-1">{selectedReport.description}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-4 border-t dark:border-white/10">
                  <Button
                    onClick={() => {
                      updateMutation.mutate({ id: selectedReport.id, status: 'resolved' });
                      setSelectedReport(null);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Resolve
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      updateMutation.mutate({ id: selectedReport.id, status: 'dismissed' });
                      setSelectedReport(null);
                    }}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Dismiss
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
    </AdminLayout>
  );
}