"use client";

import { use, useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    getCollectionProducts,
    updateCollectionOrder,
    mapProductsToCollection,
} from "@/store/collectionsSlice";
import { fetchProducts } from "@/store/productsSlice";

import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from "@dnd-kit/core";

import {
    SortableContext,
    rectSortingStrategy, // Changed from verticalListSortingStrategy
    arrayMove,
} from "@dnd-kit/sortable";
import SortableCard from "@/components/SortableCard";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { PlusIcon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import Swal from "sweetalert2";

export default function CollectionProductsPage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const { id: collectionId } = params;

    const dispatch = useDispatch();
    const { selectedCollection, loading: collectionsLoading } = useSelector(
        (state) => state.collections
    );
    const { products: allProducts, loading: productsLoading } = useSelector(
        (state) => state.products
    );

    const [items, setItems] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProducts, setSelectedProducts] = useState([]);

    // Fetch all products on component mount
    useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);

    // Fetch collection products
    useEffect(() => {
        if (collectionId) {
            dispatch(getCollectionProducts(collectionId));
        }
    }, [collectionId, dispatch]);

    // Update items when collection changes
    useEffect(() => {
        if (selectedCollection?.products) {
            const sortedProducts = [...selectedCollection.products].sort(
                (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
            );
            setItems(sortedProducts);
            setSelectedProducts([]);
        }
    }, [selectedCollection]);

    // Get available products
    const availableProducts = useMemo(() => {
        if (!allProducts || !items) return [];

        const currentProductIds = new Set(items.map((item) => item.product_id));
        let filtered = allProducts.filter((product) => !currentProductIds.has(product.product_id));

        if (searchQuery.trim()) {
            filtered = filtered.filter(
                (product) =>
                    product.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    product.category_name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return filtered;
    }, [allProducts, items, searchQuery]);

    // Handle product selection
    const handleProductSelection = useCallback((productId) => {
        setSelectedProducts((prev) => {
            if (prev.includes(productId)) {
                return prev.filter((id) => id !== productId);
            } else {
                return [...prev, productId];
            }
        });
    }, []);

    // Handle adding products to collection
    const handleAddProductsToCollection = useCallback(async () => {
        if (selectedProducts.length === 0) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                icon: 'warning',
                title: 'No products selected',
                text: 'Please select at least one product to add.',
                background: '#fef3c7',
                color: '#92400e'
            });
            return;
        }

        try {
            setIsSaving(true);

            const result = await dispatch(
                mapProductsToCollection({
                    collection_id: collectionId,
                    product_ids: selectedProducts,
                })
            ).unwrap();

            Swal.fire({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                icon: 'success',
                title: 'Success!',
                text: `Added ${selectedProducts.length} product(s) to collection`,
                background: '#d1fae5',
                color: '#065f46'
            });

            dispatch(getCollectionProducts(collectionId));
            setIsProductModalOpen(false);
            setSearchQuery("");
            setSelectedProducts([]);

        } catch (error) {
            console.error("Failed to add products:", error);
            Swal.fire({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 5000,
                icon: 'error',
                title: 'Error!',
                text: error.message || 'Failed to add products to collection',
                background: '#fee2e2',
                color: '#991b1b'
            });
        } finally {
            setIsSaving(false);
        }
    }, [selectedProducts, collectionId, dispatch]);

    // Sensors with better activation constraint
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragStart = useCallback((event) => {
        setActiveId(event.active.id);
    }, []);

    // Updated handleDragEnd with better logic
    const handleDragEnd = useCallback(
        async (event) => {
            const { active, over } = event;

            setActiveId(null);

            if (!over || active.id === over.id) return;

            const oldIndex = items.findIndex((i) => i.product_id === active.id);
            const newIndex = items.findIndex((i) => i.product_id === over.id);

            if (oldIndex === -1 || newIndex === -1) return;

            // Optimistic UI update
            const newList = arrayMove(items, oldIndex, newIndex);
            setItems(newList);

            // Create new sort order
            const updatedOrder = newList.map((item, index) => ({
                product_id: item.product_id,
                sort_order: index + 1,
            }));

            if (isSaving) return;
            setIsSaving(true);

            try {
                await dispatch(
                    updateCollectionOrder({
                        collection_id: collectionId,
                        updatedOrder,
                    })
                ).unwrap();

                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    icon: 'success',
                    title: 'Order updated!',
                    text: 'Successfully saved new order.',
                    background: '#d1fae5',
                    color: '#065f46'
                });
            } catch (error) {
                console.error("Failed to update sort order:", error);

                // Rollback on error
                setItems(items);

                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 5000,
                    icon: 'error',
                    title: 'Save failed',
                    text: 'Failed to save new order. Reverting changes.',
                    background: '#fee2e2',
                    color: '#991b1b'
                });
            } finally {
                setIsSaving(false);
            }
        },
        [items, collectionId, dispatch, isSaving]
    );

    const handleDragCancel = useCallback(() => {
        setActiveId(null);
    }, []);

    // Memoize item IDs
    const itemIds = useMemo(() => items.map((i) => i.product_id), [items]);

    // Find active item for DragOverlay
    const activeItem = useMemo(
        () => items.find((item) => item.product_id === activeId),
        [items, activeId]
    );

    const loading = collectionsLoading || productsLoading;
    const isEmpty = items.length === 0;

    if (loading || !selectedCollection) {
        return (
            <div className="p-8 text-center text-gray-600 space-y-4">
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
                </div>
                <p className="text-lg">Loading collection...</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-64"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header Section */}
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div className="flex-1">
                    <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-500 bg-clip-text text-transparent leading-tight">
                        {selectedCollection.collection?.collection_name || "Collection"}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1" aria-label={`Contains ${items.length} products`}>
                        {items.length} product{items.length !== 1 ? "s" : ""} • Drag and drop to reorder
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {isSaving && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-rose-50 text-rose-600 rounded-md text-sm font-medium" role="status">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-rose-600"></div>
                            Saving order...
                        </div>
                    )}

                    <button
                        onClick={() => setIsProductModalOpen(true)}
                        className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-colors"
                        aria-label="Add products to collection"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Add Products
                    </button>
                </div>
            </header>

            {/* Product Selector Modal */}
            <Transition appear show={isProductModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsProductModalOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-0 text-left align-middle shadow-xl transition-all max-h-[90vh]">
                                    <Dialog.Title as="div" className="p-6 border-b bg-gray-50">
                                        <h2 className="text-xl font-semibold text-gray-900 flex items-center justify-between">
                                            <span>Add Products to Collection</span>
                                            <button
                                                onClick={() => {
                                                    setIsProductModalOpen(false);
                                                    setSearchQuery("");
                                                    setSelectedProducts([]);
                                                }}
                                                className="text-gray-400 hover:text-gray-600 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-rose-500"
                                                aria-label="Close modal"
                                            >
                                                <XMarkIcon className="w-6 h-6" />
                                            </button>
                                        </h2>
                                        <p className="text-gray-600 mt-1">Select products to add</p>
                                    </Dialog.Title>

                                    <div className="p-6 max-h-96 overflow-y-auto">
                                        <div className="relative mb-4">
                                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search products by name or category..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                            />
                                        </div>

                                        {availableProducts.length === 0 ? (
                                            <div className="text-center text-gray-500 py-12" role="status">
                                                {productsLoading ? (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-rose-600"></div>
                                                        Loading products...
                                                    </div>
                                                ) : searchQuery ? (
                                                    <p>No products match your search.</p>
                                                ) : (
                                                    <p>No available products to add.</p>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="space-y-3" role="list">
                                                {availableProducts.map((product) => (
                                                    <div
                                                        key={product.product_id}
                                                        role="checkbox"
                                                        tabIndex={0}
                                                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
                                                        onClick={() => handleProductSelection(product.product_id)}
                                                        onKeyDown={(e) => e.key === "Enter" && handleProductSelection(product.product_id)}
                                                        aria-checked={selectedProducts.includes(product.product_id)}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedProducts.includes(product.product_id)}
                                                            onChange={() => handleProductSelection(product.product_id)}
                                                            className="w-4 h-4 text-rose-600 border-gray-300 rounded focus:ring-rose-500"
                                                            aria-hidden="true"
                                                        />
                                                        {product.main_image?.[0]?.image_url && (
                                                            <img
                                                                src={product.main_image[0].image_url}
                                                                alt={product.product_name}
                                                                className="w-12 h-12 rounded object-cover flex-shrink-0"
                                                                loading="lazy"
                                                            />
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-medium text-gray-900 truncate" title={product.product_name}>
                                                                {product.product_name}
                                                            </h3>
                                                            <p className="text-sm text-gray-500 truncate" title={product.category_name}>
                                                                {product.category_name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                                        <button
                                            onClick={() => {
                                                setIsProductModalOpen(false);
                                                setSearchQuery("");
                                                setSelectedProducts([]);
                                            }}
                                            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                                            disabled={isSaving}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleAddProductsToCollection}
                                            className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                                            disabled={isSaving || selectedProducts.length === 0}
                                        >
                                            {isSaving ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    Adding...
                                                </>
                                            ) : (
                                                `Add ${selectedProducts.length} Product${selectedProducts.length !== 1 ? "s" : ""}`
                                            )}
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Products Grid */}
            {isEmpty ? (
                <div className="text-center py-16 border-2 border-dashed rounded-2xl border-gray-200 bg-gray-50">
                    <PlusIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" aria-hidden="true" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">No products yet</h2>
                    <p className="text-gray-600 mb-6">Start by adding products to this collection</p>
                    <button
                        onClick={() => setIsProductModalOpen(true)}
                        className="btn-primary flex items-center gap-2 px-6 py-3 rounded-lg font-medium mx-auto focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-colors"
                        aria-label="Add products to collection"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Add Your First Product
                    </button>
                </div>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragCancel={handleDragCancel}
                    modifiers={[restrictToWindowEdges]}
                >
                    <SortableContext 
                        items={itemIds} 
                        strategy={rectSortingStrategy} // CHANGED: Use rectSortingStrategy for grid layouts
                    >
                        <div
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                            role="list"
                            aria-label="Sortable product list"
                        >
                            {items.map((product) => (
                                <SortableCard
                                    key={product.product_id}
                                    id={product.product_id}
                                    product={product}
                                    isDragging={activeId === product.product_id}
                                    aria-label={`Product: ${product.product_name}`}
                                />
                            ))}
                        </div>
                    </SortableContext>

                    <DragOverlay>
                        {activeItem ? (
                            <div className="rotate-3 scale-105 opacity-90 shadow-2xl z-50">
                                <SortableCard
                                    id={activeItem.product_id}
                                    product={activeItem}
                                    isDragging={true}
                                    isOverlay={true}
                                />
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            )}
        </div>
    );
}
