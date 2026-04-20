"use client";

import { FaWhatsapp } from "react-icons/fa";

interface WhatsAppButtonProps {
  productName: string;
  productUrl: string;
  price?: string;
  className?: string;
  variant?: "icon" | "full" | "floating";
}

export default function WhatsAppButton({
  productName,
  productUrl,
  price,
  className = "",
  variant = "full",
}: WhatsAppButtonProps) {
  const phone = "8801XXXXXXXXX"; // Replace with your WhatsApp number

  const getMessage = () => {
    let msg = `Hi! I'm interested in this product:\n\n*${productName}*`;
    if (price) msg += `\nPrice: ${price}`;
    msg += `\n\nProduct Link: ${productUrl}`;
    msg += `\n\nPlease let me know more details.`;
    return encodeURIComponent(msg);
  };

  const whatsappUrl = `https://wa.me/${phone}?text=${getMessage()}`;

  if (variant === "floating") {
    return (
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all hover:scale-110 ${className}`}
        title="Chat on WhatsApp"
      >
        <FaWhatsapp size={28} className="text-slate-900" />
      </a>
    );
  }

  if (variant === "icon") {
    return (
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`p-3 bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 hover:text-green-300 rounded-xl transition-all ${className}`}
        title="Contact via WhatsApp"
      >
        <FaWhatsapp size={20} />
      </a>
    );
  }

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-slate-900 font-medium rounded-xl transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/40 ${className}`}
    >
      <FaWhatsapp size={20} />
      Chat on WhatsApp
    </a>
  );
}
