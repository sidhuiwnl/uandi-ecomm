'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { verifyUser, refreshToken } from '@/store/authSlice';
import { mergeCarts } from '@/store/slices/cartSlice';
import Swal from 'sweetalert2';

export default function GoogleCallback() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Google authentication failed: ${error}`,
        confirmButtonColor: '#2563eb',
      });
      router.push('/login');
      return;
    }

    dispatch(verifyUser())
      .unwrap()
      .then(async (verifiedUser) => {
        // verifiedUser is the latest user object from backend
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Logged in with Google',
          confirmButtonColor: '#2563eb',
        });
        // Merge guest cart items into user's cart (best-effort)
        try { await dispatch(mergeCarts()).unwrap(); } catch (mergeErr) { console.warn('Failed to merge cart after Google login:', mergeErr); }

        // Post-auth redirect override from localStorage (e.g. checkout intent)
        let override = null;
        try { override = localStorage.getItem('postAuthRedirect'); } catch (_) {}
        if (override) {
          try { localStorage.removeItem('postAuthRedirect'); } catch (_) {}
          router.push(override);
          return;
        }

        // Role-based fallback
        switch (verifiedUser.role) {
          case 'customer': router.push('/'); break;
          case 'superadmin': router.push('/superadmin/dashboard'); break;
          case 'admin': router.push('/admin/dashboard'); break;
          default: router.push('/dashboard');
        }
      })
      .catch((err) => {
        console.error('Verify user error:', err);
        if (err === 'Invalid access token') {
          dispatch(refreshToken())
            .unwrap()
            .then(() => dispatch(verifyUser()).unwrap())
            .then(async (verifiedUser) => {
              Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Logged in with Google',
                confirmButtonColor: '#2563eb',
              });

              // Merge guest cart items into user's cart (best-effort)
              try { await dispatch(mergeCarts()).unwrap(); } catch (mergeErr) { console.warn('Failed to merge cart after Google login (refresh path):', mergeErr); }

              // Post-auth redirect override
              let override = null;
              try { override = localStorage.getItem('postAuthRedirect'); } catch (_) {}
              if (override) {
                try { localStorage.removeItem('postAuthRedirect'); } catch (_) {}
                router.push(override);
                return;
              }

              switch (verifiedUser.role) {
                case 'customer': router.push('/'); break;
                case 'superadmin': router.push('/superadmin/dashboard'); break;
                case 'admin': router.push('/admin/dashboard'); break;
                default: router.push('/dashboard');
              }
            })
            .catch((refreshErr) => {
              console.error('Refresh token error:', refreshErr);
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Google authentication failed: Unable to refresh token',
                confirmButtonColor: '#2563eb',
              });
              router.push('/login');
            });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `Google authentication failed: ${err}`,
            confirmButtonColor: '#2563eb',
          });
          router.push('/login');
        }
      });
  }, [dispatch, router, searchParams]);

  return <div>Loading...</div>;
}
