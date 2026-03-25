import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "../components/admin/AdminLayout";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Star,
  Quote,
  RefreshCw,
  Check
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const EMPTY_TESTIMONIAL = {
  name: "",
  role: "",
  company: "",
  quote: "",
  avatar_url: "",
  rating: 5,
  member_since: "",
  featured: false,
  sort_order: 0
};

function TestimonialForm({ testimonial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(testimonial || EMPTY_TESTIMONIAL);

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="dark:text-gray-300">Full Name *</Label>
          <Input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Sarah Mitchell"
            className="dark:bg-gray-900 dark:border-white/10"
          />
        </div>
        <div>
          <Label className="dark:text-gray-300">Role / Title</Label>
          <Input
            value={form.role}
            onChange={(e) => update("role", e.target.value)}
            placeholder="Weekend Warrior"
            className="dark:bg-gray-900 dark:border-white/10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="dark:text-gray-300">Company / Affiliation</Label>
          <Input
            value={form.company}
            onChange={(e) => update("company", e.target.value)}
            placeholder="Cyblime Member"
            className="dark:bg-gray-900 dark:border-white/10"
          />
        </div>
        <div>
          <Label className="dark:text-gray-300">Member Since</Label>
          <Input
            value={form.member_since}
            onChange={(e) => update("member_since", e.target.value)}
            placeholder="2022"
            className="dark:bg-gray-900 dark:border-white/10"
          />
        </div>
      </div>

      <div>
        <Label className="dark:text-gray-300">Quote *</Label>
        <Textarea
          value={form.quote}
          onChange={(e) => update("quote", e.target.value)}
          placeholder="What the member says about Cyblime..."
          rows={3}
          className="dark:bg-gray-900 dark:border-white/10"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="dark:text-gray-300">Avatar URL</Label>
          <Input
            value={form.avatar_url}
            onChange={(e) => update("avatar_url", e.target.value)}
            placeholder="https://... (optional)"
            className="dark:bg-gray-900 dark:border-white/10"
          />
        </div>
        <div>
          <Label className="dark:text-gray-300">Rating (1-5)</Label>
          <div className="flex items-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => update("rating", star)}
                className="focus:outline-none"
              >
                <Star
                  className={`w-6 h-6 ${
                    star <= form.rating
                      ? "text-[#c9a227] fill-[#c9a227]"
                      : "text-gray-300 dark:text-gray-600"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Switch
          checked={form.featured}
          onCheckedChange={(checked) => update("featured", checked)}
        />
        <Label className="dark:text-gray-300">Featured on homepage</Label>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button
          onClick={() => onSave(form)}
          disabled={saving || !form.name || !form.quote}
          className="bg-gradient-to-r from-[#c9a227] to-[#b89123] text-white"
        >
          {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Testimonial
        </Button>
      </div>
    </div>
  );
}

export default function AdminTestimonials() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ["testimonials"],
    queryFn: () => base44.entities.Testimonial.list("sort_order")
  });

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (editingTestimonial?.id) {
        await base44.entities.Testimonial.update(editingTestimonial.id, {
          ...form,
          updated_date: new Date().toISOString()
        });
      } else {
        await base44.entities.Testimonial.create({
          ...form,
          sort_order: testimonials.length,
          created_date: new Date().toISOString(),
          updated_date: new Date().toISOString()
        });
      }
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      setDialogOpen(false);
      setEditingTestimonial(null);
    } catch (error) {
      console.error("Failed to save:", error);
      alert("Failed to save testimonial.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await base44.entities.Testimonial.delete(id);
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  const handleEdit = (testimonial) => {
    setEditingTestimonial(testimonial);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingTestimonial(null);
    setDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Testimonials</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage member testimonials displayed on your site</p>
          </div>
          <Button
            onClick={handleAdd}
            className="bg-gradient-to-r from-[#c9a227] to-[#b89123] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Testimonial
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-6 h-6 animate-spin text-[#c9a227]" />
          </div>
        ) : testimonials.length === 0 ? (
          <Card className="dark:bg-gray-800/50 dark:border-white/5">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Quote className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Testimonials Yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Add your first member testimonial to showcase on the website.</p>
              <Button onClick={handleAdd} className="bg-gradient-to-r from-[#c9a227] to-[#b89123] text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add First Testimonial
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="dark:bg-gray-800/50 dark:border-white/5 hover:shadow-lg transition-shadow">
                <CardContent className="px-3 sm:px-6 py-3 sm:py-4">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#c9a227] to-[#b89123] flex items-center justify-center flex-shrink-0">
                      {testimonial.avatar_url ? (
                        <img src={testimonial.avatar_url} alt={testimonial.name} className="w-14 h-14 rounded-full object-cover" />
                      ) : (
                        <span className="text-white font-bold text-lg">
                          {testimonial.name?.charAt(0)?.toUpperCase() || "?"}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 dark:text-white">{testimonial.name}</h3>
                        {testimonial.featured && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-[#c9a227]/10 text-[#c9a227] rounded-full">
                            Featured
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {testimonial.role}{testimonial.company ? ` at ${testimonial.company}` : ""}
                        {testimonial.member_since ? ` • Member since ${testimonial.member_since}` : ""}
                      </p>
                      <div className="flex items-center gap-0.5 my-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= (testimonial.rating || 5)
                                ? "text-[#c9a227] fill-[#c9a227]"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 italic">"{testimonial.quote}"</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(testimonial)}
                        className="text-gray-500 hover:text-[#c9a227]"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      {deleteConfirm === testimonial.id ? (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(testimonial.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirm(null)}
                            className="text-gray-500"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(testimonial.id)}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-lg dark:bg-gray-900 dark:border-white/10">
            <DialogHeader>
              <DialogTitle className="dark:text-white">
                {editingTestimonial?.id ? "Edit Testimonial" : "Add Testimonial"}
              </DialogTitle>
            </DialogHeader>
            <TestimonialForm
              testimonial={editingTestimonial || EMPTY_TESTIMONIAL}
              onSave={handleSave}
              onCancel={() => {
                setDialogOpen(false);
                setEditingTestimonial(null);
              }}
              saving={saving}
            />
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}