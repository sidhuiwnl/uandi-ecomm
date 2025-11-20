const API_BASE = process.env.NEXT_PUBLIC_API_URL;

/* ===========================
   GET ALL VIDEOS
=========================== */
export const fetchAllVideos = async () => {
  const res = await fetch(`${API_BASE}/videos`);
  if (!res.ok) throw new Error('Failed to fetch videos');
  return res.json();
};

/* ===========================
   GET VIDEOS FOR ONE PRODUCT
=========================== */
export const fetchVideosByProduct = async (productId) => {
  const res = await fetch(`${API_BASE}/videos/product/${productId}`);
  if (!res.ok) throw new Error('Failed to fetch product videos');
  return res.json();
};

/* ===========================
   UPLOAD REEL (video file)
   Uses Busboy on backend
   Uses FormData here
   Supports progress callback
=========================== */
export const createVideo = ({ product_id, title, file }, onProgress) => {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("product_id", product_id);
    form.append("title", title);
    form.append("video", file);

    console.log('Creating video with product_id:', product_id, 'title:', title, 'file:', file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}/videos/upload`);

    // 👉 Progress support
    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        const percent = event.lengthComputable
          ? Math.round((event.loaded / event.total) * 100)
          : 0;
        onProgress(percent);
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300)
        resolve(JSON.parse(xhr.responseText));
      else reject(new Error(xhr.responseText || "Upload error"));
    };

    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(form);
  });
};

/* ===========================
   UPDATE REEL (title only)
=========================== */
export const updateVideo = async (id, data) => {
  const res = await fetch(`${API_BASE}/videos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update");
  return res.json();
};

export const replaceVideo = (video_id, file, onProgress) => {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('video', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE}/videos/replace/${video_id}`);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        const pct = event.lengthComputable ? Math.round((event.loaded / event.total) * 100) : 0;
        onProgress(pct);
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText));
      else reject(new Error(xhr.responseText || 'Replace failed'));
    };

    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(form);
  });
};

/* ===========================
   SOFT DELETE (recommended)
=========================== */
export const softDeleteVideo = async (id) => {
  const res = await fetch(`${API_BASE}/videos/soft/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete");
  return res.json();
};

/* ===========================
   HARD DELETE (remove from R2)
=========================== */
export const hardDeleteVideo = async (id) => {
  const res = await fetch(`${API_BASE}/videos/hard/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to hard delete");
  return res.json();
};
