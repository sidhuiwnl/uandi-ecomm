// File: components/AddEditForm.js
// Updated edit form that shows current video, toggle "Replace", uploads new file and calls replaceVideo.
// Assumes you have redux thunks addVideo and editVideo; replaceVideo is imported from api client above.

'use client';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addVideo, editVideo } from '@/store/slices/videoSlice';
import { replaceVideo } from '@/store/slices/api/client';
import { useRouter } from 'next/navigation';

export default function AddEditForm({ video, productId }) {
  const isEdit = !!video;
  const dispatch = useDispatch();
  const router = useRouter();

  const [title, setTitle] = useState(video?.title || '');
  const [file, setFile] = useState(null);
  const [replaceMode, setReplaceMode] = useState(false);
  const [progress, setProgress] = useState(0);
  const [product, setProduct] = useState(productId || video?.product_id || '');

  // minimal product list load (optional)
  const [products, setProducts] = useState([]);
  useEffect(() => {
    fetch('http://localhost:5000/products').then(r => r.ok ? r.json() : []).then(setProducts).catch(()=>{});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!product) return alert('Choose product');

    if (!isEdit) {
      if (!file) return alert('Please choose a video file');
      await dispatch(addVideo({ product_id: product, title, file }));
    } else {
      // update title
      await dispatch(editVideo({ id: video.video_id, data: { title } }));
      // replace file if requested
      if (replaceMode) {
        if (!file) return alert('Please choose a new video file to replace');
        setProgress(0);
        await replaceVideo(video.video_id, file, (pct) => setProgress(pct));
      }
    }

    router.push('/admin/console/content-management/reels');
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">{isEdit ? 'Edit Reel' : 'Add Reel'}</h2>

      <label className="block mb-2">Product</label>
      <select value={product} onChange={(e) => setProduct(e.target.value)} className="w-full p-2 border rounded mb-4">
        <option value="">Select product</option>
        {products?.data?.map(p => <option key={p.product_id} value={p.product_id}>{p.product_name}</option>)}
      </select>

      <label className="block mb-2">Title</label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 border rounded mb-4" />

      {isEdit && (
        <div className="mb-4">
          <label className="font-medium">Current Video</label>
          <video src={video.reel_url} className="w-full rounded mt-2" controls />
          <label className="flex items-center gap-2 mt-3">
            <input type="checkbox" checked={replaceMode} onChange={() => setReplaceMode(!replaceMode)} />
            Replace this video
          </label>
        </div>
      )}

      {(!isEdit || replaceMode) && (
        <div className="mb-4">
          <label className="block font-medium mb-1">{isEdit ? 'Upload New Video' : 'Video File'}</label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files[0])}
            required={!isEdit}
            className="w-full"
          />
          {progress > 0 && <p className="mt-2 text-sm">Upload progress: {progress}%</p>}
        </div>
      )}

      <button className="w-full bg-blue-600 text-white py-2 rounded">
        {isEdit ? 'Update Reel' : 'Create Reel'}
      </button>
    </form>
  );
}
