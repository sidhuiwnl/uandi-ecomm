"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";

export default function SortableCard({ product }) {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: product.product_id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}
             className="bg-white rounded-2xl shadow-sm border border-rose-100 overflow-hidden cursor-move">

            <div className="relative w-full h-56 bg-rose-50">
                {product.main_image ? (
                    <Image
                        src={product.main_image}
                        alt={product.product_name}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        No Image
                    </div>
                )}
            </div>

            <div className="p-5">
                <h2 className="text-lg font-semibold text-gray-800">
                    {product.product_name}
                </h2>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {product.description || "No description provided."}
                </p>

                <div className="mt-4 text-xs text-rose-700 bg-rose-100 px-3 py-1 rounded-full w-fit">
                    Sort Order: {product.sort_order}
                </div>
            </div>
        </div>
    );
}
