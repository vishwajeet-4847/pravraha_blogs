import { useParams } from 'react-router-dom';
import BlogForm from './BlogForm';

export default function EditBlog() {
  const { id } = useParams<{ id: string }>();

  return <BlogForm blogId={id} />;
}
