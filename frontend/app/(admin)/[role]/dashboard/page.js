"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Line,
  Bar,
  Doughnut
} from "react-chartjs-2";
import "chart.js/auto";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export default function Dashboard() {
  const { role } = useParams();
  const [range, setRange] = useState("30d");

  // Dummy data (skincare/cosmetics flavor)
  const metrics = useMemo(() => ({
    revenue: 482350,
    orders: 1298,
    customers: 942,
    aov: 371.7,
    conversion: 3.9, // %
    refundRate: 0.7 // %
  }), []);

  const salesSeries = useMemo(() => {
    const labels = Array.from({ length: 12 }, (_, i) => `W${i + 1}`);
    return {
      labels,
      datasets: [
        {
          label: "Revenue (₹)",
          data: [22, 28, 26, 35, 32, 40, 44, 42, 46, 51, 49, 56].map(n => n * 1000),
          borderColor: "#ec4899",
          backgroundColor: "rgba(236, 72, 153, 0.15)",
          fill: true,
          tension: 0.35
        }
      ]
    };
  }, []);

  const categoryData = useMemo(() => ({
    labels: ["Body Butter", "Hair Oil", "Soap", "Kids Shampoo", "Body Lotion"],
    datasets: [
      {
        label: "Sales (₹)",
        data: [210, 165, 132, 88, 104].map(n => n * 1000),
        backgroundColor: [
          "rgba(236, 72, 153, .8)",
          "rgba(59, 130, 246, .8)",
          "rgba(34, 197, 94, .8)",
          "rgba(250, 204, 21, .8)",
          "rgba(99, 102, 241, .8)"
        ]
      }
    ]
  }), []);

  const orderStatusData = useMemo(() => ({
    labels: ["Delivered", "Processing", "Cancelled", "Refunded"],
    datasets: [
      {
        label: "Orders",
        data: [862, 318, 76, 42],
        backgroundColor: [
          "rgba(34,197,94,.9)",
          "rgba(59,130,246,.9)",
          "rgba(239,68,68,.9)",
          "rgba(234,179,8,.9)"
        ],
        borderWidth: 0
      }
    ]
  }), []);

  const topProducts = [
    { id: 1, name: "Herbal Hair Boost Oil", category: "Hair Oil", revenue: 92000, units: 240 },
    { id: 2, name: "Sweet Lips - Lip Balm", category: "Lip Balm", revenue: 78500, units: 310 },
    { id: 3, name: "Goat Milk Moisturising Soap", category: "Soap", revenue: 65400, units: 205 },
    { id: 4, name: "Shearoots Body Butter", category: "Body Butter", revenue: 48800, units: 180 }
  ];

  const lowStock = [
    { sku: "SKN-VC-30", name: "Goat Milk Moisturising Soap", stock: 8 },
    { sku: "MKP-LIP-RSW", name: "Sweet Lips - Lip Balm", stock: 12 },
    { sku: "SKN-RET-1", name: "Herbal Hair Boost Oil", stock: 5 }
  ];

  const recentOrders = [
    { id: "#10098", customer: "Surya ", total: 1899, status: "Delivered", date: "2025-11-02" },
    { id: "#10097", customer: "Rahul", total: 1299, status: "Processing", date: "2025-11-02" },
    { id: "#10096", customer: "Neha", total: 2599, status: "Delivered", date: "2025-11-01" },
    { id: "#10095", customer: "Sharma", total: 999, status: "Cancelled", date: "2025-11-01" }
  ];

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, labels: { usePointStyle: true } },
      tooltip: { mode: "index", intersect: false }
    },
    scales: { x: { grid: { display: false } }, y: { grid: { color: "#f3f4f6" } } }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of U&I Sales performance</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={range} onChange={(e) => setRange(e.target.value)} className="input-field">
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
        <KPI title="Revenue" value={`₹${metrics.revenue.toLocaleString('en-IN')}`} sub="vs last period +8%" tone="pink" />
        <KPI title="Orders" value={metrics.orders.toLocaleString()} sub="+5%" tone="blue" />
        <KPI title="Customers" value={metrics.customers.toLocaleString()} sub="+3%" tone="indigo" />
        <KPI title="AOV" value={`₹${metrics.aov.toFixed(2)}`} sub="+2%" tone="emerald" />
        <KPI title="Conversion" value={`${metrics.conversion}%`} sub="+0.2pp" tone="violet" />
        <KPI title="Refund rate" value={`${metrics.refundRate}%`} sub="-0.1pp" tone="amber" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Sales over time</h2>
          </div>
          <Line data={salesSeries} options={chartOptions} height={120} />
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Order status</h2>
          <Doughnut data={orderStatusData} />
        </div>
      </div>

      {/* Category + Top products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Category performance</h2>
          </div>
          <Bar data={categoryData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { color: '#f3f4f6' } } } }} height={140} />
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Top products</h2>
            <Link href={`/${role}/console/product-management/all-products`} className="text-sm text-pink-600 hover:text-pink-700 inline-flex items-center gap-1">
              View all <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
          <ul className="divide-y divide-gray-100">
            {topProducts.map((p) => (
              <li key={p.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">₹{p.revenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{p.units} units</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Inventory + Recent orders */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="card xl:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Low stock alerts</h2>
            <Link href={`/${role}/console/product-management/all-products`} className="text-sm text-pink-600 hover:text-pink-700">Manage</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-sm text-gray-600">SKU</th>
                  <th className="text-left py-2 text-sm text-gray-600">Product</th>
                  <th className="text-right py-2 text-sm text-gray-600">Stock</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((i) => (
                  <tr key={i.sku} className="border-b border-gray-100">
                    <td className="py-2 pr-2 text-sm text-gray-800">{i.sku}</td>
                    <td className="py-2 pr-2 text-sm text-gray-800">{i.name}</td>
                    <td className="py-2 pl-2 text-right"><span className="inline-flex px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-700">{i.stock}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Recent orders</h2>
            <Link href={`/${role}/console/order-management`} className="text-sm text-pink-600 hover:text-pink-700">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-sm text-gray-600">Order</th>
                  <th className="text-left py-2 text-sm text-gray-600">Customer</th>
                  <th className="text-left py-2 text-sm text-gray-600">Date</th>
                  <th className="text-right py-2 text-sm text-gray-600">Total</th>
                  <th className="text-right py-2 text-sm text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-gray-100">
                    <td className="py-2 pr-2 text-sm font-medium text-gray-800">{o.id}</td>
                    <td className="py-2 pr-2 text-sm text-gray-800">{o.customer}</td>
                    <td className="py-2 pr-2 text-sm text-gray-600">{new Date(o.date).toLocaleDateString('en-IN')}</td>
                    <td className="py-2 pl-2 text-right text-sm text-gray-900">₹{o.total.toLocaleString()}</td>
                    <td className="py-2 pl-2 text-right">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        o.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                        o.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                        o.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>{o.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPI({ title, value, sub, tone = "pink" }) {
  const tones = {
    pink: { bg: "bg-pink-50", dot: "bg-pink-500" },
    blue: { bg: "bg-blue-50", dot: "bg-blue-500" },
    indigo: { bg: "bg-indigo-50", dot: "bg-indigo-500" },
    emerald: { bg: "bg-emerald-50", dot: "bg-emerald-500" },
    violet: { bg: "bg-violet-50", dot: "bg-violet-500" },
    amber: { bg: "bg-amber-50", dot: "bg-amber-500" }
  }[tone] || { bg: "bg-gray-50", dot: "bg-gray-400" };

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
        <div className={`rounded-lg p-3 ${tones.bg}`}>
          <span className={`inline-block w-3 h-3 rounded-full ${tones.dot}`}></span>
        </div>
      </div>
    </div>
  );
}