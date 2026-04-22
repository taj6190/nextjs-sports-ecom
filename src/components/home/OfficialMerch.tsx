import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

export default function OfficialMerch() {
  const galleryImages = [
    {
      id: 1,
      src: "https://images.unsplash.com/photo-1543132220-4bf3de6e10ae?q=80&w=800&auto=format&fit=crop",
      alt: "Women's Football Performance",
      label: "Women's Elite",
      className: "col-span-7 row-span-2"
    },
    {
      id: 2,
      src: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=800&auto=format&fit=crop",
      alt: "Pro Player Training",
      label: "Men's Pro",
      className: "col-span-5 row-span-1"
    },
    {
      id: 3,
      src: "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=800&auto=format&fit=crop",
      alt: "Jersey Detail",
      label: "Tech-Fit",
      className: "col-span-5 row-span-1"
    }
  ];

  return (
    <section className="relative bg-white py-24 md:py-32 overflow-hidden">
      {/* Decorative Branding */}
      <div className="absolute top-10 right-10 rotate-90 text-[100px] font-black opacity-[0.02] select-none pointer-events-none uppercase italic tracking-tighter">
        Velocity // 2024
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          
          {/* Text Content: Now on the right for variety and premium feel */}
          <div className="lg:col-span-5 order-2 lg:order-2">
            <div className="inline-flex items-center gap-4 mb-8">
              <span className="h-0.5 w-12 bg-[#ef4a23]" />
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[#ef4a23]">Global Standard // Merchandising</span>
            </div>

            <h2 className="text-5xl md:text-7xl font-[1000] text-[#081621] uppercase italic tracking-tighter leading-[0.85] mb-10">
              The Official <br />
              Merch of <br />
              <span className="text-[#ef4a23]">BFF National</span>
            </h2>
            
            <div className="space-y-6 mb-12">
              <p className="text-lg font-bold text-[#081621] uppercase leading-tight italic">
                "More than just fabric — it's a pulse we share."
              </p>
              <p className="text-[13px] md:text-sm font-medium text-[#081621]/50 uppercase tracking-widest leading-relaxed border-l-2 border-[#eee] pl-6">
                Engineered for the elite. Whether on the field or in the stands, 
                wear the symbol of national pride. Surgical-grade textiles 
                optimized for the humid climate of South Asia. 
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/shop" 
                className="group relative inline-flex items-center justify-center bg-[#081621] text-white px-12 py-6 text-[12px] font-black uppercase italic tracking-[0.2em] overflow-hidden transition-all hover:bg-[#ef4a23]"
              >
                <span className="relative z-10 flex items-center gap-3">
                  Deploy Jersey <FiArrowRight className="group-hover:translate-x-2 transition-transform duration-300" />
                </span>
              </Link>
              <Link 
                href="/shop" 
                className="inline-flex items-center justify-center border-2 border-[#eee] text-[#081621] px-12 py-6 text-[12px] font-black uppercase italic tracking-[0.2em] hover:border-[#081621] transition-all"
              >
                View Catalog
              </Link>
            </div>
          </div>
          
          {/* Advanced Image Grid */}
          <div className="lg:col-span-7 order-1 lg:order-1 w-full">
            <div className="grid grid-cols-12 grid-rows-2 gap-4 h-[600px] md:h-[750px]">
              {galleryImages.map((img) => (
                <div key={img.id} className={`${img.className} relative group overflow-hidden bg-[#f0f0f0]`}>
                  <img 
                    src={img.src} 
                    alt={img.alt} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000 ease-in-out"
                  />
                  
                  {/* Tactical Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#081621] to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
                  
                  <div className="absolute bottom-6 left-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                    <p className="text-[9px] font-black text-[#ef4a23] uppercase tracking-[0.3em] mb-1">Asset_{img.id.toString().padStart(2, '0')}</p>
                    <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">{img.label}</h4>
                  </div>

                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Stats Divider */}
      <div className="mt-32 border-t border-[#eee]">
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-[#eee]">
           {[
             { label: "Durability", value: "99.8%" },
             { label: "Wick-Rate", value: "Surgical" },
             { label: "Deployment", value: "Global" },
             { label: "Auth Code", value: "BFF-PRO" }
           ].map((stat, i) => (
             <div key={i} className="py-10 px-8 text-center md:text-left">
                <p className="text-[9px] font-bold text-[#081621]/30 uppercase tracking-[0.4em] mb-2">{stat.label}</p>
                <p className="text-2xl font-black text-[#081621] uppercase italic tracking-tighter">{stat.value}</p>
             </div>
           ))}
        </div>
      </div>
    </section>
  );
}
