/**
 * Automated Variation Engine
 * Generates all possible variant combinations using Cartesian product
 */

interface AttributeInput {
  name: string;
  values: string[];
}

export interface VariantCombination {
  combination: Record<string, string>;
  sku: string;
  price: number;
  discountPrice: number;
  stock: number;
  isActive: boolean;
}

/**
 * Generates Cartesian product of all attribute values
 * 
 * Example:
 * Input:  [{ name: "RAM", values: ["8GB","16GB"] }, { name: "Color", values: ["Black","Silver"] }]
 * Output: [
 *   { RAM: "8GB",  Color: "Black"  },
 *   { RAM: "8GB",  Color: "Silver" },
 *   { RAM: "16GB", Color: "Black"  },
 *   { RAM: "16GB", Color: "Silver" },
 * ]
 */
export function generateCartesianProduct(
  attributes: AttributeInput[]
): Record<string, string>[] {
  if (attributes.length === 0) return [{}];

  const [first, ...rest] = attributes;
  const restCombinations = generateCartesianProduct(rest);

  const combinations: Record<string, string>[] = [];
  for (const value of first.values) {
    for (const combo of restCombinations) {
      combinations.push({
        [first.name]: value,
        ...combo,
      });
    }
  }

  return combinations;
}

/**
 * Hash a combination for comparison/deduplication
 */
export function hashCombination(combination: Record<string, string>): string {
  return Object.entries(combination)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join("|");
}

/**
 * Creates full variant objects from combinations
 */
export function generateVariants(
  attributes: AttributeInput[],
  productName: string,
  basePrice: number = 0
): VariantCombination[] {
  const combinations = generateCartesianProduct(attributes);

  return combinations.map((combination) => {
    const prefix = productName
      .split(" ")
      .map((w) => w[0]?.toUpperCase())
      .join("")
      .slice(0, 4);
    const suffix = Object.values(combination)
      .map((v) => v.replace(/\s+/g, "").toUpperCase().slice(0, 3))
      .join("-");
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();

    return {
      combination,
      sku: `${prefix}-${suffix}-${rand}`,
      price: basePrice,
      discountPrice: 0,
      stock: 0,
      isActive: true,
    };
  });
}
