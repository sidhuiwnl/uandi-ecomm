import { cn } from "@/lib/utils"
import { ArrowUpRight, MoreVertical, Edit, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

export default function ProductCard({
                                        products,
                                        onEdit,
                                        onDelete
                                    }) {
    const [showMenu, setShowMenu] = useState(false)

    const handleEdit = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setShowMenu(false)
        onEdit?.(products)
    }

    const handleDelete = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setShowMenu(false)
        onDelete?.(products.product_id, products.product_name)
    }

    return (
        <Link
            href={`/admin/console/product-management/product-details/${products.product_id}`}
            className="block w-full max-w-[280px] group"
        >
            <div
                className={cn(
                    "relative overflow-hidden rounded-2xl",
                    "bg-white/80 dark:bg-zinc-900/80",
                    "backdrop-blur-xl",
                    "border border-zinc-200/50 dark:border-zinc-800/50",
                    "shadow-xs",
                    "transition-all duration-300",
                    "hover:shadow-md",
                    "hover:border-zinc-300/50 dark:hover:border-zinc-700/50",
                )}
            >
                <div className="relative h-80 overflow-hidden">
                    <Image
                        src={products.main_image}
                        alt={products.product_name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                    />
                </div>

                <div className={cn("absolute inset-0", "bg-linear-to-t from-black/90 via-black/40 to-transparent")} />

                {/* Top Section with Category and Menu */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-end">
          <span
              className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-medium",
                  "bg-white/90 text-zinc-800",
                  "dark:bg-zinc-900/90 dark:text-zinc-200",
                  "backdrop-blur-md",
                  "shadow-xs",
                  "border border-white/20 dark:border-zinc-800/50",
              )}
          >
            {products.category.category_name || "Testing"}
          </span>


                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setShowMenu(!showMenu)
                            }}
                            className={cn(
                                "p-1.5 rounded-lg transition-all duration-200",
                                " text-zinc-600",
                                "dark:bg-zinc-900/90 dark:text-zinc-400",
                                "backdrop-blur-md",
                                "shadow-xs",
                                " dark:border-zinc-800/50",
                                " hover:text-zinc-800",
                                "dark:hover:bg-zinc-800/90 dark:hover:text-zinc-200",
                                "hover:scale-105 active:scale-95"
                            )}
                        >
                            <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {showMenu && (
                            <>
                                {/* Backdrop */}
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        setShowMenu(false)
                                    }}
                                />

                                {/* Menu Items */}
                                <div
                                    className={cn(
                                        "absolute right-0 top-full mt-1 z-50",
                                        "w-32 py-1 rounded-xl",
                                        "bg-white/95 dark:bg-zinc-900/95",
                                        "backdrop-blur-xl",
                                        "shadow-lg",
                                        "border border-zinc-200/50 dark:border-zinc-800/50"
                                    )}
                                >
                                    <button
                                        onClick={handleEdit}
                                        className={cn(
                                            "w-full px-3 py-2 text-sm flex items-center gap-2",
                                            "text-zinc-700 dark:text-zinc-300",
                                            "hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50",
                                            "transition-colors duration-150",
                                            "first:rounded-t-xl last:rounded-b-xl"
                                        )}
                                    >
                                        <Edit className="w-4 h-4" />
                                        Edit
                                    </button>

                                    <button
                                        onClick={handleDelete}
                                        className={cn(
                                            "w-full px-3 py-2 text-sm flex items-center gap-2",
                                            "text-red-600 dark:text-red-400",
                                            "hover:bg-red-50/50 dark:hover:bg-red-900/20",
                                            "transition-colors duration-150",
                                            "first:rounded-t-xl last:rounded-b-xl"
                                        )}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="flex items-center justify-between gap-3">
                        <div className="space-y-1.5">
                            <h3 className="text-lg font-semibold text-white dark:text-zinc-100 leading-snug">
                                {products.product_name}
                            </h3>
                            <p className="text-sm text-zinc-200 dark:text-zinc-300 line-clamp-2">
                                {products.description}
                            </p>
                        </div>
                        <div
                            className={cn(
                                "p-2 rounded-full",
                                "bg-white/10 dark:bg-zinc-800/50",
                                "backdrop-blur-md",
                                "group-hover:bg-white/20 dark:group-hover:bg-zinc-700/50",
                                "transition-colors duration-300 group",
                            )}
                        >
                            <ArrowUpRight className="w-4 h-4 text-white group-hover:-rotate-12 transition-transform duration-300" />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}
