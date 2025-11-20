'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await fetch(`http://localhost:5000/blogs/slug/${params.slug}`);
        
        if (!res.ok) {
          if (res.status === 404) {
            setError('Blog post not found');
          } else {
            throw new Error('Failed to fetch blog');
          }
          return;
        }
        
        const data = await res.json();
        setBlog(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) fetchBlog();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Blog post not found'}
        </div>
        <button
          onClick={() => router.push('/blogs')}
          className="mt-4 text-blue-600 hover:underline"
        >
          ← Back to blogs
        </button>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 py-12">
      <button
        onClick={() => router.push('/blogs')}
        className="mb-6 text-blue-600 hover:underline flex items-center"
      >
        ← Back to blogs
      </button>

      {blog.featured_image && (
        <div className="mb-8 rounded-lg overflow-hidden">
          <img
            src={blog.featured_image}
            alt={blog.title}
            className="w-full h-96 object-cover"
          />
        </div>
      )}

      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{blog.title}</h1>
        
        <div className="flex items-center text-gray-600 text-sm">
          <time dateTime={blog.created_at}>
            {new Date(blog.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </time>
          {blog.updated_at && blog.updated_at !== blog.created_at && (
            <span className="ml-4">
              Updated: {new Date(blog.updated_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          )}
        </div>
      </header>

      {blog.excerpt && (
        <div className="mb-8 text-xl text-gray-700 italic border-l-4 border-blue-600 pl-4">
          {blog.excerpt}
        </div>
      )}

      <div 
        className="prose prose-lg max-w-none blog-content"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />

      <style jsx global>{`
        .blog-content {
          font-size: 16px;
          line-height: 1.8;
          color: #333;
        }
        .blog-content h1 {
          font-size: 2.5em;
          font-weight: bold;
          margin-top: 1em;
          margin-bottom: 0.5em;
          line-height: 1.2;
        }
        .blog-content h2 {
          font-size: 2em;
          font-weight: bold;
          margin-top: 1em;
          margin-bottom: 0.5em;
          line-height: 1.3;
        }
        .blog-content h3 {
          font-size: 1.5em;
          font-weight: bold;
          margin-top: 1em;
          margin-bottom: 0.5em;
          line-height: 1.4;
        }
        .blog-content h4 {
          font-size: 1.25em;
          font-weight: bold;
          margin-top: 1em;
          margin-bottom: 0.5em;
        }
        .blog-content p {
          margin-bottom: 1em;
          line-height: 1.8;
        }
        .blog-content ul, .blog-content ol {
          margin-bottom: 1em;
          padding-left: 2em;
        }
        .blog-content li {
          margin-bottom: 0.5em;
        }
        .blog-content img {
          max-width: 100%;
          height: auto;
          margin: 1.5em 0;
          border-radius: 0.5rem;
        }
        .blog-content a {
          color: #2563eb;
          text-decoration: underline;
        }
        .blog-content a:hover {
          color: #1d4ed8;
        }
        .blog-content blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1em;
          margin: 1.5em 0;
          font-style: italic;
          color: #555;
        }
        .blog-content pre {
          background-color: #f3f4f6;
          padding: 1em;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1em 0;
        }
        .blog-content code {
          background-color: #f3f4f6;
          padding: 0.2em 0.4em;
          border-radius: 0.25rem;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
        }
        .blog-content pre code {
          background-color: transparent;
          padding: 0;
        }
        .blog-content table {
          border-collapse: collapse;
          width: 100%;
          margin: 1.5em 0;
        }
        .blog-content table th,
        .blog-content table td {
          border: 1px solid #ddd;
          padding: 0.75em;
          text-align: left;
        }
        .blog-content table th {
          background-color: #f3f4f6;
          font-weight: bold;
        }
        .blog-content strong {
          font-weight: bold;
        }
        .blog-content em {
          font-style: italic;
        }
      `}</style>
    </article>
  );
}