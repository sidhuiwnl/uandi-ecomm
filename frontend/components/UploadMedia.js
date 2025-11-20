"use client";
import { useState } from "react";
import axios from "axios";

export default function UploadMedia() {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post("http://localhost:5000/upload", formData);
    setUrl(res.data.url);
  };

  return (
    <div style={{ padding: "20px" }}>
      <input
        type="file"
        accept="image/*,video/*"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={handleUpload}>Upload</button>

      {url && (
        <div style={{ marginTop: "20px" }}>
          {url.endsWith(".mp4") ? (
            <video src={url} controls width="300" />
          ) : (
            <img src={url} alt="Uploaded" width="300" />
          )}
        </div>
      )}
    </div>
  );
}
