"use client";

import { ProductSection } from "@/components/products/ProductSection";
import { useCategories } from "@/features/categories/hooks";

/** Une sélection par catégorie, limitée aux 3 premières pour garder une page légère. */
export function CategorySections() {
  const { data } = useCategories();
  if (!data) return null;
  return (
    <>
      {data.slice(0, 3).map((category) => (
        <ProductSection
          key={category.id}
          title={category.name}
          href={`/products?categoryId=${encodeURIComponent(category.id)}`}
          params={{ categoryId: category.id, limit: 5 }}
        />
      ))}
    </>
  );
}