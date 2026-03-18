const sampleProducts = [
  { name: "HAVIT HV-G92 Gamepad", sku: "PRD-1001", stock: 84, status: "Active" },
  { name: "AK-900 Wired Keyboard", sku: "PRD-1002", stock: 42, status: "Low Stock" },
  { name: "ASUS FHD Gaming Laptop", sku: "PRD-1003", stock: 17, status: "Featured" },
] as const;

export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-primary-btn)]">Catalog</p>
        <h1 className="mt-3 text-[var(--color-text-1)]">Products</h1>
        <p className="mt-3 max-w-2xl text-[var(--color-text-2)]">
          Review catalog entries, stock levels, and merchandising status from a single product management view.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-black/10 bg-white">
        {sampleProducts.map((product, index) => (
          <div
            key={product.sku}
            className={`grid gap-4 px-6 py-5 md:grid-cols-4 ${index !== sampleProducts.length - 1 ? "border-b border-black/10" : ""}`}
          >
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-text-2)]">Product</p>
              <p className="mt-1 font-medium">{product.name}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-text-2)]">SKU</p>
              <p className="mt-1">{product.sku}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-text-2)]">Stock</p>
              <p className="mt-1">{product.stock}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-text-2)]">Status</p>
              <p className="mt-1">{product.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
