'use client';
import { useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import AddEditForm from '@/components/AddEditForm';

export default function EditReel(){
  const { id } = useParams();
  const { list } = useSelector(s => s.videos);
  const video = list.find(v => v.video_id === parseInt(id));
  if (!video) return <p>Reel not found</p>;
  return <AddEditForm video={video} />;
}