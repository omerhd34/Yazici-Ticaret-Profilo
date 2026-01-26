"use client";
import SubCategoryFilter from "./SubCategoryFilter";
import PriceFilter from "./PriceFilter";
import BrandFilter from "./BrandFilter";
import CategoryFilter from "./CategoryFilter";
import BagTypeFilter from "./BagTypeFilter";
import ScreenSizeFilter from "./ScreenSizeFilter";
import CoolingCapacityFilter from "./CoolingCapacityFilter";
import SpecialProductsFilter from "./SpecialProductsFilter";

export default function CategoryFiltersSidebar({
 slug,
 filters,
 availableBrands,
 availableCategories,
 availableScreenSizes,
 availableCoolingCapacities,
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
 const categorySlug = slug.length > 0 ? decodeURIComponent(slug[0]) : "";
 const isVacuumCategory = categorySlug === "elektrikli-supurge";
 const isTVCategory = categorySlug === "televizyon";
 const isAirConditionerCategory = categorySlug === "klima";
 const isYenilerPage = categorySlug === "yeni" || categorySlug === "yeniler";
 const isIndirimPage = categorySlug === "indirim";

 return (
  <aside className="hidden lg:block w-64 xl:w-72 shrink-0">
   <div className="bg-white rounded-xl shadow-sm p-4 xl:p-6 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
    <div className="flex justify-between items-center mb-4 xl:mb-6">
     <h3 className="font-bold text-base xl:text-lg">Filtreler</h3>
     <button
      onClick={onClearFilters}
      className="text-xs xl:text-sm text-indigo-600 hover:text-indigo-800 cursor-pointer"
     >
      Temizle
     </button>
    </div>

    <SpecialProductsFilter
     selectedFilters={filters.specialFilters || []}
     onFilterToggle={onSpecialFilterToggle}
    />

    <SubCategoryFilter slug={slug} />

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
    />

    <PriceFilter
     minPrice={filters.minPrice}
     maxPrice={filters.maxPrice}
     onMinPriceChange={onMinPriceChange}
     onMaxPriceChange={onMaxPriceChange}
     slug={slug}
    />

    {isVacuumCategory && (
     <BagTypeFilter
      selectedBagTypes={filters.bagTypes || []}
      onBagTypeToggle={onBagTypeToggle}
     />
    )}

    {isTVCategory && (
     <ScreenSizeFilter
      availableScreenSizes={availableScreenSizes || []}
      selectedScreenSizes={filters.screenSizes || []}
      onScreenSizeToggle={onScreenSizeToggle}
     />
    )}

    {isAirConditionerCategory && (
     <CoolingCapacityFilter
      availableCoolingCapacities={availableCoolingCapacities || []}
      selectedCoolingCapacities={filters.coolingCapacities || []}
      onCoolingCapacityToggle={onCoolingCapacityToggle}
     />
    )}
   </div>
  </aside>
 );
}
