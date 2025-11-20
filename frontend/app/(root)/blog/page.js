'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogs } from '@/store/slices/blogSlice';

export default function BlogListPage() {
  const dispatch = useDispatch();
  const { list: blogs, loading, error } = useSelector((state) => state.blog);

  useEffect(() => {
    dispatch(fetchBlogs({ status: 'published' }));
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading blogs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!blogs.length) {
    return (
      <div className="text-center py-20 text-gray-600 text-lg">
        No published blogs available.
      </div>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">Latest Blogs</h1>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {blogs.map((blog) => (
          <article key={blog.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
            {blog.featured_image && (
              <img
                src={blog.featured_image}
                alt={blog.title}
                className="w-full h-56 object-cover rounded-t-lg"
              />
            )}
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-3">{blog.title}</h2>
              <p className="text-gray-700 mb-4 line-clamp-3">{blog.excerpt}</p>
              <Link
                href={`/blog/${blog.slug}`}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Read More →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
