import ProductForm from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Add New Product</h1>
        <p className="text-sm text-slate-500 mt-1">Create a new product with variants</p>
      </div>
      <ProductForm />
    </div>
  );
}
