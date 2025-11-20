"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MagnifyingGlassIcon, EyeIcon } from "@heroicons/react/24/outline";

export default function AllOrdersPage() {
	const { role } = useParams();
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("all");
	const [payment, setPayment] = useState("all");

	// Dummy orders for demo
	const orders = useMemo(
		() => [
			{ id: "#10125", customer: "Aisha Khan", email: "aisha@example.com", items: 3, total: 1899, status: "Delivered", payment: "Prepaid", date: "2025-11-03", fulfillment: "Shipped" },
			{ id: "#10124", customer: "Rahul Mehta", email: "rahul@example.com", items: 2, total: 1299, status: "Processing", payment: "COD", date: "2025-11-03", fulfillment: "Pending" },
			{ id: "#10123", customer: "Neha Gupta", email: "neha@example.com", items: 4, total: 2599, status: "Delivered", payment: "Prepaid", date: "2025-11-02", fulfillment: "Delivered" },
			{ id: "#10122", customer: "Arjun Sharma", email: "arjun@example.com", items: 1, total: 999, status: "Cancelled", payment: "COD", date: "2025-11-02", fulfillment: "Cancelled" },
			{ id: "#10121", customer: "Priya Singh", email: "priya@example.com", items: 5, total: 3499, status: "Processing", payment: "Prepaid", date: "2025-11-01", fulfillment: "Picking" },
			{ id: "#10120", customer: "Karan Patel", email: "karan@example.com", items: 2, total: 1199, status: "Refunded", payment: "Prepaid", date: "2025-11-01", fulfillment: "Returned" },
		],
		[]
	);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		return orders.filter((o) => {
			const matchesSearch =
				!q ||
				o.id.toLowerCase().includes(q) ||
				o.customer.toLowerCase().includes(q) ||
				o.email.toLowerCase().includes(q);
			const matchesStatus = status === "all" || o.status.toLowerCase() === status;
			const matchesPayment = payment === "all" || o.payment.toLowerCase() === payment;
			return matchesSearch && matchesStatus && matchesPayment;
		});
	}, [orders, search, status, payment]);

	const statusBadge = (s) => {
		const map = {
			delivered: "bg-green-100 text-green-700",
			processing: "bg-blue-100 text-blue-700",
			cancelled: "bg-red-100 text-red-700",
			refunded: "bg-amber-100 text-amber-700",
		};
		return map[s?.toLowerCase()] || "bg-gray-100 text-gray-700";
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">All Orders</h1>
					<p className="text-gray-500 mt-1">Review, search, and filter recent orders</p>
				</div>
			</div>

			{/* Filters */}
			<div className="card">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="relative">
						{/* <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /> */}
						<input
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Search by order id, customer, or email..."
							className="input-field pl-10"
						/>
					</div>
					<select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field">
						<option value="all">All Status</option>
						<option value="delivered">Delivered</option>
						<option value="processing">Processing</option>
						<option value="cancelled">Cancelled</option>
						<option value="refunded">Refunded</option>
					</select>
					<select value={payment} onChange={(e) => setPayment(e.target.value)} className="input-field">
						<option value="all">All Payments</option>
						<option value="prepaid">Prepaid</option>
						<option value="cod">COD</option>
					</select>
				</div>
			</div>

			{/* Orders table */}
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
								<th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
							</tr>
						</thead>
						<tbody>
							{filtered.map((o) => (
								<tr key={o.id} className="border-b border-gray-100 hover:bg-gray-50">
									<td className="py-3 px-4">
										<p className="font-medium text-gray-800">{o.id}</p>
										<p className="text-xs text-gray-500">{o.fulfillment}</p>
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
										<span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${statusBadge(o.status)}`}>
											{o.status}
										</span>
									</td>
									<td className="py-3 px-4 text-right text-sm font-semibold text-gray-900">₹{o.total.toLocaleString()}</td>
									<td className="py-3 px-4">
										<div className="flex justify-end">
											<Link href={`/${role}/console/order-management/${encodeURIComponent(o.id.replace('#',''))}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="View">
												<EyeIcon className="w-5 h-5" />
											</Link>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>

					{filtered.length === 0 && (
						<div className="text-center py-12">
							<p className="text-gray-500">No orders found</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

