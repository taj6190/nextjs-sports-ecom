"use client";

import { useState, useMemo } from "react";
import { generateCartesianProduct } from "@/lib/variants";
import { generateSKU, formatPrice } from "@/lib/utils";
import { FiRefreshCw, FiTrash2 } from "react-icons/fi";
import ImageUploader from "./ImageUploader";
import type { IImage } from "@/types";

interface AttributeInput {
  name: string;
  values: string[];
}

export interface VariantData {
  sku: string;
  combination: Record<string, string>;
  price: number;
  discountPrice: number;
  stock: number;
  images: IImage[];
  isActive: boolean;
}

interface VariantEngineProps {
  productName: string;
  attributes: AttributeInput[];
  variants: VariantData[];
  onVariantsChange: (variants: VariantData[]) => void;
}

export default function VariantEngine({
  productName,
  attributes,
  variants,
  onVariantsChange,
}: VariantEngineProps) {
  const [expandedVariant, setExpandedVariant] = useState<number | null>(null);

  // Generate variants from attributes
  const handleGenerate = () => {
    const combinations = generateCartesianProduct(attributes);

    // Preserve existing variant data when regenerating
    const newVariants = combinations.map((combo) => {
      const existingVariant = variants.find((v) => {
        return Object.entries(combo).every(
          ([key, value]) => v.combination[key] === value
        );
      });

      if (existingVariant) return existingVariant;

      return {
        sku: generateSKU(productName || "PROD", combo),
        combination: combo,
        price: 0,
        discountPrice: 0,
        stock: 0,
        images: [],
        isActive: true,
      };
    });

    onVariantsChange(newVariants);
  };

  // Apply price/stock to all variants
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkStock, setBulkStock] = useState("");

  const applyBulk = () => {
    const updated = variants.map((v) => ({
      ...v,
      ...(bulkPrice ? { price: parseFloat(bulkPrice) } : {}),
      ...(bulkStock ? { stock: parseInt(bulkStock) } : {}),
    }));
    onVariantsChange(updated);
  };

  const updateVariant = (index: number, field: string, value: unknown) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    onVariantsChange(updated);
  };

  const removeVariant = (index: number) => {
    onVariantsChange(variants.filter((_, i) => i !== index));
  };

  const totalCombinations = useMemo(() => {
    if (attributes.length === 0) return 0;
    return attributes.reduce((acc, attr) => acc * Math.max(attr.values.length, 1), 1);
  }, [attributes]);

  return (
    <div className="space-y-6">
      {/* Generate Button */}
      <div className="flex items-center justify-between p-4 bg-slate-800/30 border border-slate-700 rounded-xl">
        <div>
          <p className="text-sm font-medium text-white">Variant Engine</p>
          <p className="text-xs text-slate-500">
            {totalCombinations} possible combinations from{" "}
            {attributes.length} attribute(s)
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={attributes.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white text-sm font-medium rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed"
        >
          <FiRefreshCw size={14} />
          Generate Variants
        </button>
      </div>

      {/* Bulk Actions */}
      {variants.length > 0 && (
        <div className="flex items-end gap-3 p-4 bg-slate-800/20 border border-slate-800 rounded-xl">
          <div className="flex-1">
            <label className="block text-xs text-slate-400 mb-1">Bulk Price (৳)</label>
            <input
              type="number"
              value={bulkPrice}
              onChange={(e) => setBulkPrice(e.target.value)}
              placeholder="Set all prices"
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-slate-400 mb-1">Bulk Stock</label>
            <input
              type="number"
              value={bulkStock}
              onChange={(e) => setBulkStock(e.target.value)}
              placeholder="Set all stock"
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <button
            onClick={applyBulk}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors cursor-pointer"
          >
            Apply to All
          </button>
        </div>
      )}

      {/* Variants Table */}
      {variants.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-3 px-3 text-slate-400 font-medium">Variant</th>
                <th className="text-left py-3 px-3 text-slate-400 font-medium">SKU</th>
                <th className="text-left py-3 px-3 text-slate-400 font-medium">Price (৳)</th>
                <th className="text-left py-3 px-3 text-slate-400 font-medium">Compare At</th>
                <th className="text-left py-3 px-3 text-slate-400 font-medium">Stock</th>
                <th className="text-left py-3 px-3 text-slate-400 font-medium">Active</th>
                <th className="text-left py-3 px-3 text-slate-400 font-medium">Images</th>
                <th className="py-3 px-3" />
              </tr>
            </thead>
            <tbody>
              {variants.map((variant, index) => (
                <tr
                  key={variant.sku}
                  className="border-b border-slate-800/50 hover:bg-slate-800/20"
                >
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(variant.combination).map(([key, val]) => (
                        <span
                          key={key}
                          className="px-2 py-0.5 bg-slate-700/50 text-slate-300 text-xs rounded"
                        >
                          {key}: {val}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <input
                      type="text"
                      value={variant.sku}
                      onChange={(e) => updateVariant(index, "sku", e.target.value)}
                      className="w-32 px-2 py-1 bg-slate-800/50 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                    />
                  </td>
                  <td className="py-3 px-3">
                    <input
                      type="number"
                      value={variant.price || ""}
                      onChange={(e) => updateVariant(index, "price", parseFloat(e.target.value) || 0)}
                      className="w-24 px-2 py-1 bg-slate-800/50 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                    />
                  </td>
                  <td className="py-3 px-3">
                    <input
                      type="number"
                      value={variant.discountPrice || ""}
                      onChange={(e) => updateVariant(index, "discountPrice", parseFloat(e.target.value) || 0)}
                      className="w-24 px-2 py-1 bg-slate-800/50 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                    />
                  </td>
                  <td className="py-3 px-3">
                    <input
                      type="number"
                      value={variant.stock || ""}
                      onChange={(e) => updateVariant(index, "stock", parseInt(e.target.value) || 0)}
                      className="w-20 px-2 py-1 bg-slate-800/50 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                    />
                  </td>
                  <td className="py-3 px-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={variant.isActive}
                        onChange={(e) => updateVariant(index, "isActive", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                    </label>
                  </td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => setExpandedVariant(expandedVariant === index ? null : index)}
                      className="px-3 py-1 bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      {variant.images.length} img
                    </button>
                  </td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => removeVariant(index)}
                      className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Expanded Variant Image Upload */}
          {expandedVariant !== null && variants[expandedVariant] && (
            <div className="mt-4 p-4 bg-slate-800/20 border border-slate-700 rounded-xl">
              <p className="text-sm text-white mb-3">
                Images for:{" "}
                {Object.entries(variants[expandedVariant].combination)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(", ")}
              </p>
              <ImageUploader
                images={variants[expandedVariant].images}
                onChange={(imgs) => updateVariant(expandedVariant, "images", imgs)}
                folder="electromart/variants"
                maxImages={5}
              />
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      {variants.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-slate-800/20 rounded-xl text-xs text-slate-500">
          <span>
            {variants.length} variants |{" "}
            {variants.filter((v) => v.price > 0).length} priced |{" "}
            {variants.reduce((s, v) => s + v.stock, 0)} total stock
          </span>
          <span>
            Price range: {formatPrice(Math.min(...variants.filter(v => v.price > 0).map((v) => v.price)) || 0)} -{" "}
            {formatPrice(Math.max(...variants.map((v) => v.price)) || 0)}
          </span>
        </div>
      )}
    </div>
  );
}
