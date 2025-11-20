import Link from 'next/link';
import Image from 'next/image';

export default function BlogCard({ blog }) {
  return (
    <Link href={`/blog/${blog.slug}`} className="border rounded-lg overflow-hidden hover:shadow-lg block">
      {blog.featured_image && (
        <img src={blog.featured_image} alt={blog.title} className="w-full h-48 object-cover" />
      )}
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">{blog.title}</h2>
        <p className="text-gray-600">{blog.excerpt || 'No excerpt'}</p>
      </div>
    </Link>
  );
}