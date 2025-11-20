'use client';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadAll, removeVideo } from '@/store/slices/videoSlice';
import AdminVideoCard from '@/components/AdminVideoCard';
import Link from 'next/link';

export default function AdminReels(){
  const dispatch = useDispatch();
  const { list, loading } = useSelector(s=>s.videos);

  useEffect(()=>{ dispatch(loadAll()); },[dispatch]);

  const onDelete = async (id) => {
    if (!confirm('Delete this reel?')) return;
    await dispatch(removeVideo({ id }));
    dispatch(loadAll());
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Reels</h1>
        <Link href="/admin/console/content-management/reels/create" className="bg-green-600 text-white px-4 py-2 rounded">Add New Reel</Link>
      </div>

      {loading ? <p>Loading...</p> : (
        <div className="space-y-3">
          {list.map(v => <AdminVideoCard key={v.video_id} video={v} onDelete={onDelete} />)}
        </div>
      )}
    </div>
  );
}