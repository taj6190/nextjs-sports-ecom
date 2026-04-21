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
      <div className="relative aspect-square bg-white border border-[#eee] group overflow-hidden shadow-sm">
        {allImages[activeIndex]?.url ? (
          <>
            <Image
              src={allImages[activeIndex].url}
              alt={allImages[activeIndex].alt || productName}
              fill
              className={cn(
                "object-contain transition-transform duration-700",
                zoomed && "scale-150 cursor-zoom-out"
              )}
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              onClick={() => setZoomed(!zoomed)}
            />
            {!zoomed && (
              <button
                onClick={() => setZoomed(true)}
                className="absolute bottom-6 right-6 w-10 h-10 bg-[#081621] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-[#ef4a23] cursor-pointer"
              >
                <FiZoomIn size={20} />
              </button>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <span className="text-sm font-bold uppercase tracking-widest italic opacity-20 italic">No Media Available</span>
          </div>
        )}

        {/* Nav Arrows */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={() => goTo(activeIndex - 1)}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-16 bg-[#081621]/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-[#ef4a23] cursor-pointer"
            >
              <FiChevronLeft size={24} />
            </button>
            <button
              onClick={() => goTo(activeIndex + 1)}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-16 bg-[#081621]/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-[#ef4a23] cursor-pointer"
            >
              <FiChevronRight size={24} />
            </button>
          </>
        )}

        {/* Status Line */}
        <div className="absolute top-0 left-0 w-1 h-full bg-[#ef4a23] opacity-20" />
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "relative w-20 h-20 flex-shrink-0 border-2 transition-all cursor-pointer",
                i === activeIndex
                  ? "border-[#ef4a23] shadow-md"
                  : "border-[#eee] hover:border-[#aaa] opacity-70 hover:opacity-100"
              )}
            >
              {img.url ? (
                <Image
                  src={img.url}
                  alt={img.alt || `${productName} - ${i + 1}`}
                  fill
                  className="object-cover p-1"
                  sizes="80px"
                />
              ) : (
                <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-400 text-[10px] font-bold">
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

