"use client";

import { useCallback, useState, useRef } from "react";
import Image from "next/image";
import { FiUploadCloud, FiX, FiImage } from "react-icons/fi";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import type { IImage } from "@/types";

interface ImageUploaderProps {
  images: IImage[];
  onChange: (images: IImage[]) => void;
  folder?: string;
  maxImages?: number;
}

export default function ImageUploader({
  images,
  onChange,
  folder = "electromart/products",
  maxImages = 10,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const remaining = maxImages - images.length;
      if (remaining <= 0) {
        toast.error(`Maximum ${maxImages} images allowed`);
        return;
      }

      const toUpload = Array.from(files).slice(0, remaining);
      setUploading(true);

      try {
        const formData = new FormData();
        toUpload.forEach((file) => formData.append("files", file));
        formData.append("folder", folder);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const json = await res.json();
        if (json.success) {
          onChange([...images, ...json.data]);
          toast.success(`${json.data.length} image(s) uploaded`);
        } else {
          toast.error(json.error || "Upload failed");
        }
      } catch {
        toast.error("Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [images, onChange, folder, maxImages]
  );

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {/* Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files); }}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
          dragOver
            ? "border-blue-500 bg-blue-500/5"
            : "border-slate-700 hover:border-slate-600 hover:bg-slate-800/30"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleUpload(e.target.files)}
          className="hidden"
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <FiUploadCloud className="text-slate-500" size={32} />
            <p className="text-sm text-slate-400">
              Drag & drop images here, or <span className="text-blue-400">click to browse</span>
            </p>
            <p className="text-xs text-slate-600">
              {images.length}/{maxImages} images • JPG, PNG, WebP
            </p>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((img, i) => (
            <div key={i} className="relative group w-24 h-24 rounded-xl overflow-hidden border border-slate-700">
              {img.url ? (
                <Image src={img.url} alt={img.alt || ""} fill className="object-cover" sizes="96px" />
              ) : (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                  <FiImage className="text-slate-600" size={20} />
                </div>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <FiX size={12} />
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-blue-500 text-white text-[9px] font-bold rounded">
                  MAIN
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
