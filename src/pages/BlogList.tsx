import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { blogAPI, Blog, getImageUrl } from '../utils/api';
import {
    Search,
    Filter,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Calendar,
    Tag,
    User,
    Plus,
    ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Card, { CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function BlogList() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [toggling, setToggling] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        isPublished: '',
    });

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const response = await blogAPI.getAll({
                page,
                limit: 12,
                search: filters.search || undefined,
                category: filters.category || undefined,
                isPublished: filters.isPublished ? filters.isPublished === 'true' : undefined,
            });

            if (response.success) {
                setBlogs(response.data);
                setTotal(response.pagination.total);
                setTotalPages(response.pagination.totalPages);
            }
        } catch (error) {
            console.error('Failed to fetch blogs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, [page, filters]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this blog?')) return;

        setDeleting(id);
        try {
            await blogAPI.delete(id);
            fetchBlogs();
        } catch (error) {
            alert('Failed to delete blog');
        } finally {
            setDeleting(null);
        }
    };

    const handleTogglePublish = async (id: string) => {
        setToggling(id);
        try {
            await blogAPI.togglePublish(id);
            fetchBlogs();
        } catch (error) {
            alert('Failed to toggle publish status');
        } finally {
            setToggling(null);
        }
    };

    const handleSearch = (value: string) => {
        setFilters({ ...filters, search: value });
        setPage(1);
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters({ ...filters, [key]: value });
        setPage(1);
    };

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
                        <p className="text-gray-600 mt-1">Manage all your blog posts in one place</p>
                    </div>
                    <Link to="/create">
                        <Button variant="primary" size="lg">
                            <Plus className="w-5 h-5 mr-2" />
                            Create New Blog
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <Card>
                    <CardBody>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search blogs by title, content, or tags..."
                                        value={filters.search}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <select
                                    value={filters.isPublished}
                                    onChange={(e) => handleFilterChange('isPublished', e.target.value)}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">All Status</option>
                                    <option value="true">Published</option>
                                    <option value="false">Draft</option>
                                </select>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Blog Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                ) : blogs.length === 0 ? (
                    <Card>
                        <CardBody>
                            <div className="text-center py-12">
                                <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No blogs found</h3>
                                <p className="text-gray-600 mb-6">Try adjusting your filters or create a new blog</p>
                                <Link to="/create">
                                    <Button variant="primary">Create Your First Blog</Button>
                                </Link>
                            </div>
                        </CardBody>
                    </Card>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {blogs.map((blog) => (
                                <Card key={blog._id} hover className="flex flex-col overflow-hidden">
                                    {/* Image */}
                                    <div className="relative w-full h-48 overflow-hidden">
                                        <img
                                            src={getImageUrl(blog.image)}
                                            alt={blog.title}
                                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                        />
                                        <div className="absolute top-3 right-3 flex gap-2">
                                            <Badge variant={blog.isPublished ? 'success' : 'secondary'}>
                                                {blog.isPublished ? 'Published' : 'Draft'}
                                            </Badge>
                                        </div>
                                    </div>

                                    <CardBody className="flex-1 flex flex-col">
                                        {/* Category */}
                                        <div className="mb-3">
                                            <Badge variant="primary">
                                                <Tag className="w-3 h-3 mr-1" />
                                                {blog.category}
                                            </Badge>
                                        </div>

                                        {/* Title */}
                                        <Link to={`/view/${blog._id}`}>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                                                {blog.title}
                                            </h3>
                                        </Link>

                                        {/* Excerpt */}
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                                            {blog.excerpt}
                                        </p>

                                        {/* Meta Info */}
                                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 pb-4 border-b border-gray-200">
                                            <div className="flex items-center gap-1.5">
                                                <User className="w-4 h-4" />
                                                <span className="truncate">{blog?.author?.name}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-4 h-4" />
                                                <span>{new Date(blog.date).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        {/* Tags */}
                                        {blog.tags && blog.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mb-4">
                                                {blog.tags.slice(0, 3).map((tag) => (
                                                    <Badge key={tag} variant="secondary" size="sm">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                                {blog.tags.length > 3 && (
                                                    <Badge variant="secondary" size="sm">
                                                        +{blog.tags.length - 3}
                                                    </Badge>
                                                )}
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 mt-auto">
                                            <Link to={`/view/${blog._id}`} className="flex-1">
                                                <Button variant="outline" size="sm" className="w-full">
                                                    <ExternalLink className="w-4 h-4 mr-2" />
                                                    View
                                                </Button>
                                            </Link>
                                            <Link to={`/edit/${blog._id}`}>
                                                <Button variant="ghost" size="sm">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                           {blog.isPublished && <button
                                                onClick={() => handleTogglePublish(blog._id)}
                                                disabled={toggling === blog._id}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                                                title={blog.isPublished ? 'Unpublish' : 'Publish'}
                                            >
                                                {toggling === blog._id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : blog.isPublished ? (
                                                    <EyeOff className="w-4 h-4" />
                                                ) : (
                                                    <Eye className="w-4 h-4" />
                                                )}
                                            </button>}
                                            <button
                                                onClick={() => handleDelete(blog._id)}
                                                disabled={deleting === blog._id}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                title="Delete"
                                            >
                                                {deleting === blog._id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <Card>
                                <CardBody>
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="text-sm text-gray-600">
                                            Showing {(page - 1) * 12 + 1} to {Math.min(page * 12, total)} of {total} blogs
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPage(page - 1)}
                                                disabled={page === 1}
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </Button>
                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                    let pageNum;
                                                    if (totalPages <= 5) {
                                                        pageNum = i + 1;
                                                    } else if (page <= 3) {
                                                        pageNum = i + 1;
                                                    } else if (page >= totalPages - 2) {
                                                        pageNum = totalPages - 4 + i;
                                                    } else {
                                                        pageNum = page - 2 + i;
                                                    }
                                                    return (
                                                        <button
                                                            key={pageNum}
                                                            onClick={() => setPage(pageNum)}
                                                            className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                                                                page === pageNum
                                                                    ? 'bg-blue-600 text-white'
                                                                    : 'text-gray-600 hover:bg-gray-100'
                                                            }`}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPage(page + 1)}
                                                disabled={page === totalPages}
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        )}
                    </>
                )}
            </div>
        </Layout>
    );
}
