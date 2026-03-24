import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";

interface Product {
  id: string | number;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  discount: string;
  weight: string;
  rating?: number;
  ratingCount?: string;
  tag?: string;
  stock?: number;
  category?: string;
  brand?: string;
}

interface ProductSectionProps {
  title: string;
  products: Product[];
  slug?: string;
}

const ProductSection = ({ title, products, slug }: ProductSectionProps) => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-foreground">
          {title}
        </h2>
        {slug && (
          <button
            onClick={() => navigate(`/shop/${slug}`)}
            className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            See All <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </div>
  );
};

export default ProductSection;
