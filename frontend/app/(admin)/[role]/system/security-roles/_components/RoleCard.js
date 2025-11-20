export default function RoleCard({ title, value, bgColor, textColor }) {
  return (
    <div className={`p-4 sm:p-6 rounded-2xl text-center shadow-sm hover:shadow-md transition-shadow ${bgColor}`}>
      <div className={`text-3xl sm:text-4xl font-bold ${textColor}`}>{value}</div>
      <p className="text-gray-600 text-xs sm:text-sm mt-2 font-medium">{title}</p>
    </div>
  );
}
