"use client";

import { cn } from "@/lib/utils";
import type { IImage } from "@/types";
import Image from "next/image";
import { useState } from "react";
import { FiChevronLeft, FiChevronRight, FiZoomIn } from "react-icons/fi";

interface ProductGalleryProps {
  images: IImage[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const allImages = images.length > 0 ? images : [{ url: "", publicId: "", alt: productName }];

  const goTo = (index: number) => {
    if (index < 0) index = allImages.length - 1;
    if (index >= allImages.length) index = 0;
    setActiveIndex(index);
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 group">
        {allImages[activeIndex]?.url ? (
          <>
            <Image
              src={allImages[activeIndex].url}
              alt={allImages[activeIndex].alt || productName}
              fill
              className={cn(
                "object-contain transition-transform duration-500",
                zoomed && "scale-150 cursor-zoom-out"
              )}
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              onClick={() => setZoomed(!zoomed)}
            />
            {!zoomed && (
              <button
                onClick={() => setZoomed(true)}
                className="absolute bottom-4 right-4 p-2 bg-black/50 backdrop-blur-sm rounded-lg text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <FiZoomIn size={18} />
              </button>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-700">
            <span className="text-4xl">📷</span>
          </div>
        )}

        {/* Nav Arrows */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={() => goTo(activeIndex - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-xl text-slate-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 cursor-pointer"
            >
              <FiChevronLeft size={20} />
            </button>
            <button
              onClick={() => goTo(activeIndex + 1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-xl text-slate-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 cursor-pointer"
            >
              <FiChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer",
                i === activeIndex
                  ? "border-blue-500 ring-2 ring-blue-500/20"
                  : "border-slate-300 hover:border-slate-600"
              )}
            >
              {img.url ? (
                <Image
                  src={img.url}
                  alt={img.alt || `${productName} - ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs">
                  N/A
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
