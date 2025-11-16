"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { fetchCollections } from "@/store/collectionsSlice";

export default function Page() {
    const dispatch = useDispatch();

    const { items: collections, loading } = useSelector(
        (state) => state.collections
    );

    useEffect(() => {
        dispatch(fetchCollections());
    }, [dispatch]);

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* HEADER */}
            <h1 className="text-3xl font-semibold text-neutral-900 mb-6">
                Collections
            </h1>

            {/* Loading */}
            {loading && (
                <p className="text-center text-gray-500 text-lg py-6">
                    Loading collections...
                </p>
            )}

            {/* Empty */}
            {!loading && collections?.length === 0 && (
                <p className="text-center text-gray-500 py-10">
                    No collections available.
                </p>
            )}

            {/* Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {collections?.map((col) => (
                    <Link
                        key={col.collection_id}
                        href={`/collections/${col.collection_id}`}
                        className="
              border border-gray-200
              rounded-xl
              p-4
              bg-white
              shadow-sm
              hover:shadow-md
              hover:scale-[1.02]
              transition-all
              cursor-pointer
            "
                    >
                        <h3 className="text-lg font-medium text-neutral-800">
                            {col.collection_name}
                        </h3>


                    </Link>
                ))}
            </div>
        </div>
    );
}
