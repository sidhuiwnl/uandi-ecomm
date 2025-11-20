"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import { MagnifyingGlassIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

export default function PendingOrdersPage() {
	const { role } = useParams();
	const [search, setSearch] = useState("");
	const [orders, setOrders] = useState(() => [
		{ id: "#10124", customer: "Rahul Mehta", email: "rahul@example.com", items: 2, total: 1299, status: "Processing", payment: "COD", date: "2025-11-03" },
		{ id: "#10121", customer: "Priya Singh", email: "priya@example.com", items: 5, total: 3499, status: "Processing", payment: "Prepaid", date: "2025-11-01" },
		{ id: "#10119", customer: "Dev Patel", email: "dev@example.com", items: 1, total: 799, status: "Processing", payment: "Prepaid", date: "2025-10-31" },
	]);
	const [savingId, setSavingId] = useState(null);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		return orders.filter((o) =>
			(!q || o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q) || o.email.toLowerCase().includes(q))
			&& o.status.toLowerCase() === "processing"
		);
	}, [orders, search]);

	const statusOptions = ["Processing", "Packed", "Shipped", "Delivered", "Cancelled", "Refunded"];

	const handleChangeStatus = async (orderId, nextStatus) => {
		setSavingId(orderId);
		try {
			// In a real app, call your API here
			await new Promise((r) => setTimeout(r, 600));
			setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o)));
			Swal.fire({
				icon: "success",
				title: "Status Updated",
				text: `${orderId} is now ${nextStatus}`,
				timer: 1400,
				showConfirmButton: false,
			});
		} catch (err) {
			Swal.fire({ icon: "error", title: "Update Failed", text: "Could not change order status." });
		} finally {
			setSavingId(null);
		}
	};

	const badge = (s) => {
		const m = {
			processing: "bg-blue-100 text-blue-700",
			packed: "bg-indigo-100 text-indigo-700",
			shipped: "bg-amber-100 text-amber-700",
			delivered: "bg-green-100 text-green-700",
			cancelled: "bg-red-100 text-red-700",
			refunded: "bg-yellow-100 text-yellow-700",
		};
		return m[s?.toLowerCase()] || "bg-gray-100 text-gray-700";
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Pending Orders</h1>
					<p className="text-gray-500 mt-1">Orders awaiting fulfillment or shipment</p>
				</div>
				<Link href={`/${role}/console/order-management/all`} className="text-sm text-pink-600 hover:text-pink-700">
					View all orders
				</Link>
			</div>

			{/* Filters */}
			<div className="card">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="relative">
									{/* <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" /> */}
						<input
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Search by order id, customer, or email..."
										className="input-field pl-12"
						/>
					</div>
				</div>
			</div>

			{/* Table */}
			<div className="card">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead>
							<tr className="border-b border-gray-200">
								<th className="text-left py-3 px-4 font-semibold text-gray-700">Order</th>
								<th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
								<th className="text-left py-3 px-4 font-semibold text-gray-700">Items</th>
								<th className="text-left py-3 px-4 font-semibold text-gray-700">Payment</th>
								<th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
								<th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
								<th className="text-right py-3 px-4 font-semibold text-gray-700">Total</th>
								<th className="text-right py-3 px-4 font-semibold text-gray-700">Change Status</th>
							</tr>
						</thead>
						<tbody>
							{filtered.map((o) => (
								<tr key={o.id} className="border-b border-gray-100 hover:bg-gray-50">
									<td className="py-3 px-4">
										<p className="font-medium text-gray-800">{o.id}</p>
									</td>
									<td className="py-3 px-4">
										<div>
											<p className="text-sm text-gray-800">{o.customer}</p>
											<p className="text-xs text-gray-500">{o.email}</p>
										</div>
									</td>
									<td className="py-3 px-4 text-sm text-gray-700">{o.items}</td>
									<td className="py-3 px-4 text-sm text-gray-700">{o.payment}</td>
									<td className="py-3 px-4 text-sm text-gray-700">{new Date(o.date).toLocaleDateString('en-IN')}</td>
									<td className="py-3 px-4">
										<span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${badge(o.status)}`}>
											{o.status}
										</span>
									</td>
									<td className="py-3 px-4 text-right text-sm font-semibold text-gray-900">₹{o.total.toLocaleString()}</td>
									<td className="py-3 px-4 text-right">
										<div className="inline-flex items-center gap-2">
											<select
												className="input-field py-1 pr-8 text-sm"
												value={o.status}
												onChange={(e) => handleChangeStatus(o.id, e.target.value)}
												disabled={savingId === o.id}
											>
												{statusOptions.map((s) => (
													<option key={s} value={s}>{s}</option>
												))}
											</select>
											{savingId === o.id && (
												<ArrowPathIcon className="w-5 h-5 animate-spin text-gray-500" />
											)}
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>

					{filtered.length === 0 && (
						<div className="text-center py-12">
							<p className="text-gray-500">No pending orders found</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

