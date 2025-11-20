'use client';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProfile, updateProfile, uploadProfilePhoto } from '@/store/profileSlice';

export default function ProfileDetails() {
  const dispatch = useDispatch();
  const { profile, loading, error } = useSelector(s => s.profile);

  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    date_of_birth: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  // Auto-refresh profile on focus/visibility and periodically to keep last login fresh
  useEffect(() => {
    const refreshIfVisible = () => {
      if (document.visibilityState === 'visible') {
        dispatch(getProfile());
      }
    };

    const onFocus = () => refreshIfVisible();
    const onVisibilityChange = () => refreshIfVisible();

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);

    // Light polling every 60s while tab is visible
    const intervalId = setInterval(refreshIfVisible, 60000);

    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      clearInterval(intervalId);
    };
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setForm({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone_number: profile.phone_number || '',
        date_of_birth: profile.date_of_birth ? profile.date_of_birth.split('T')[0] : ''
      });
      // Reset preview if profile picture changes from backend
      setPreviewUrl(null);
    }
  }, [profile]);

  const handleChange = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const onSave = async () => {
    await dispatch(updateProfile(form));
    setEdit(false);
  };

  const onCancel = () => {
    if (profile) {
      setForm({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone_number: profile.phone_number || '',
        date_of_birth: profile.date_of_birth ? profile.date_of_birth.split('T')[0] : ''
      });
    }
    setEdit(false);
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const onUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    await dispatch(uploadProfilePhoto(selectedFile));
    setUploading(false);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation Bar */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Account Settings</h1>
              </div>
            </div>
            {/* Edit button moved to Personal Info section */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">

          {/* Profile Header Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
                  <img 
                    src={previewUrl || profile?.profile_picture_url || `https://i.pravatar.cc/300?u=${profile?.email}`} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Always allow image upload */}
                <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={onFileChange} 
                    className="hidden"
                  />
                </label>
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {profile?.first_name} {profile?.last_name}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">{profile?.email}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-emerald-700 bg-emerald-100 rounded-full">
                        {profile?.role_name || 'Customer'}
                      </span>
                      <span className="text-xs text-gray-500">
                        Member since {profile ? formatDate(profile.created_at) : '-'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Show upload status independently */}
                {selectedFile && (
                  <div className="mt-4 flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-700 flex-1 truncate">{selectedFile.name}</span>
                    <button 
                      onClick={onUpload} 
                      disabled={uploading}
                      className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                <p className="text-sm text-gray-500 mt-1">Update your personal details and information</p>
              </div>
              {/* Edit/Save/Cancel Buttons Here */}
              {edit ? (
                <div className="flex items-center gap-3">
                  <button 
                    onClick={onCancel} 
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={onSave} 
                    className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setEdit(true)} 
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Edit Profile
                </button>
              )}
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input 
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm transition-all ${
                      edit 
                        ? 'border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white' 
                        : 'border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed'
                    } outline-none`}
                    value={form.first_name} 
                    onChange={e => handleChange('first_name', e.target.value)} 
                    disabled={!edit}
                    placeholder="Enter first name"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input 
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm transition-all ${
                      edit 
                        ? 'border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white' 
                        : 'border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed'
                    } outline-none`}
                    value={form.last_name} 
                    onChange={e => handleChange('last_name', e.target.value)} 
                    disabled={!edit}
                    placeholder="Enter last name"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input 
                    type="tel"
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm transition-all ${
                      edit 
                        ? 'border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white' 
                        : 'border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed'
                    } outline-none`}
                    value={form.phone_number} 
                    onChange={e => handleChange('phone_number', e.target.value)} 
                    disabled={!edit}
                    placeholder="+91 00000 00000"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input 
                    type="date" 
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm transition-all ${
                      edit 
                        ? 'border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white' 
                        : 'border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed'
                    } outline-none`}
                    value={form.date_of_birth} 
                    onChange={e => handleChange('date_of_birth', e.target.value)} 
                    disabled={!edit}
                  />
                </div>

                {/* Email Address (Read-only) */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input 
                      type="email"
                      className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-600 cursor-not-allowed outline-none"
                      value={profile?.email || ''}
                      disabled
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500">Your email address cannot be changed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Activity */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Account Activity</h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Account Created</p>
                    <p className="text-xs text-gray-500">{profile ? formatDate(profile.created_at) : '-'}</p>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last Login</p>
                    <p className="text-xs text-gray-500">{profile?.last_login_at ? formatDate(profile.last_login_at) : '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-red-900">Error</h4>
                  <p className="text-sm text-red-700 mt-1">{error.message || JSON.stringify(error)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}