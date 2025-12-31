'use client'

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProducts } from '@/store/productsSlice'
import RoutineProductCard from "@/components/RoutineProductCard";
import { useSearchParams } from 'next/navigation'
import {useRouter} from "next/navigation";
import Swal from "sweetalert2";
import {setCheckoutFromRoutine} from "@/store/slices/checkoutSlice";

import {
  DndContext,
  useDraggable,
  useDroppable,
  DragOverlay,
} from '@dnd-kit/core'
import {saveRoutine} from "@/store/slices/routineSlice";


function DraggableProduct({ product, onAddToBox, isAlreadyAdded }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `product-${product.product_id}`,
    data: { product },
  })

  return (
      <div ref={setNodeRef}>
        <RoutineProductCard
            product={product}
            onAddToRoutine={onAddToBox}
            isAlreadyAdded={isAlreadyAdded}
            dragHandleProps={{ ...listeners, ...attributes }} // 👈 pass down
        />
      </div>
  )
}



/* ---------------- Box Slot ---------------- */
function BoxSlot({
  slot,
  product,
  variant,
  onRemoveProduct,
  onRemoveSlot,
  canRemoveSlot,
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${slot}`,
  })

  return (
      <div
          ref={setNodeRef}
          className={`relative w-36 h-40 shrink-0
    border-2 border-dashed rounded-lg overflow-hidden
    ${isOver ? 'border-green-500 bg-green-50' : 'border-gray-300'}
  `}
      >

      {canRemoveSlot && !product && (
        <button
          onClick={() => onRemoveSlot(slot)}
          className="absolute top-1 right-1 text-gray-400 hover:text-black text-xs"
        >
          ✕
        </button>
      )}

        {product ? (
            <div className="relative w-full h-full">
              {/* Remove button */}
              <button
                  onClick={() => onRemoveProduct(slot)}
                  className="absolute top-2 right-2 z-20 bg-white/90 text-red-500 text-xs rounded-full w-6 h-6 flex items-center justify-center shadow"
              >
                ✕
              </button>

              {/* Product Image */}
              <img
                  src={product.main_image}
                  alt={product.product_name}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Text overlay */}
              <div className="absolute bottom-2 left-2 right-2 z-10 text-white">
                <p className="text-xs font-semibold leading-tight line-clamp-2">
                  {product.product_name}
                </p>
                <p className="text-[10px] opacity-90">
                  {variant?.variant_name}
                </p>
              </div>
            </div>
        ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              Item {slot}
            </div>

        )}


    </div>
  )
}

/* ---------------- Variant Modal ---------------- */
function VariantModal({ product, onSelect, onClose }) {
  const [selected, setSelected] = useState(null)

  if (!product) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />

      <div className="relative bg-white w-full sm:max-w-md rounded-t-xl sm:rounded-xl p-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between mb-3">
          <h2 className="text-base font-semibold">Choose a Variant</h2>
          <button onClick={onClose} className="text-gray-400">✕</button>
        </div>

        <p className="text-xs text-gray-600 mb-3">
          {product.product_name}
        </p>

        <div className="space-y-2">
          {product.variants.map((v) => (
            <button
              key={v.variant_id}
              onClick={() => setSelected(v)}
              className={`w-full border rounded-lg p-3 text-left
                ${selected?.variant_id === v.variant_id
                  ? 'border-black bg-gray-50'
                  : 'border-gray-200'}
              `}
            >
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium">{v.variant_name}</p>
                  <p className="text-[11px] text-gray-500">
                    {v.weight}{v.unit} • Stock: {v.stock}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    ₹{v.final_price}
                  </p>
                  {v.mrp_price !== v.final_price && (
                    <p className="text-[11px] text-gray-400 line-through">
                      ₹{v.mrp_price}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        <button
          disabled={!selected}
          onClick={() => onSelect(selected)}
          className={`w-full mt-4 py-2.5 rounded-lg text-sm font-medium
            ${selected
              ? 'bg-black text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
          `}
        >
          Add to Box
        </button>
      </div>
    </div>
  )
}

/* ---------------- Main Page ---------------- */
export default function OwnBoxPage() {
  const dispatch = useDispatch()
  const { products, loading } = useSelector((state) => state.products)
  const router = useRouter();
  const [isRoutineSaved, setIsRoutineSaved] = useState(false);


  const isProductAlreadyAdded = (productId) => {
    return boxItems.some(
        (item) => item.product?.product_id === productId
    )
  }
  const handleRoutineCheckout = () => {
    // 1️⃣ Validate routine completeness
    const incomplete = boxItems.some(
        (item) => !item.product || !item.variant
    );

    if (incomplete) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Routine",
        text: "Please fill all slots before checkout",
      });
      return;
    }

    const routineCartItems = boxItems.map((item) => ({
      product_id: item.product.product_id,
      variant_id: item.variant.variant_id,

      product_name: item.product.product_name,
      variant_name: item.variant.variant_name,

      quantity: 1,

      // ✅ NORMALIZED PRICES
      price: Number(item.variant.final_price),
      final_price: Number(item.variant.final_price),
      mrp_price: Number(item.variant.mrp_price),

      sub_total: Number(item.variant.final_price),

      // ✅ IMAGE (used in cart UI)
      main_image: item.product.main_image,

      source_collection_id: 9,
    }));


    dispatch(setCheckoutFromRoutine(routineCartItems));
    router.push("/checkout");
  };

  const handleSaveRoutine = async () => {

    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login to save routines",
      });
      return;
    }

    const { user_id } = JSON.parse(storedUser);

    if (!user_id) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Invalid user session",
      });
      return;
    }

    const incomplete = boxItems.some(
        (item) => !item.product || !item.variant
    );

    if (incomplete) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Routine",
        text: "Please fill all slots before saving",
      });
      return;
    }

    const { value: routineName } = await Swal.fire({
      title: "Save Routine",
      input: "text",
      inputLabel: "Routine Name",
      inputPlaceholder: "Eg: Morning Skincare",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) return "Routine name is required";
      },
    });

    if (!routineName) return;

    const payload = {
      user_id,
      routine_name: routineName,
      slot_count: boxItems.length,
      items: boxItems.map((item, index) => ({
        product_id: item.product.product_id,
        variant_id: item.variant.variant_id,
        position: index + 1,
      })),
    };

    const result = await dispatch(saveRoutine(payload));

    if (saveRoutine.fulfilled.match(result)) {
      Swal.fire({
        icon: "success",
        title: "Routine Saved",
        text: "You can reuse it anytime from My Routines",
      });

      setIsRoutineSaved(true);

    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save routine",
      });
    }
  };





  const searchParams = useSearchParams()
  const initialSlots = Number(searchParams.get('slots')) || 3
  const DEFAULT_SLOTS = Math.min(Math.max(initialSlots, 3), 5)
  const MAX_SLOTS = 5

  const [slotCount, setSlotCount] = useState(DEFAULT_SLOTS)
  const [boxItems, setBoxItems] = useState([])

  const [activeProduct, setActiveProduct] = useState(null)
  const [variantProduct, setVariantProduct] = useState(null)
  const [pendingSlot, setPendingSlot] = useState(null)

  /* Init slots */
  useEffect(() => {
    setSlotCount(DEFAULT_SLOTS)
    setBoxItems(
      Array.from({ length: DEFAULT_SLOTS }, (_, i) => ({
        slot: i + 1,
        product: null,
        variant: null,
      }))
    )
  }, [DEFAULT_SLOTS])

  useEffect(() => {
    setIsRoutineSaved(false);
  }, [boxItems]);

  useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch])

  /* ---------- Shared Add-to-Box Logic ---------- */
  const openVariantForProduct = (product) => {
    // ❌ Prevent duplicate products
    if (isProductAlreadyAdded(product.product_id)) {
      // optional: toast or alert
      // toast.error("Product already added to the box")
      return
    }

    const emptyIndex = boxItems.findIndex((i) => !i.product)
    if (emptyIndex === -1) return

    setPendingSlot(emptyIndex)
    setVariantProduct(product)
  }



  /* ---------- Drag handlers ---------- */
  const handleDragStart = (event) => {
    setActiveProduct(event.active.data.current.product)
  }

  const handleDragEnd = (event) => {
    setActiveProduct(null)
    if (!event.over) return

    const product = event.active.data.current?.product

    // ❌ Prevent duplicate via drag
    if (isProductAlreadyAdded(product.product_id)) return

    const index = boxItems.findIndex(
        (i) => `slot-${i.slot}` === event.over.id
    )

    if (index === -1 || boxItems[index].product) return

    setPendingSlot(index)
    setVariantProduct(product)
  }


  const handleVariantSelect = (variant) => {
    setBoxItems((prev) => {
      const updated = [...prev]
      updated[pendingSlot] = {
        ...updated[pendingSlot],
        product: variantProduct,
        variant,
      }
      return updated
    })

    setVariantProduct(null)
    setPendingSlot(null)
  }

  const removeProductFromSlot = (slot) => {
    setBoxItems((prev) =>
      prev.map((i) =>
        i.slot === slot ? { ...i, product: null, variant: null } : i
      )
    )
  }

  const addSlot = () => {
    if (slotCount >= MAX_SLOTS) return
    const next = slotCount + 1
    setSlotCount(next)
    setBoxItems((prev) => [...prev, { slot: next, product: null, variant: null }])
  }

  /* ---------- Price ---------- */
  const totalPrice = boxItems.reduce(
    (sum, i) => sum + (i.variant ? Number(i.variant.final_price) : 0),
    0
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
      </div>
    )
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="max-w-6xl mx-auto px-4 py-6 pb-40">
        <h1 className="text-lg font-semibold text-center mb-4">
          Build Your Own Box
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-fr">
        {products.map((p) => (
            <DraggableProduct
              key={p.product_id}
              product={p}
              onAddToBox={openVariantForProduct}
              isAlreadyAdded={isProductAlreadyAdded(p.product_id)}
            />
          ))}
        </div>
      </div>

      {/* Bottom Tray */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-50">
        <div className="max-w-6xl mx-auto px-4 py-5">
        <p className="text-center text-sm font-medium mb-1">
            Total: <span className="font-semibold">₹{totalPrice.toFixed(2)}</span>
          </p>

          <div className="flex gap-3 justify-center overflow-x-auto">
            {boxItems.map((item) => (
              <BoxSlot
                key={item.slot}
                {...item}
                onRemoveProduct={removeProductFromSlot}
              />
            ))}

            {slotCount < MAX_SLOTS && (
              <button
                onClick={addSlot}
                className="w-36 h-40 border-2 border-dashed rounded-lg
           text-xs text-gray-500 flex items-center justify-center"

              >
                + Add Slot
              </button>
            )}
            {!isRoutineSaved ? (
                <button
                    onClick={handleSaveRoutine}
                    className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-100"
                >
                  Save Routine
                </button>
            ) : (
                <button
                    onClick={handleRoutineCheckout}
                    className="bg-[#D8234B] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#B71C3A]"
                >
                  Proceed to Checkout
                </button>
            )}

          </div>

        </div>

      </div>

      <DragOverlay style={{ pointerEvents: 'none' }}>
        {activeProduct && (
          <div className="w-52 shadow-xl">
            <RoutineProductCard
                product={activeProduct}
                onAddToRoutine={null}
                onNavigate={null}
            />
          </div>
        )}
      </DragOverlay>

      <VariantModal
        product={variantProduct}
        onSelect={handleVariantSelect}
        onClose={() => setVariantProduct(null)}
      />
    </DndContext>
  )
}
