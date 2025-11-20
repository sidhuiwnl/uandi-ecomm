'use client';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadAll } from '@/store/slices/videoSlice';
import VideoCard from '@/components/VideoCard';

export default function ReelsPage(){
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector(s => s.videos);

  useEffect(()=>{ dispatch(loadAll()); },[dispatch]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Shoppable Reels</h1>

      {loading && <p className="text-center">Loading...</p>}
      {error && <p className="text-red-600 text-center">{error}</p>}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map(video => <VideoCard key={video.video_id} video={video} />)}
      </div>

      {!loading && list.length === 0 && <p className="text-center text-gray-500 mt-10">No reels available.</p>}
    </div>
  );
}