// Inside the filteredProducts.map loop:
<div 
  key={v.id} 
  onClick={() => router.push(`/product/${v.products?.id}`)} // Link to new detail page
  className="bg-white rounded-3xl border border-slate-200 hover:border-blue-500 transition-all duration-300 group flex flex-col h-full relative overflow-hidden shadow-sm hover:shadow-xl cursor-pointer"
>
  {/* Rest of card remains same... */}
</div>