import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "../components/admin/AdminLayout";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import { motion } from "framer-motion";

export default function AdminBlogManagement() {
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    featured_image: "",
    category: "news",
    published: false,
    tags: []
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['adminBlogPosts'],
    queryFn: () => base44.entities.BlogPost.list('-created_date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.BlogPost.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBlogPosts'] });
      setEditDialogOpen(false);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BlogPost.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBlogPosts'] });
      setEditDialogOpen(false);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BlogPost.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBlogPosts'] });
    }
  });

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      excerpt: "",
      featured_image: "",
      category: "news",
      published: false,
      tags: []
    });
    setUploadedImages([]);
    setEditingPost(null);
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData(post);
    setEditDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingPost) {
      updateMutation.mutate({ id: editingPost.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleImageUpload = async (e, type = 'content') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      if (type === 'featured') {
        setFormData({ ...formData, featured_image: file_url });
      } else {
        setUploadedImages([...uploadedImages, file_url]);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Image upload failed. Please try again.");
    }
    setUploadingImage(false);
  };

  const insertImageIntoContent = (imageUrl) => {
    const imageHtml = `<img src="${imageUrl}" alt="Blog image" style="max-width: 100%; height: auto; margin: 20px 0;" />`;
    setFormData({ ...formData, content: formData.content + imageHtml });
  };


  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Blog Posts</h1>
          <p className="text-gray-600 dark:text-gray-400">Create and manage blog content</p>
        </div>

        <Card className="admin-card dark:bg-gray-800/50 dark:border-white/5">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="dark:text-white">All Posts</CardTitle>
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  resetForm();
                  setEditDialogOpen(true);
                }}
                className="bg-[#c9a227] hover:bg-[#b89123] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Button>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-4">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="admin-card dark:bg-gray-800/50 dark:border-white/5 hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 mr-4">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{post.title}</h3>
                        <Badge className={post.published ? 'bg-green-500 text-white border-0' : 'bg-gray-400 text-white border-0'}>
                          {post.published ? 'Published' : 'Draft'}
                        </Badge>
                        <Badge variant="outline" className="dark:border-white/10 dark:text-gray-400">
                          {post.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{post.excerpt}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-500">
                        <span>{post.view_count || 0} views</span>
                        <span>•</span>
                        <span>{new Date(post.created_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(post)} className="dark:bg-white/5 dark:border-white/10">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(post.id)} className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPost ? 'Edit Post' : 'Create Post'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label>Featured Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'featured')}
                  disabled={uploadingImage}
                />
                {formData.featured_image && (
                  <img src={formData.featured_image} alt="Featured" className="mt-2 h-32 rounded-lg" />
                )}
              </div>

              <div>
                <Label>Excerpt</Label>
                <Textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                  rows={2}
                />
              </div>

              <div>
                <Label>Content</Label>
                <ReactQuill
                  value={formData.content}
                  onChange={(content) => setFormData({...formData, content})}
                  className="bg-white"
                />
              </div>

              <div>
                <Label>Upload Images for Content</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'content')}
                  disabled={uploadingImage}
                  multiple
                />
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {uploadedImages.map((url, i) => (
                      <div key={i} className="relative">
                        <img src={url} alt={`Upload ${i}`} className="h-20 w-full object-cover rounded" />
                        <Button
                          size="sm"
                          onClick={() => insertImageIntoContent(url)}
                          className="mt-1 w-full text-xs"
                        >
                          Insert
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="news">News</SelectItem>
                      <SelectItem value="tips">Tips</SelectItem>
                      <SelectItem value="stories">Stories</SelectItem>
                      <SelectItem value="gear">Gear</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.published}
                      onChange={(e) => setFormData({...formData, published: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Publish</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#c9a227] hover:bg-[#b89123] text-white">
                  {editingPost ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

      </div>
    </AdminLayout>
  );
}