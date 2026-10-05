'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Image as ImageIcon, Eye, Edit3, Loader2 } from 'lucide-react';
import { Post } from '@/lib/db/schema';
import { marked } from 'marked';
import { createPost, updatePost } from '@/lib/actions';

interface PostEditorProps {
  post?: Post;
}

export function PostEditor({ post }: PostEditorProps) {
  const [title, setTitle] = useState(post?.title || '');
  const [slug, setSlug] = useState(post?.slug || '');
  const [summary, setSummary] = useState(post?.summary || '');
  const [content, setContent] = useState(post?.content || '');
  const [coverImageUrl, setCoverImageUrl] = useState(post?.coverImageUrl || '');
  const [status, setStatus] = useState<'draft' | 'published'>(post?.status || 'draft');

  const [previewMode, setPreviewMode] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePreviewToggle = async () => {
    if (!previewMode) {
      const parsed = await marked.parse(content || '*No content yet.*', {
        breaks: true,
        gfm: true,
      });
      setPreviewHtml(parsed);
    }
    setPreviewMode(!previewMode);
  };

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const fd = new FormData();
      fd.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: fd,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to upload image');
      }

      const data = await res.json();
      const imageUrl = data.url;

      // Insert image markdown snippet into textarea cursor position
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const snippet = `\n![${file.name.replace(/\.[^/.]+$/, '')}](${imageUrl})\n`;
        const updated = content.substring(0, start) + snippet + content.substring(end);
        setContent(updated);
      } else {
        setContent((prev) => `${prev}\n![${file.name}](${imageUrl})\n`);
      }

      if (!coverImageUrl) {
        setCoverImageUrl(imageUrl);
      }
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pb-24">
      <header className="sticky top-0 z-10 border-b border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin"
              className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 flex items-center gap-1 text-xs"
            >
              <ArrowLeft size={14} /> Back
            </Link>
            <span className="text-neutral-300 dark:text-neutral-700">|</span>
            <span className="text-xs font-mono text-neutral-500">
              {post ? 'Edit Post' : 'New Post'}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handlePreviewToggle}
              className="p-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors flex items-center gap-1 border border-neutral-200 dark:border-neutral-800 rounded px-2.5 bg-white dark:bg-neutral-900 cursor-pointer"
            >
              {previewMode ? (
                <>
                  <Edit3 size={13} /> Edit
                </>
              ) : (
                <>
                  <Eye size={13} /> Preview
                </>
              )}
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={async () => {
                setIsSaving(true);
                const fd = new FormData();
                if (post) {
                  fd.append('id', post.id);
                }
                fd.append('title', title);
                fd.append('slug', slug);
                fd.append('summary', summary);
                fd.append('content', content);
                fd.append('coverImageUrl', coverImageUrl);
                fd.append('status', status);
                try {
                  if (post) {
                    await updatePost(fd);
                  } else {
                    await createPost(fd);
                  }
                } catch (err: any) {
                  alert(err.message || 'Error saving post');
                  setIsSaving(false);
                }
              }}
              className="px-3.5 py-1.5 rounded text-xs font-medium bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSaving && <Loader2 size={13} className="animate-spin" />}
              {status === 'published' ? 'Publish' : 'Save Draft'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Editing Area */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Post title..."
                className="w-full text-2xl sm:text-3xl font-bold tracking-tight bg-transparent border-none outline-none placeholder:text-neutral-300 dark:placeholder:text-neutral-700"
              />
            </div>

            {previewMode ? (
              <div
                className="prose dark:prose-invert prose-neutral max-w-none pt-4 text-sm leading-relaxed min-h-[400px] border-t border-neutral-200 dark:border-neutral-800"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            ) : (
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your story using Markdown (drag images here)..."
                  rows={20}
                  className="w-full p-4 text-sm font-mono leading-relaxed bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 resize-y"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files?.[0]) {
                      handleImageUpload(e.dataTransfer.files[0]);
                    }
                  }}
                />

                <div className="flex items-center justify-between text-xs text-neutral-400 mt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleImageUpload(e.target.files[0]);
                        }
                      }}
                    />
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 cursor-pointer"
                    >
                      {isUploading ? (
                        <Loader2 size={13} className="animate-spin mr-1" />
                      ) : (
                        <ImageIcon size={13} className="mr-1" />
                      )}
                      Upload Image to R2
                    </button>
                  </div>
                  <span>Markdown supported</span>
                </div>
              </div>
            )}
          </div>

          {/* Metadata Sidebar */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 font-mono">
                Post Settings
              </h3>

              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                  className="w-full text-xs px-2.5 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Custom Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="leave empty to auto-generate"
                  className="w-full text-xs font-mono px-2.5 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Summary / Excerpt
                </label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={3}
                  placeholder="Brief synopsis for feed and SEO..."
                  className="w-full text-xs px-2.5 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Cover Image URL
                </label>
                <input
                  type="text"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://... or /api/media/..."
                  className="w-full text-xs font-mono px-2.5 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 bg-transparent focus:outline-none"
                />
                {coverImageUrl && (
                  <div className="mt-2 rounded overflow-hidden border border-neutral-200 dark:border-neutral-800 max-h-28">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={coverImageUrl}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
