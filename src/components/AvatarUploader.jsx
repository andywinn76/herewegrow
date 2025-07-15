import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import imageCompression from "browser-image-compression";
import getCroppedImg from "../utils/cropImage";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

export default function AvatarUploader({ user, onUploadComplete }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [uploading, setUploading] = useState(false);

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Explicit MIME type check
      if (!file.type.startsWith("image/")) {
        alert("Only image files are allowed.");
        return;
      }

      const imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl);
    }
  };

  const handleUpload = async () => {
    try {
      setUploading(true);
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const compressed = await imageCompression(croppedBlob, {
        maxWidthOrHeight: 256,
        maxSizeMB: 0.5,
      });
      const filePath = `${user.id}.jpg`;
      const { error } = await supabase.storage
        .from("avatars")
        .upload(filePath, compressed, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      onUploadComplete(data.publicUrl);
      setImageSrc(null);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {!imageSrc && (
        <label className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition cursor-pointer inline-block">
          Choose Image
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      )}

      {imageSrc && (
        <>
          <div className="relative w-full h-64 bg-gray-100">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              {uploading ? "Uploading..." : "Upload Avatar"}
            </button>
            <button
              onClick={() => setImageSrc(null)}
              disabled={uploading}
              className="px-4 py-2 border rounded hover:bg-gray-100 transition"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function readFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result), false);
    reader.readAsDataURL(file);
  });
}
