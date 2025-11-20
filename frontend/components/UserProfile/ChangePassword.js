export default function ChangePassword() {
  return (
    <div className="p-6 bg-gray-50 rounded-xl">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Change Password</h2>
      <form className="grid grid-cols-1 gap-4 w-1/2">
        <input
          type="password"
          placeholder="Current Password"
          className="p-3 border rounded-lg bg-white"
        />
        <input
          type="password"
          placeholder="New Password"
          className="p-3 border rounded-lg bg-white"
        />
        <input
          type="password"
          placeholder="Confirm Password"
          className="p-3 border rounded-lg bg-white"
        />
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg mt-2 hover:bg-green-700">
          Update Password
        </button>
      </form>
    </div>
  );
}
