import React, { useState, useRef } from "react";
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
import { Editor } from "@tinymce/tinymce-react";
import { motion } from "framer-motion";

// TinyMCE image upload handler — uploads to Supabase Storage
function tinymceImageUpload(blobInfo) {
  return new Promise((resolve, reject) => {
    const file = blobInfo.blob();
    base44.integrations.Core.UploadFile({ file })
      .then(({ file_url }) => resolve(file_url))
      .catch((err) => reject("Upload failed: " + err.message));
  });
}

export default function AdminBlogManagement() {
  const queryClient = useQueryClient();
  const editorRef = useRef(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    featured_image: "",
    category: "news",
    published: true,
    tags: [],
    video_url: ""
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
    },
    onError: (err) => alert("Failed to create post: " + err.message)
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BlogPost.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBlogPosts'] });
      setEditDialogOpen(false);
      resetForm();
    },
    onError: (err) => alert("Failed to update post: " + err.message)
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BlogPost.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBlogPosts'] });
    },
    onError: (err) => alert("Failed to delete post: " + err.message)
  });

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      excerpt: "",
      featured_image: "",
      category: "news",
      published: true,
      tags: [],
      video_url: ""
    });
    setEditingPost(null);
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData(post);
    setEditDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Clean up data — remove empty optional fields so Supabase doesn't reject them
    const data = { ...formData };
    if (!data.video_url) delete data.video_url;
    if (!data.featured_image) delete data.featured_image;
    if (!data.excerpt) delete data.excerpt;
    if (!data.tags || data.tags.length === 0) delete data.tags;

    if (editingPost) {
      updateMutation.mutate({ id: editingPost.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleFeaturedImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, featured_image: file_url });
    } catch (error) {
      console.error("Upload error:", error);
      alert("Image upload failed. Please try again.");
    }
    setUploadingImage(false);
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
                    <div className="flex items-center gap-4 flex-1 min-w-0 mr-4">
                      {post.featured_image && (
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
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
                          <span>-</span>
                          <span>{new Date(post.created_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(post)} className="dark:bg-white/5 dark:border-white/10">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(post.id)} className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {posts.length === 0 && (
            <Card className="admin-card dark:bg-gray-800/50 dark:border-white/5">
              <CardContent className="p-12 text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-4">No blog posts yet</p>
                <Button
                  onClick={() => { resetForm(); setEditDialogOpen(true); }}
                  className="bg-[#c9a227] hover:bg-[#b89123] text-white"
                >
                  Create Your First Post
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Post Editor Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPost ? 'Edit Post' : 'Create Post'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Enter post title..."
                  className="text-lg"
                  required
                />
              </div>

              {/* Featured Image + Excerpt side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Featured Image</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFeaturedImageUpload}
                    disabled={uploadingImage}
                  />
                  {formData.featured_image && (
                    <div className="relative mt-2">
                      <img src={formData.featured_image} alt="Featured" className="h-32 w-full object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, featured_image: ""})}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        x
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <Label>Excerpt</Label>
                  <Textarea
                    value={formData.excerpt || ""}
                    onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                    placeholder="Brief summary of the post..."
                    rows={4}
                  />
                </div>
              </div>

              {/* Video URL */}
              <div>
                <Label>Video URL (optional)</Label>
                <Input
                  value={formData.video_url || ""}
                  onChange={(e) => setFormData({...formData, video_url: e.target.value})}
                  placeholder="https://youtube.com/embed/..."
                />
              </div>

              {/* TinyMCE Editor */}
              <div>
                <Label className="mb-2 block">Content</Label>
                {editDialogOpen && (
                  <Editor
                    apiKey="2nvbekek31iqbdu5q5ananwlclze012q73ffos8tt6lw349w"
                    onInit={(evt, editor) => { editorRef.current = editor; }}
                    value={formData.content}
                    onEditorChange={(content) => setFormData((prev) => ({ ...prev, content }))}
                    init={{
                      height: 500,
                      menubar: true,
                      plugins: [
                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                        'insertdatetime', 'media', 'table', 'help', 'wordcount',
                        'emoticons', 'codesample'
                      ],
                      toolbar: 'undo redo | blocks | bold italic underline strikethrough | ' +
                        'forecolor backcolor | alignleft aligncenter alignright alignjustify | ' +
                        'bullist numlist outdent indent | link image media table | ' +
                        'removeformat code fullscreen help',
                      images_upload_handler: tinymceImageUpload,
                      automatic_uploads: true,
                      image_advtab: true,
                      image_caption: true,
                      image_title: true,
                      media_live_embeds: true,
                      content_style: `
                        body {
                          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                          font-size: 16px;
                          line-height: 1.8;
                          padding: 16px;
                        }
                        img { max-width: 100%; border-radius: 8px; }
                      `,
                      promotion: false,
                      branding: false
                    }}
                  />
                )}
              </div>

              {/* Category + Tags + Publish */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="news">News</SelectItem>
                      <SelectItem value="tips">Tips & Advice</SelectItem>
                      <SelectItem value="stories">Stories</SelectItem>
                      <SelectItem value="gear">Gear Reviews</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="events">Events</SelectItem>
                      <SelectItem value="routes">Routes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tags (comma separated)</Label>
                  <Input
                    value={(formData.tags || []).join(', ')}
                    onChange={(e) => setFormData({
                      ...formData,
                      tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                    })}
                    placeholder="cycling, london, tips"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.published}
                      onChange={(e) => setFormData({...formData, published: e.target.checked})}
                      className="w-5 h-5 rounded"
                    />
                    <span className="text-sm font-medium">Publish immediately</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#c9a227] hover:bg-[#b89123] text-white px-8">
                  {editingPost ? 'Update Post' : 'Publish Post'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
