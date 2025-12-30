import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { blogAPI, Blog, getImageUrl } from '../utils/api';
import { ArrowLeft, Calendar, Tag, User, Loader2, Edit, Eye, EyeOff } from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';

export default function BlogView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBlog();
    }
  }, [id]);

  const fetchBlog = async () => {
    setLoading(true);
    try {
      const response = await blogAPI.getById(id!);
      if (response.success) {
        setBlog(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch blog:', error);
      alert('Failed to load blog');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async () => {
    if (!blog) return;
    setToggling(true);
    try {
      await blogAPI.togglePublish(blog._id);
      fetchBlog();
    } catch (error) {
      alert('Failed to toggle publish status');
    } finally {
      setToggling(false);
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

  if (!blog) {
    return (
      <Layout>
        <Card className="p-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Blog not found</h2>
          <Button onClick={() => navigate('/')}>Go Back to Blog List</Button>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Blog List</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTogglePublish}
              isLoading={toggling}
            >
              {blog.isPublished ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Unpublish
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Publish
                </>
              )}
            </Button>
            <Link to={`/edit/${blog._id}`}>
              <Button variant="primary" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit Blog
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Content Card */}
        <Card>
          {/* Featured Image */}
       <div className="relative w-full h-96 overflow-hidden rounded-t-xl">
  <img
    src={getImageUrl(blog.image)}
    alt={blog.title}
    className="w-full h-full object-cover"
  />

  {/* Brand Overlay */}
  <div className="absolute inset-0 bg-[#041b2a] opacity-70" />

  <div className="absolute inset-0 flex items-center justify-center p-8">
    <div className="flex flex-col items-center text-center max-w-4xl">

      <div className="flex items-center justify-center gap-3 mb-4">
        <Badge variant={blog.isPublished ? 'success' : 'secondary'}>
          {blog.isPublished ? 'Published' : 'Draft'}
        </Badge>
        <Badge variant="primary">{blog.category}</Badge>
      </div>

      <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
        {blog.title}
      </h1>

      <div className="flex items-center justify-center gap-6 text-white/90">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5" />
          <span className="font-medium">{blog?.author?.name}</span>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          <span>
            {new Date(blog.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>

    </div>
  </div>
</div>


          {/* Author Section */}
          {/* <div className="p-8 border-b border-gray-200">
            <div className="flex items-start gap-4">
              <img
                src={blog.author.avatar}
                alt={blog.author.name}
                className="w-16 h-16 rounded-full border-2 border-gray-200"
              />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{blog.author.name}</h3>
                {blog.author.bio && (
                  <p className="text-gray-600 text-sm">{blog.author.bio}</p>
                )}
              </div>
            </div>
          </div> */}

          {/* Blog Content */}
          <div className="p-8">
            <div
              className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:text-gray-700 prose-blockquote:border-blue-600 prose-blockquote:bg-blue-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-lg"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="px-8 pb-8">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="w-5 h-5 text-gray-400" />
                {blog.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* CTA Section */}
          {blog.ctaTitle && blog.ctaLink && (
            <div className="px-8 pb-8">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{blog.ctaTitle}</h3>
                {blog.ctaDesc && (
                  <p className="text-gray-700 mb-4">{blog.ctaDesc}</p>
                )}
                <a
                  href={`https://pravraha.com/${blog.ctaLink}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button variant="primary">
                    {blog.ctaButtonTitle || 'Learn More'}
                  </Button>
                </a>
              </div>
            </div>
          )}
        </Card>

        {/* Meta Information */}
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium text-gray-900">Created:</span>{' '}
              {new Date(blog.createdAt).toLocaleString()}
            </div>
            <div>
              <span className="font-medium text-gray-900">Last Updated:</span>{' '}
              {new Date(blog.updatedAt).toLocaleString()}
            </div>
            <div>
              <span className="font-medium text-gray-900">Slug:</span>{' '}
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">{blog.slug}</code>
            </div>
            <div>
              <span className="font-medium text-gray-900">Meta Description:</span>{' '}
              {blog.metaDescription}
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}

