import React, { useState, useRef, useEffect } from "react";
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
import { motion } from "framer-motion";

// Wysi editor wrapper — initializes the CDN-loaded Wysi on a textarea
function WysiEditor({ value, onChange, visible }) {
  const textareaRef = useRef(null);
  const editorWrapperRef = useRef(null);
  const wysiInitialized = useRef(false);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [imageSize, setImageSize] = useState('full'); // small, medium, large, full

  useEffect(() => {
    if (!visible || !textareaRef.current || wysiInitialized.current) return;
    if (typeof window.Wysi === 'undefined') return;

    const timer = setTimeout(() => {
      try {
        window.Wysi({
          el: textareaRef.current,
          height: 400,
          autoGrow: true,
          tools: [
            'format', '|',
            'bold', 'italic', 'underline', 'strike', '|',
            { label: 'Alignment', items: ['alignLeft', 'alignCenter', 'alignRight', 'alignJustify'] }, '|',
            'ul', 'ol', '|',
            'indent', 'outdent', '|',
            'link', 'image', 'hr', 'quote', '|',
            'removeFormat'
          ],
          onChange: (content) => {
            onChange(content);
          }
        });
        wysiInitialized.current = true;
        // Store the wrapper so we can insert content
        editorWrapperRef.current = textareaRef.current?.closest('.wysi-wrapper') || textareaRef.current?.parentElement;
      } catch (err) {
        console.error('Wysi init error:', err);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [visible, onChange]);

  // Reset when dialog closes
  useEffect(() => {
    if (!visible) {
      wysiInitialized.current = false;
    }
  }, [visible]);

  const SIZE_STYLES = {
    small:  'width:25%;max-width:200px;',
    medium: 'width:50%;max-width:400px;',
    large:  'width:75%;max-width:600px;',
    full:   'width:100%;max-width:100%;',
  };

  // Insert HTML into the Wysi editable area
  const insertHtml = (html) => {
    const wrapper = editorWrapperRef.current || textareaRef.current?.parentElement;
    const editable = wrapper?.querySelector('[contenteditable="true"]') || wrapper?.querySelector('iframe');

    if (editable && editable.tagName === 'IFRAME') {
      const doc = editable.contentDocument || editable.contentWindow.document;
      doc.execCommand('insertHTML', false, html);
    } else if (editable) {
      editable.focus();
      document.execCommand('insertHTML', false, html);
    } else {
      const current = textareaRef.current?.value || '';
      textareaRef.current.value = current + html;
      onChange(current + html);
    }
    textareaRef.current?.dispatchEvent(new Event('input', { bubbles: true }));
  };

  // Upload image to Supabase and insert <img> into the editor
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const sizeStyle = SIZE_STYLES[imageSize] || SIZE_STYLES.full;
      insertHtml(`<img src="${file_url}" alt="uploaded image" style="${sizeStyle}border-radius:8px;display:block;margin:8px 0;" />`);
    } catch (err) {
      alert("Image upload failed: " + (err.message || err));
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div>
      <textarea
        ref={textareaRef}
        defaultValue={value || ""}
        style={{ minHeight: '400px', width: '100%' }}
      />
      {/* Image upload toolbar */}
      <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Size picker */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Size:</span>
            {[
              { key: 'small', label: 'S', title: 'Small (25%)' },
              { key: 'medium', label: 'M', title: 'Medium (50%)' },
              { key: 'large', label: 'L', title: 'Large (75%)' },
              { key: 'full', label: 'Full', title: 'Full width (100%)' },
            ].map(({ key, label, title }) => (
              <button
                key={key}
                type="button"
                title={title}
                onClick={() => setImageSize(key)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  imageSize === key
                    ? 'bg-[#c9a227] text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />

          {/* Upload button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <>
                <span className="w-4 h-4 border-2 border-gray-400 border-t-gray-700 rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Upload Image
              </>
            )}
          </button>
          <span className="text-xs text-gray-500 dark:text-gray-400">Pick a size, then upload</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminBlogManagement() {
  const queryClient = useQueryClient();
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

              {/* Wysi Rich Text Editor */}
              <div>
                <Label className="mb-2 block">Content</Label>
                <WysiEditor
                  value={formData.content}
                  onChange={(content) => setFormData((prev) => ({ ...prev, content }))}
                  visible={editDialogOpen}
                />
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
