import slugifyLib from "slugify";

export function slugify(text: string): string {
  return slugifyLib(text, { lower: true, strict: true, trim: true });
}

export function formatPrice(price: number): string {
  return `৳${price.toLocaleString("en-BD")}`;
}

export function generateSKU(productName: string, combination: Record<string, string>): string {
  const prefix = productName
    .split(" ")
    .map((w) => w[0]?.toUpperCase())
    .join("")
    .slice(0, 4);
  const suffix = Object.values(combination)
    .map((v) => v.replace(/\s+/g, "").toUpperCase().slice(0, 3))
    .join("-");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${suffix}-${rand}`;
}

export function generateOrderNumber(): string {
  const date = new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `EM-${y}${m}${d}-${rand}`;
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function optimizeCloudinaryUrl(url: string, width?: number, height?: number): string {
  if (!url || typeof url !== "string" || !url.includes("res.cloudinary.com")) return url;

  // Prevent double optimization
  if (url.includes("/f_auto,q_auto")) return url;

  const parts = url.split("/upload/");
  if (parts.length !== 2) return url;

  const transformations = [
    "f_auto",
    "q_auto",
    width ? `w_${width}` : "",
    height ? `h_${height}` : "",
    "c_limit"
  ].filter(Boolean).join(",");

  return `${parts[0]}/upload/${transformations}/${parts[1]}`;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function getDiscountPercentage(price: number, discountPrice: number): number {
  if (!discountPrice || discountPrice >= price) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
}
