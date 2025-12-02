"use client";

import { useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { verifyUser, refreshToken } from '@/store/authSlice';
import { mergeCarts, fetchCart } from '@/store/slices/cartSlice';
import Swal from 'sweetalert2';

function GoogleCallbackInner() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const navigatedRef = useRef(false);

  const resolveRedirect = (role) => {
    let intended = null;

    try {
      const qp = searchParams.get('redirect');
      if (qp) intended = qp;
    } catch (_) {}

    try {
      const cookies = document.cookie.split(';').map(c => c.trim());
      const found = cookies.find(c => c.startsWith('postAuthRedirect='));
      if (found) intended = decodeURIComponent(found.split('=')[1] || '');
    } catch (_) {}

    if (!intended) {
      try { intended = localStorage.getItem('postAuthRedirect'); } catch (_) {}
    }

    try {
      document.cookie = 'postAuthRedirect=; Max-Age=0; path=/';
      localStorage.removeItem('postAuthRedirect');
    } catch (_) {}

    if (intended) return intended;

    switch (role) {
      case 'superadmin': return '/superadmin/dashboard';
      case 'admin': return '/admin/dashboard';
      case 'customer': return '/';
      default: return '/dashboard';
    }
  };

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Google authentication failed: ${error}`,
        confirmButtonColor: '#2563eb'
      });
      router.push('/login');
      return;
    }

    const runFlow = async () => {
      try {
        // ----------------------------
        // STEP 1: Verify User
        // ----------------------------
        const verifiedUser = await dispatch(verifyUser()).unwrap();

        // ----------------------------
        // STEP 2: Merge Cart Immediately
        // ----------------------------
        try {
          console.log("Merging carts for user:", verifiedUser);
          let localCart = JSON.parse(localStorage.getItem('cart')) || [];
          console.log("Local cart before merge:", localCart);
          await dispatch(mergeCarts(verifiedUser)).unwrap();
          console.log("Fetching updated cart for user:", verifiedUser);
          await dispatch(fetchCart()).unwrap();
          console.log("Cart merge and fetch completed.");
        } catch (mergeErr) {
          console.warn("Cart merge/fetch failed:", mergeErr);
        }

        // ----------------------------
        // STEP 3: Redirect
        // ----------------------------
        if (!navigatedRef.current) {
          router.replace(resolveRedirect(verifiedUser?.role));
          navigatedRef.current = true;
        }

        // ----------------------------
        // STEP 4: Notify
        // ----------------------------
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Logged in with Google',
          confirmButtonColor: '#2563eb'
        });

      } catch (err) {
        // If user is not verified due to token issue — try refreshing
        if (err === "Invalid access token") {
          try {
            await dispatch(refreshToken()).unwrap();
            return runFlow(); // retry after refresh
          } catch (refreshErr) {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Google authentication failed: Unable to refresh token',
              confirmButtonColor: '#2563eb'
            });
            router.push('/');
            return;
          }
        }

        // Any other error
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `Google authentication failed: ${err}`,
          confirmButtonColor: '#2563eb'
        });
        router.push('/');
      }
    };

    runFlow();
  }, [dispatch, router, searchParams]);

  return null;
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <GoogleCallbackInner />
    </Suspense>
  );
}
