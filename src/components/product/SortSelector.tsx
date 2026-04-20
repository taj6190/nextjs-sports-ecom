"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export default function SortSelector({ initialSort }: { initialSort: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSort = useCallback(
    (sortValue: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (sortValue !== "newest") {
        params.set("sort", sortValue);
      } else {
        params.delete("sort");
      }
      // Reset page to 1 on sort
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  return (
    <div className="flex items-center gap-2">
      <span className="text-[13px] text-slate-500 hidden sm:inline-block">Sort By:</span>
      <select
        value={initialSort}
        onChange={(e) => handleSort(e.target.value)}
        className="h-8 border border-transparent bg-slate-100/80 hover:bg-slate-200/50 rounded-md text-[13px] text-slate-800 px-3 pr-8 outline-none focus:border-slate-300 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23111%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:9px_9px] bg-no-repeat bg-[right_10px_center]"
      >
        <option value="newest">Default</option>
        <option value="price_asc">Price (Low &gt; High)</option>
        <option value="price_desc">Price (High &gt; Low)</option>
      </select>
    </div>
  );
}
