const fs = require('fs');
const path = require('path');

const filesToInvert = [
  "src/app/layout.tsx",
  "src/app/page.tsx",
  "src/app/(auth)/login/page.tsx",
  "src/app/(auth)/register/page.tsx",
  "src/app/account/page.tsx",
  "src/app/account/orders/page.tsx",
  "src/app/checkout/page.tsx",
  "src/app/deals/page.tsx",
  "src/app/product/[slug]/page.tsx",
  "src/app/shop/page.tsx",
  "src/components/cart/CartDrawer.tsx",
  "src/components/layout/Footer.tsx",
  "src/components/layout/Header.tsx",
  "src/components/layout/MobileNav.tsx",
  "src/components/product/CountdownTimer.tsx",
  "src/components/product/ProductCard.tsx",
  "src/components/product/ProductFilters.tsx",
  "src/components/product/ProductGallery.tsx",
  "src/components/product/RelatedProducts.tsx",
  "src/components/product/VariantSelector.tsx",
  "src/components/product/WhatsAppButton.tsx"
].map(f => path.join(__dirname, f.replace(/\//g, path.sep)));

const replacements = [
  { from: /bg-slate-950/g, to: "bg-[#F2F4F8]" },
  { from: /bg-slate-900\/50/g, to: "bg-white shadow-sm" },
  { from: /bg-slate-900\/70/g, to: "bg-white shadow-sm" },
  { from: /bg-slate-900\/90/g, to: "bg-white shadow-sm" },
  { from: /bg-slate-900/g, to: "bg-white" },
  { from: /bg-slate-800\/50/g, to: "bg-slate-50 border-slate-200" },
  { from: /bg-slate-800\/30/g, to: "bg-slate-100" },
  { from: /bg-slate-800/g, to: "bg-slate-100" },
  { from: /border-slate-800\/50/g, to: "border-slate-200" },
  { from: /border-slate-800\/30/g, to: "border-slate-200/50" },
  { from: /border-slate-800/g, to: "border-slate-200" },
  { from: /border-slate-700\/50/g, to: "border-slate-300" },
  { from: /border-slate-700/g, to: "border-slate-300" },
  { from: /text-white/g, to: "text-slate-900" },
  { from: /text-slate-300/g, to: "text-slate-700" },
  { from: /text-slate-400/g, to: "text-slate-600" },
  { from: /text-slate-200/g, to: "text-slate-800" },
  // Special text fix inside blue buttons not to become black
  // Wait, if it gets reverted dynamically, we just do it globally and then manually fix obvious buttons if needed.
];

// Special fixes
const buttonFixes = [
  { from: /text-slate-900 text-sm font-bold rounded-full/g, to: "text-white text-sm font-bold rounded-full" }, // Cart badge
  { from: /bg-blue-500 text-slate-900/g, to: "bg-blue-500 text-white" },
  { from: /text-slate-900 font-medium rounded-xl hover:from-blue-700/g, to: "text-white font-medium rounded-xl hover:from-blue-700" },
  { from: /text-slate-900 text-sm font-medium rounded-xl hover:from-blue/g, to: "text-white text-sm font-medium rounded-xl hover:from-blue" }
];

for (const file of filesToInvert) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    for (const rep of Object.values(replacements)) {
      content = content.replace(rep.from, rep.to);
    }
    
    for (const fix of Object.values(buttonFixes)) {
      content = content.replace(fix.from, fix.to);
    }

    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  } else {
    console.warn(`File not found: ${file}`);
  }
}
