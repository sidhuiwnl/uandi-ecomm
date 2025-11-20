'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Editor } from '@tinymce/tinymce-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogs, updateBlog } from '@/store/slices/blogSlice';

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useDispatch();
  const editorRef = useRef(null);
  const { list, loading, error } = useSelector((state) => state.blog);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (list.length === 0) {
      dispatch(fetchBlogs());
    } else {
      const blog = list.find((b) => String(b.id) === String(params.id));
      if (blog) setFormData(blog);
    }
  }, [dispatch, list, params.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const content = editorRef.current ? editorRef.current.getContent() : formData.content;
    try {
      await dispatch(updateBlog({ id: params.id, ...formData, content })).unwrap();
      router.push('/admin/console/content-management/blogs');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  if (!formData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Edit Blog</h1>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          value={formData.excerpt}
          onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="url"
          value={formData.featured_image}
          onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <Editor
          apiKey="69txzb3hudbnwn0l9hzu5uymdiglu3e9ex4tsr4q7rpno200"
          onInit={(evt, editor) => (editorRef.current = editor)}
          initialValue={formData.content}
          init={{
            height: 500,
            menubar: true,
            plugins: ['advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 'code', 'fullscreen'],
            toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist | link image | code',
          }}
        />
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="hidden">Hidden</option>
        </select>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Update Blog
        </button>
      </form>
    </div>
  );
}
