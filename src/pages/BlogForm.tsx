import { useState, useEffect, FormEvent } from 'react';
import Layout from '../components/Layout';
import { blogAPI, BlogFormData, getImageUrl } from '../utils/api';
import { Save, Loader2, ArrowLeft, Eye, FileText, Monitor, Edit2, Upload, Trash2, Cross } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import BlogEditor from '../components/BlogEditor';
import Card, { CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

interface BlogFormProps {
    blogId?: string;
}

export default function BlogForm({ blogId }: BlogFormProps) {
    const isEdit = !!blogId;
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [formData, setFormData] = useState<BlogFormData>({
        title: '',
        metaDescription: '',
        slug: '',
        excerpt: '',
        image: '',
        category: '',
        author: {
            name: '',
            avatar: '',
            bio: '',
        },
        date: new Date().toISOString().split('T')[0],
        content: '',
        tags: [],
        ctaTitle: '',
        ctaLink: '',
        ctaDesc: '',
        ctaButtonTitle: '',
        seoScripts: [],
        isPublished: false,
    });
    const [tagInput, setTagInput] = useState('');
    const [seoInput, setSeoInput] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const navigate = useNavigate();

    useEffect(() => {
        if (isEdit) {
            fetchBlog();
        }
    }, [blogId]);

    const fetchBlog = async () => {
        setLoading(true);
        try {
            const response = await blogAPI.getById(blogId!);
            if (response.success) {
                const blog = response.data;
                setFormData({
                    title: blog.title,
                    metaDescription: blog.metaDescription,
                    slug: blog.slug,
                    excerpt: blog.excerpt,
                    image: blog.image,
                    category: blog.category,
                    author: blog.author,
                    date: blog.date.split('T')[0],
                    content: blog.content,
                    tags: blog.tags,
                    ctaTitle: blog.ctaTitle || '',
                    ctaLink: blog.ctaLink || '',
                    ctaDesc: blog.ctaDesc || '',
                    ctaButtonTitle: blog.ctaButtonTitle || '',
                    seoScripts: blog.seoScripts || [],
                    isPublished: blog.isPublished,
                });
                // Set image preview from existing image
                if (blog.image) {
                    setImagePreview(getImageUrl(blog.image));
                }
            }
        } catch (error) {
            alert('Failed to fetch blog');
        } finally {
            setLoading(false);
        }
    };

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const handleTitleChange = (title: string) => {
        setFormData({ ...formData, title });
        if (!isEdit || !formData.slug) {
            setFormData({ ...formData, title, slug: generateSlug(title) });
        }
    };

    const addTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
            setTagInput('');
        }
    };

    const removeTag = (tag: string) => {
        setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
            // Update formData with file (will be sent as FormData)
            setFormData({ ...formData, image: file });
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview('');
        // Clear image from formData
        setFormData({ ...formData, image: '' });
    };

    const handleSubmit = async (e: FormEvent, publish: boolean) => {
        e.preventDefault();
        setSaving(true);

        try {
            const dataToSubmit = {
                ...formData,
                isPublished: publish,
                // Use imageFile if available, otherwise use existing image string
                image: imageFile || formData.image
            };

            if (isEdit) {
                await blogAPI.update(blogId!, dataToSubmit);
                alert('Blog updated successfully');
            } else {
                await blogAPI.create(dataToSubmit);
                alert(publish ? 'Blog published successfully' : 'Blog saved as draft');
            }

            navigate("/");
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Failed to save blog');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/"
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {isEdit ? 'Edit Blog' : 'Create New Blog'}
                            </h1>
                            <p className="text-gray-600 mt-1">Fill in the details to create your blog post</p>
                        </div>
                    </div>
                    <Button
                        variant={showPreview ? 'primary' : 'outline'}
                        onClick={() => setShowPreview(!showPreview)}
                    >
                        {showPreview ? (
                            <>
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit Mode
                            </>
                        ) : (
                            <>
                                <Monitor className="w-4 h-4 mr-2" />
                                Preview
                            </>
                        )}
                    </Button>
                </div>

                {showPreview ? (
                    /* Preview Mode */
                    <div className="space-y-6">
                        <Card>
                            {/* Featured Image */}
                            <div className="relative w-full h-96 overflow-hidden rounded-t-xl">
                                {imagePreview || formData.image ? (
                                    <img
                                        src={imagePreview || getImageUrl(formData.image as string)}
                                        alt={formData.title || 'Blog Preview'}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                        <span className="text-gray-400">No image provided</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-8">
                                    <div className="flex items-center gap-3 mb-4">
                                        {formData.category && (
                                            <Badge variant="primary">{formData.category}</Badge>
                                        )}
                                        <Badge variant="secondary">Preview</Badge>
                                    </div>
                                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                                        {formData.title || 'Untitled Blog Post'}
                                    </h1>
                                    {formData.excerpt && (
                                        <p className="text-xl text-gray-100 mb-6">{formData.excerpt}</p>
                                    )}
                                    {formData.author.name && (
                                        <div className="flex items-center gap-2 text-white/90">
                                            {formData.author.avatar && (
                                                <img
                                                    src={formData.author.avatar}
                                                    alt={formData.author.name}
                                                    className="w-8 h-8 rounded-full border-2 border-white/50"
                                                />
                                            )}
                                            <span className="font-medium">{formData.author.name}</span>
                                            {formData.date && (
                                                <>
                                                    <span className="mx-2">•</span>
                                                    <span>
                                                        {new Date(formData.date).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                        })}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>


                            {/* Author Section */}
                            {formData.author.name && (
                                <div className="p-8 border-b border-gray-200">
                                    <div className="flex items-start gap-4">
                                        {formData.author.avatar && (
                                            <img
                                                src={formData.author.avatar}
                                                alt={formData.author.name}
                                                className="w-16 h-16 rounded-full border-2 border-gray-200"
                                            />
                                        )}
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-1">{formData.author.name}</h3>
                                            {formData.author.bio && (
                                                <p className="text-gray-600 text-sm">{formData.author.bio}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Blog Content */}
                            <div className="p-8">
                                {formData.content ? (
                                    <div
                                        className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:text-gray-700 prose-blockquote:border-blue-600 prose-blockquote:bg-blue-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-lg"
                                        dangerouslySetInnerHTML={{ __html: formData.content }}
                                    />
                                ) : (
                                    <p className="text-gray-400 italic">No content yet. Start writing in the editor!</p>
                                )}
                            </div>

                            {/* Tags */}
                            {formData.tags && formData.tags.length > 0 && (
                                <div className="px-8 pb-8">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {formData.tags.map((tag) => (
                                            <Badge key={tag} variant="secondary">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* CTA Section */}
                            {formData.ctaTitle && formData.ctaLink && (
                                <div className="px-8 pb-8">
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{formData.ctaTitle}</h3>
                                        {formData.ctaDesc && (
                                            <p className="text-gray-700 mb-4">{formData.ctaDesc}</p>
                                        )}
                                        <Button variant="primary">
                                            {formData.ctaButtonTitle || 'Learn More'}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Card>

                        {/* Action Buttons */}
                        <Card>
                            <CardBody>
                                <div className="flex items-center justify-between gap-4">
                                    <Link to="/">
                                        <Button variant="ghost">Cancel</Button>
                                    </Link>
                                    <div className="flex items-center gap-3">
                                        <Button
                                            variant="secondary"
                                            onClick={(e) => handleSubmit(e as any, false)}
                                            isLoading={saving}
                                        >
                                            <Save className="w-4 h-4 mr-2" />
                                            Save as Draft
                                        </Button>
                                        <Button
                                            variant="primary"
                                            onClick={(e) => handleSubmit(e as any, true)}
                                            isLoading={saving}
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            Publish
                                        </Button>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                ) : (
                    /* Edit Mode */
                    <form className="space-y-6">
                        <Card>
                            <CardBody>
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
                                    <FileText className="w-5 h-5" />
                                    Basic Information
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Title <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.title}
                                            onChange={(e) => handleTitleChange(e.target.value)}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter blog title"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Slug <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.slug}
                                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="blog-url-slug"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Meta Description <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            required
                                            value={formData.metaDescription}
                                            onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                                            rows={2}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="SEO meta description"
                                            maxLength={300}
                                        />
                                        <p className="text-sm text-gray-500 mt-1">{formData?.metaDescription?.length}/300</p>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Excerpt <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            required
                                            value={formData.excerpt}
                                            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                            rows={3}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Brief summary of the blog"
                                            maxLength={500}
                                        />
                                        <p className="text-sm text-gray-500 mt-1">{formData?.excerpt?.length}/500</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Category <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Technology, Business, etc."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Featured Image <span className="text-red-500">*</span>
                                        </label>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-4">
                                                <label className="flex-1 cursor-pointer">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                        className="hidden"
                                                        required={!isEdit && !imageFile && !formData.image}
                                                    />
                                                    <div className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors">
                                                        <Upload className="w-5 h-5 text-gray-400" />
                                                        <span className="text-gray-700">
                                                            {imageFile
                                                                ? imageFile.name
                                                                : (formData.image && typeof formData.image === 'string')
                                                                    ? 'Current image (click to change)'
                                                                    : 'Choose image file'}
                                                        </span>
                                                    </div>
                                                </label>
                                            </div>
                                            {(imagePreview || formData.image) && (
                                                <div className="relative">
                                                    <img
                                                        src={imagePreview || getImageUrl(formData.image as string)}
                                                        alt="Preview"
                                                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleRemoveImage}
                                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                                                        title="Remove image"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 mt-2">
                                            {isEdit
                                                ? 'Upload a new image to replace the existing one. Leave empty to keep current image.'
                                                : 'Upload an image file for your blog post (required for publishing)'}
                                        </p>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Add a tag and press Enter"
                                            />
                                            <Button type="button" variant="secondary" onClick={addTag}>
                                                Add
                                            </Button>
                                        </div>
                                        {formData.tags && formData?.tags?.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {formData.tags.map((tag) => (
                                                    <Badge key={tag} variant="primary">
                                                        {tag}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeTag(tag)}
                                                            className="ml-2 hover:text-blue-900"
                                                        >
                                                            ×
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardBody>
                        </Card>

                        <Card>
                            <CardBody>
                                <h2 className="text-lg font-semibold text-gray-900 mb-6">Author Information</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Author Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.author?.name}
                                            onChange={(e) =>
                                                setFormData({ ...formData, author: { ...formData.author, name: e.target.value } })
                                            }
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="John Doe"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Author Avatar URL <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="url"
                                            required
                                            value={formData.author?.avatar}
                                            onChange={(e) =>
                                                setFormData({ ...formData, author: { ...formData.author, avatar: e.target.value } })
                                            }
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="https://example.com/avatar.jpg"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Author Bio</label>
                                        <textarea
                                            value={formData.author?.bio}
                                            onChange={(e) =>
                                                setFormData({ ...formData, author: { ...formData.author, bio: e.target.value } })
                                            }
                                            rows={2}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Brief bio about the author"
                                        />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>

                        <Card>
                            <CardBody>
                                <h2 className="text-lg font-semibold text-gray-900 mb-6">Content</h2>
                                <BlogEditor
                                    value={formData.content}
                                    onChange={(html: string) => setFormData({ ...formData, content: html })}
                                />
                            </CardBody>
                        </Card>

                         <Card>
           <CardBody>
  {/* Header */}
  <div className="flex items-center justify-between mb-2">
    <h2 className="font-semibold text-lg">
      SEO Scripts (JSON-LD)
    </h2>

    <Badge variant="secondary">
      {formData?.seoScripts?.length || 0} Scripts
    </Badge>
  </div>

  {/* Info box */}
  <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
    <p className="font-medium mb-1"> Structured Data for SEO</p>
    <p>
      Add <code className="bg-blue-100 px-1 rounded">application/ld+json</code>{' '}
      scripts only. These are used by Google for rich results
      (FAQ, Breadcrumbs, Article, etc).
    </p>
  </div>

  {/* Textarea */}
  <label className="block text-sm font-medium mb-1">
    Paste JSON-LD Script
  </label>

  <textarea
    value={seoInput}
    onChange={(e) => setSeoInput(e.target.value)}
    placeholder={`<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Your blog title"
}
</script>`}
    className="w-full min-h-[160px] resize-y rounded-md border border-gray-300 bg-white p-3 font-mono text-sm
               focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
  />

  {/* Actions */}
  <div className="flex items-center justify-between mt-3">
    <span className="text-xs text-gray-500">
      You can add multiple scripts (one per schema)
    </span>

    <Button
      type="button"
      disabled={!seoInput.trim()}
      onClick={() => {
        if (!seoInput.trim()) return;
        setFormData((p) => ({
          ...p,
          seoScripts: [...p.seoScripts, seoInput],
        }));
        setSeoInput('');
      }}
    >
      + Add Script
    </Button>
  </div>

  {/* Empty state */}
  {(!formData?.seoScripts || formData.seoScripts.length === 0) && (
    <div className="mt-4 rounded-md border border-dashed p-4 text-center text-sm text-gray-500">
      No SEO scripts added yet.
      <br />
      <span className="text-xs">
        Example: BlogPosting, FAQPage, BreadcrumbList
      </span>
    </div>
  )}

  {/* Script list */}
  {formData?.seoScripts?.map((script, i) => (
    <div
      key={i}
      className="mt-4 rounded-md border bg-gray-50 p-3 relative"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-600">
          Script #{i + 1} • JSON-LD
        </span>

        <button
          type="button"
          className="text-red-500 hover:text-red-700"
          onClick={() =>
            setFormData((p) => ({
              ...p,
              seoScripts: p.seoScripts.filter((_, x) => x !== i),
            }))
          }
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Code preview */}
      <pre className="text-xs max-h-48 overflow-auto whitespace-pre-wrap text-gray-800">
        {script}
      </pre>
    </div>
  ))}

  {/* Footer hint */}
  <p className="mt-4 text-xs text-gray-400">
    <Cross /> These scripts will be injected into the page <code>&lt;head&gt;</code>.
    Invalid JSON-LD may be ignored by search engines.
  </p>
</CardBody>
            </Card>


                        <Card>
                            <CardBody>
                                <h2 className="text-lg font-semibold text-gray-900 mb-6">Call to Action (Optional)</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">CTA Title</label>
                                        <input
                                            type="text"
                                            value={formData.ctaTitle}
                                            onChange={(e) => setFormData({ ...formData, ctaTitle: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Get Started Today"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">CTA Link</label>
                                        <input
                                            type="url"
                                            value={formData.ctaLink}
                                            onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="https://example.com/signup"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">CTA Description</label>
                                        <textarea
                                            value={formData.ctaDesc}
                                            onChange={(e) => setFormData({ ...formData, ctaDesc: e.target.value })}
                                            rows={2}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Description for the CTA"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            CTA Button Text
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.ctaButtonTitle}
                                            onChange={(e) => setFormData({ ...formData, ctaButtonTitle: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Learn More"
                                        />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                       

                        <Card>
                            <CardBody>
                                <div className="flex items-center justify-between gap-4">
                                    <Link to="/">
                                        <Button variant="ghost">Cancel</Button>
                                    </Link>
                                    <div className="flex items-center gap-3">
                                        <Button
                                            variant="secondary"
                                            onClick={(e) => handleSubmit(e, false)}
                                            isLoading={saving}
                                        >
                                            <Save className="w-4 h-4 mr-2" />
                                            Save as Draft
                                        </Button>
                                        <Button
                                            variant="primary"
                                            onClick={(e) => handleSubmit(e, true)}
                                            isLoading={saving}
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            Publish
                                        </Button>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </form>
                )}
            </div>
        </Layout>
    );
}
