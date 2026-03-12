import banner1 from "@/assets/banner-promo1.jpg";
import banner2 from "@/assets/banner-promo2.jpg";

const PromoBanners = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
          <img src={banner1} alt="Zero fees promotion" className="w-full h-48 object-cover" />
        </div>
        <div className="rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
          <img src={banner2} alt="10 min delivery" className="w-full h-48 object-cover" />
        </div>
      </div>
    </div>
  );
};

export default PromoBanners;
