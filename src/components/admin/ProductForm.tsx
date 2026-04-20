"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ImageUploader from "./ImageUploader";
import VariantEngine from "./VariantEngine";
import type { VariantData } from "./VariantEngine";
import type { IImage, ICategory, IAttribute } from "@/types";
import { FiPlus, FiX, FiCheck, FiInfo, FiTag, FiBox, FiImage, FiSettings, FiGlobe, FiList } from "react-icons/fi";
import toast from "react-hot-toast";
import type { ISpecificationGroup } from "@/types";

interface ProductFormProps {
  initialData?: {
    _id?: string;
    name: string;
    description: string;
    brand: string;
    category: string;
    images: IImage[];
    attributes: { attributeId: string; name: string; values: string[] }[];
    variants: VariantData[];
    isFeatured: boolean;
    tags: string[];
    seo: { title: string; description: string };
    slug?: string;
    specifications?: ISpecificationGroup[];
  };
}

export default function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [allAttributes, setAllAttributes] = useState<IAttribute[]>([]);
  const [activeTab, setActiveTab] = useState("general");

  // Determine if it's a simple product vs variable product initially
  const hasInitialAttributes = (initialData?.attributes?.length || 0) > 0;
  
  // Find default variant for simple product pricing
  const defaultVariant = !hasInitialAttributes && initialData?.variants?.length === 1 
    ? initialData.variants[0] 
    : { sku: "", price: 0, discountPrice: 0, stock: 0, combination: {}, images: [], isActive: true };

  const [form, setForm] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    brand: initialData?.brand || "",
    category: initialData?.category || "",
    isFeatured: initialData?.isFeatured || false,
    tags: initialData?.tags || [],
    seo: initialData?.seo || { title: "", description: "" },
    isActive: true, // Assuming true by default
  });

  // Simple Product Pricing/Inventory State
  const [simpleInventory, setSimpleInventory] = useState({
    price: defaultVariant.price || "",
    discountPrice: defaultVariant.discountPrice || "",
    sku: defaultVariant.sku || "",
    stock: defaultVariant.stock || "",
  });

  const [images, setImages] = useState<IImage[]>(initialData?.images || []);
  const [selectedAttributes, setSelectedAttributes] = useState<
    { attributeId: string; name: string; values: string[] }[]
  >(initialData?.attributes || []);
  const [variants, setVariants] = useState<VariantData[]>(initialData?.variants || []);
  const [tagInput, setTagInput] = useState("");

  // Specifications state (StarTech-style grouped key-value)
  const [specifications, setSpecifications] = useState<ISpecificationGroup[]>(
    initialData?.specifications || []
  );

  const hasVariants = selectedAttributes.length > 0;

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then((d) => d.success && setCategories(d.data));
    fetch("/api/attributes").then((r) => r.json()).then((d) => d.success && setAllAttributes(d.data));
  }, []);

  const addAttribute = (attr: IAttribute) => {
    if (selectedAttributes.find((a) => a.attributeId === attr._id)) return;
    setSelectedAttributes([
      ...selectedAttributes,
      { attributeId: attr._id, name: attr.name, values: [] },
    ]);
  };

  const removeAttribute = (attrId: string) => {
    setSelectedAttributes(selectedAttributes.filter((a) => a.attributeId !== attrId));
  };

  const toggleAttributeValue = (attrId: string, value: string) => {
    setSelectedAttributes(
      selectedAttributes.map((a) => {
        if (a.attributeId !== attrId) return a;
        const values = a.values.includes(value)
          ? a.values.filter((v) => v !== value)
          : [...a.values, value];
        return { ...a, values };
      })
    );
  };

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm({ ...form, tags: [...form.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setForm({ ...form, tags: form.tags.filter((t) => t !== tag) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) { toast.error("Product name is required"); setActiveTab("general"); return; }
    if (!form.category) { toast.error("Please select a category"); setActiveTab("general"); return; }

    // Validation for simple product
    if (!hasVariants) {
      if (!simpleInventory.price) { toast.error("Price is required for simple product"); setActiveTab("inventory"); return; }
      if (!simpleInventory.stock) { toast.error("Stock is required for simple product"); setActiveTab("inventory"); return; }
    } else {
      if (variants.length === 0) { toast.error("Please generate variants"); setActiveTab("variants"); return; }
    }

    setLoading(true);
    try {
      // Build variants payload
      let finalVariants = variants;
      
      // If no attributes, create a single default variant
      if (!hasVariants) {
        finalVariants = [{
          sku: simpleInventory.sku || `SKU-${Date.now().toString().slice(-6)}`,
          combination: {},
          price: parseFloat(simpleInventory.price.toString()) || 0,
          discountPrice: parseFloat(simpleInventory.discountPrice.toString()) || 0,
          stock: parseInt(simpleInventory.stock.toString()) || 0,
          images: [],
          isActive: true
        }];
      }

      const payload = {
        ...form,
        images,
        attributes: selectedAttributes,
        specifications,
        variants: finalVariants.map((v) => ({
          ...v,
          combination: v.combination,
        })),
      };

      const url = initialData?._id ? `/api/products/${initialData._id}` : "/api/products";
      const method = initialData?._id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(initialData?._id ? "Product updated!" : "Product created!");
        router.push("/admin/products");
        router.refresh();
      } else {
        toast.error(json.error || "Failed to save product");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: <FiInfo /> },
    { id: "inventory", label: "Pricing & Stock", icon: <FiBox /> },
    { id: "media", label: "Media", icon: <FiImage /> },
    { id: "variants", label: "Variants", icon: <FiSettings /> },
    { id: "specifications", label: "Specifications", icon: <FiList /> },
    { id: "organization", label: "Organization", icon: <FiTag /> },
    { id: "seo", label: "SEO", icon: <FiGlobe /> },
  ];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6 relative">
      {/* Sidebar Navigation */}
      <div className="lg:w-64 flex-shrink-0">
        <div className="sticky top-24 bg-slate-900/50 border border-slate-800/50 rounded-2xl p-4 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.id === "variants" && hasVariants && (
                <span className="ml-auto w-2 h-2 rounded-full bg-blue-500"></span>
              )}
            </button>
          ))}

          <div className="pt-4 mt-4 border-t border-slate-800/50">
            <Button type="submit" isLoading={loading} className="w-full">
              {initialData?._id ? "Save Changes" : "Create Product"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} className="w-full mt-2">
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 space-y-6">
        
        {/* General Tab */}
        <div className={`space-y-6 ${activeTab !== "general" ? "hidden" : "block"}`}>
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Basic Information</h2>
              <p className="text-sm text-slate-500">Essential details about your product.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Product Name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Samsung Galaxy S24 Ultra"
                id="product-name"
              />
              <Input
                label="Product Slug (URL)"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                placeholder="Leave empty to auto-generate"
                id="product-slug"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={10}
                placeholder="Write a comprehensive product description..."
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none"
              />
              <p className="text-xs text-slate-500 mt-2">HTML and markdown are not supported yet. Use plain text formatting.</p>
            </div>
          </div>
        </div>

        {/* Pricing & Stock Tab */}
        <div className={`space-y-6 ${activeTab !== "inventory" ? "hidden" : "block"}`}>
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Pricing & Inventory</h2>
              {hasVariants ? (
                <p className="text-sm text-amber-500 flex items-center gap-2 mt-2 p-3 bg-amber-500/10 rounded-lg">
                  <FiInfo /> 
                  This product has variants. Manage pricing and stock in the Variants tab.
                </p>
              ) : (
                <p className="text-sm text-slate-500">Set the base price and inventory for this product.</p>
              )}
            </div>
            
            <div className={`space-y-6 ${hasVariants ? "opacity-50 pointer-events-none" : ""}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Selling Price (৳) *"
                  type="number"
                  value={simpleInventory.price}
                  onChange={(e) => setSimpleInventory({ ...simpleInventory, price: e.target.value })}
                  placeholder="0.00"
                  id="simple-price"
                />
                <Input
                  label="Compare-at Price (৳)"
                  type="number"
                  value={simpleInventory.discountPrice}
                  onChange={(e) => setSimpleInventory({ ...simpleInventory, discountPrice: e.target.value })}
                  placeholder="0.00"
                  id="simple-compare"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5 border-none">SKU (Stock Keeping Unit)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={simpleInventory.sku}
                      onChange={(e) => setSimpleInventory({ ...simpleInventory, sku: e.target.value })}
                      placeholder="e.g. S-24-ULT-BLK"
                      id="simple-sku"
                      className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                    <Button type="button" variant="secondary" onClick={() => setSimpleInventory({ ...simpleInventory, sku: `SKU-${Date.now().toString().slice(-6)}` })}>Auto</Button>
                  </div>
                </div>
                <Input
                  label="Available Stock *"
                  type="number"
                  value={simpleInventory.stock}
                  onChange={(e) => setSimpleInventory({ ...simpleInventory, stock: e.target.value })}
                  placeholder="0"
                  id="simple-stock"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Media Tab */}
        <div className={`space-y-6 ${activeTab !== "media" ? "hidden" : "block"}`}>
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Product Media</h2>
              <p className="text-sm text-slate-500">Upload global images for this product. High quality images increase conversion rates.</p>
            </div>
            <ImageUploader images={images} onChange={setImages} maxImages={10} folder="electromart/products" />
          </div>
        </div>

        {/* Variants Tab */}
        <div className={`space-y-6 ${activeTab !== "variants" ? "hidden" : "block"}`}>
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Options & Variants</h2>
              <p className="text-sm text-slate-500">Does this product come in multiple options like size or color?</p>
            </div>
            
            <div className="space-y-4 pt-4 border-t border-slate-800/50">
              <h3 className="text-sm font-medium text-white">Select Attributes</h3>
              <div className="flex flex-wrap gap-2">
                {allAttributes
                  .filter((a) => !selectedAttributes.find((s) => s.attributeId === a._id))
                  .map((attr) => (
                    <button
                      key={attr._id}
                      type="button"
                      onClick={() => addAttribute(attr)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:border-blue-500 hover:text-blue-400 transition-all cursor-pointer shadow-sm"
                    >
                      <FiPlus size={14} /> {attr.name}
                    </button>
                  ))}
              </div>

              {/* Selected Attributes Map */}
              {selectedAttributes.length > 0 && (
                <div className="space-y-4 mt-6">
                  {selectedAttributes.map((selected) => {
                    const fullAttr = allAttributes.find((a) => a._id === selected.attributeId);
                    if (!fullAttr) return null;

                    return (
                      <div key={selected.attributeId} className="p-4 bg-slate-800/30 border border-slate-700 rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-white">{selected.name}</span>
                          <button
                            type="button"
                            onClick={() => removeAttribute(selected.attributeId)}
                            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                          >
                            <FiX /> Remove Option
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {fullAttr.values.map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => toggleAttributeValue(selected.attributeId, val)}
                              className={`px-3 py-1.5 rounded-lg text-sm transition-all cursor-pointer border ${
                                selected.values.includes(val)
                                  ? "border-blue-500 bg-blue-500/10 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]"
                                  : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300 bg-slate-800"
                              }`}
                            >
                              {selected.values.includes(val) && <FiCheck className="inline mr-1" size={12} />}
                              {val}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {hasVariants && (
              <div className="pt-6 border-t border-slate-800/50">
                <VariantEngine
                  productName={form.name}
                  attributes={selectedAttributes}
                  variants={variants}
                  onVariantsChange={setVariants}
                />
              </div>
            )}
          </div>
        </div>

        {/* Specifications Tab */}
        <div className={`space-y-6 ${activeTab !== "specifications" ? "hidden" : "block"}`}>
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Product Specifications</h2>
              <p className="text-sm text-slate-500">Add grouped specification rows (like StarTech.bd). Organize specs into named groups such as &quot;General&quot;, &quot;Connectivity&quot;, etc.</p>
            </div>

            {/* Add Group Button */}
            <button
              type="button"
              onClick={() => setSpecifications([...specifications, { group: "", items: [{ key: "", value: "" }] }])}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 text-sm font-medium rounded-xl border border-blue-500/20 hover:bg-blue-500/20 transition-all cursor-pointer"
            >
              <FiPlus size={14} /> Add Specification Group
            </button>

            {specifications.length === 0 && (
              <p className="text-sm text-slate-500 p-4 bg-slate-800/30 rounded-xl border border-slate-700 border-dashed">
                No specifications added yet. Click &quot;Add Specification Group&quot; to create a group like &quot;General&quot;, &quot;Display&quot;, &quot;Connectivity&quot;, etc.
              </p>
            )}

            {/* Specification Groups */}
            <div className="space-y-6">
              {specifications.map((group, gIdx) => (
                <div key={gIdx} className="p-4 bg-slate-800/30 border border-slate-700 rounded-xl">
                  {/* Group Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <input
                      type="text"
                      value={group.group}
                      onChange={(e) => {
                        const updated = [...specifications];
                        updated[gIdx].group = e.target.value;
                        setSpecifications(updated);
                      }}
                      placeholder="Group Name (e.g., General, Display, Connectivity)"
                      className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-600 rounded-xl text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => setSpecifications(specifications.filter((_, i) => i !== gIdx))}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors cursor-pointer"
                    >
                      <FiX size={16} />
                    </button>
                  </div>

                  {/* Spec Rows */}
                  <div className="space-y-2">
                    {group.items.map((item, iIdx) => (
                      <div key={iIdx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={item.key}
                          onChange={(e) => {
                            const updated = [...specifications];
                            updated[gIdx].items[iIdx].key = e.target.value;
                            setSpecifications(updated);
                          }}
                          placeholder="Key (e.g., Model, Weight)"
                          className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 placeholder-slate-500"
                        />
                        <input
                          type="text"
                          value={item.value}
                          onChange={(e) => {
                            const updated = [...specifications];
                            updated[gIdx].items[iIdx].value = e.target.value;
                            setSpecifications(updated);
                          }}
                          placeholder="Value (e.g., Starlink Mini, 1.1 kg)"
                          className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 placeholder-slate-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...specifications];
                            updated[gIdx].items = updated[gIdx].items.filter((_, i) => i !== iIdx);
                            setSpecifications(updated);
                          }}
                          className="p-1.5 text-slate-500 hover:text-red-400 rounded transition-colors cursor-pointer"
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Row */}
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...specifications];
                      updated[gIdx].items.push({ key: "", value: "" });
                      setSpecifications(updated);
                    }}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 cursor-pointer"
                  >
                    <FiPlus size={12} /> Add Row
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Organization Tab */}
        <div className={`space-y-6 ${activeTab !== "organization" ? "hidden" : "block"}`}>
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Product Organization</h2>
              <p className="text-sm text-slate-500">Categorize your product to make it easy to find.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.icon} {cat.name} {cat.parent ? "(Sub)" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Brand"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                placeholder="e.g., Samsung"
                id="product-brand"
              />
            </div>
            
            <div className="pt-4 border-t border-slate-800/50">
              <label className="block text-sm font-medium text-slate-300 mb-2">Product Tags</label>
              <div className="flex gap-2 mb-3">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder="Type a tag and press Enter"
                  id="tag-input"
                />
                <Button type="button" variant="secondary" onClick={addTag}>Add Tag</Button>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 p-4 bg-slate-800/30 rounded-xl border border-slate-800">
                  {form.tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-slate-300 text-sm rounded-lg border border-slate-700 shadow-sm">
                      <FiTag size={12} className="text-blue-400" />
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="text-slate-500 hover:text-red-400 cursor-pointer ml-1">
                        <FiX size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800/50">
              <h3 className="text-sm font-medium text-slate-300 mb-3">Product Status</h3>
              <label className="flex items-center gap-3 p-4 bg-slate-800/30 rounded-xl border border-slate-700 cursor-pointer hover:border-blue-500/50 transition-colors">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="w-5 h-5 bg-slate-800 border-slate-600 rounded text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-white block">Promote as Featured</span>
                  <span className="text-xs text-slate-500">Display this product prominently on the homepage and top of category lists.</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* SEO Tab */}
        <div className={`space-y-6 ${activeTab !== "seo" ? "hidden" : "block"}`}>
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Search Engine Optimization</h2>
              <p className="text-sm text-slate-500">Improve your ranking and how your product page will appear in search engine results.</p>
            </div>
            
            {/* SEO Preview Card */}
            <div className="p-5 bg-white rounded-xl shadow-lg mt-4 mb-6 hidden sm:block">
              <span className="text-[12px] text-slate-500 mb-1 block">Google Search Preview</span>
              <h3 className="text-[#1a0dab] text-xl font-medium truncate">
                {form.seo.title || form.name || "Product Title"} — ElectroMart
              </h3>
              <p className="text-[#006621] text-sm truncate mb-1">
                https://electromart.com.bd/product/product-slug
              </p>
              <p className="text-[#545454] text-sm line-clamp-2 leading-snug">
                {form.seo.description || form.description?.slice(0, 150) || "Explore premium electronics at ElectroMart. Find the best price and warranty on your favorite products."}
              </p>
            </div>

            <Input
              label="Page Title"
              value={form.seo.title}
              onChange={(e) => setForm({ ...form, seo: { ...form.seo, title: e.target.value } })}
              placeholder={form.name || "Custom SEO Title"}
              id="seo-title"
              maxLength={70}
            />
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-slate-300">Meta Description</label>
                <span className="text-xs text-slate-500">{form.seo.description.length}/160</span>
              </div>
              <textarea
                value={form.seo.description}
                onChange={(e) => setForm({ ...form, seo: { ...form.seo, description: e.target.value } })}
                rows={3}
                maxLength={160}
                placeholder="Brief, compelling description for search engines (approx. 160 characters)..."
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
              />
            </div>
          </div>
        </div>

      </div>
    </form>
  );
}
