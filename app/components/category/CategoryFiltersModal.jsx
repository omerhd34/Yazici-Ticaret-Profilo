"use client";
import { useEffect } from "react";
import { HiX } from "react-icons/hi";
import SubCategoryFilter from "./SubCategoryFilter";
import PriceFilter from "./PriceFilter";
import BrandFilter from "./BrandFilter";
import CategoryFilter from "./CategoryFilter";
import BagTypeFilter from "./BagTypeFilter";
import ScreenSizeFilter from "./ScreenSizeFilter";
import CoolingCapacityFilter from "./CoolingCapacityFilter";
import SpecialProductsFilter from "./SpecialProductsFilter";

export default function CategoryFiltersModal({
 show,
 slug,
 filters,
 availableBrands,
 availableCategories,
 availableScreenSizes,
 availableCoolingCapacities,
 onClose,
 onClearFilters,
 onMinPriceChange,
 onMaxPriceChange,
 onBrandToggle,
 onCategoryToggle,
 onBagTypeToggle,
 onScreenSizeToggle,
 onCoolingCapacityToggle,
 onSpecialFilterToggle,
}) {
 useEffect(() => {
  if (show) {
   document.body.classList.add("filters-modal-open");
   document.body.style.overflow = "hidden";
  } else {
   document.body.classList.remove("filters-modal-open");
   document.body.style.overflow = "";
  }
  return () => {
   document.body.classList.remove("filters-modal-open");
   document.body.style.overflow = "";
  };
 }, [show]);

 if (!show) return null;

 const categorySlug = slug.length > 0 ? decodeURIComponent(slug[0]) : "";
 const isVacuumCategory = categorySlug === "elektrikli-supurge";
 const isTVCategory = categorySlug === "televizyon";
 const isAirConditionerCategory = categorySlug === "klima";

 return (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
   <div className="absolute right-0 top-0 bottom-0 w-full sm:w-80 bg-white shadow-xl overflow-y-auto">
    <div className="sticky top-0 bg-white border-b p-3 sm:p-4 flex justify-between items-center z-10">
     <h3 className="font-bold text-base sm:text-lg">Filtreler</h3>
     <button onClick={onClose} className="p-1 cursor-pointer">
      <HiX size={24} />
     </button>
    </div>

    <div className="p-3 sm:p-4 space-y-4 sm:space-y-6">
     <SpecialProductsFilter
      selectedFilters={filters.specialFilters || []}
      onFilterToggle={onSpecialFilterToggle}
     />

     <SubCategoryFilter slug={slug} onLinkClick={onClose} />

     {availableCategories && availableCategories.length > 0 && (
      <CategoryFilter
       availableCategories={availableCategories}
       selectedCategories={filters.categories || []}
       onCategoryToggle={onCategoryToggle}
      />
     )}

     <BrandFilter
      availableBrands={availableBrands}
      selectedBrands={filters.brands}
      onBrandToggle={onBrandToggle}
      isMobile={true}
     />

     <PriceFilter
      minPrice={filters.minPrice}
      maxPrice={filters.maxPrice}
      onMinPriceChange={onMinPriceChange}
      onMaxPriceChange={onMaxPriceChange}
      isMobile={true}
      slug={slug}
     />

     {isVacuumCategory && (
      <BagTypeFilter
       selectedBagTypes={filters.bagTypes || []}
       onBagTypeToggle={onBagTypeToggle}
       isMobile={true}
      />
     )}

     {isTVCategory && (
      <ScreenSizeFilter
       availableScreenSizes={availableScreenSizes || []}
       selectedScreenSizes={filters.screenSizes || []}
       onScreenSizeToggle={onScreenSizeToggle}
       isMobile={true}
      />
     )}

     {isAirConditionerCategory && (
      <CoolingCapacityFilter
       availableCoolingCapacities={availableCoolingCapacities || []}
       selectedCoolingCapacities={filters.coolingCapacities || []}
       onCoolingCapacityToggle={onCoolingCapacityToggle}
       isMobile={true}
      />
     )}
    </div>

    <div className="sticky bottom-0 bg-white border-t p-3 sm:p-4">
     <button
      onClick={onClearFilters}
      className="w-full bg-gray-200 text-gray-800 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold cursor-pointer"
     >
      Temizle
     </button>
    </div>
   </div>
  </div>
 );
}
