import Link from 'next/link';

export default function AdminVideoCard({ video, onDelete }) {
  return (
    <div className="border rounded p-3 flex gap-3 items-start">
      <div className="w-32 flex-shrink-0">
        <video src={video.reel_url} className="w-full h-auto" controls/>
      </div>
      <div className="flex-1">
        <h3 className="font-semibold">{video.title || 'Untitled'}</h3>
        <p className="text-sm text-gray-600">{video.product_name}</p>
        <div className="mt-2 flex gap-2">
          <Link href={`/admin/console/content-management/reels/${video.video_id}/edit`} className="px-3 py-1 bg-yellow-500 text-white rounded">Edit</Link>
          <button onClick={()=>onDelete(video.video_id)} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
        </div>
      </div>
    </div>
  );
}