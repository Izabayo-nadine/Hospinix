"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  if (!searchParams) {
    throw new Error("Search params not available");
  }

  const token = searchParams.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:8080/auth/reset-password",
        { token, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setMessage(res.data.message);
      setError("");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Reset failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
          Reset Password
        </h2>

        {message && <p className="text-green-600 mb-4 text-center">{message}</p>}
        {error && <p className="text-red-600 mb-4 text-center">{error}</p>}

        {/* Password Input */}
        <label className="block text-gray-700 font-medium mb-2">
          New Password
        </label>
        <div className="relative mb-4">
        <input
  type={showPassword ? "text" : "password"}
  className="w-full p-3 border border-gray-300 rounded text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  placeholder="Enter new password"
/>

          <button
            type="button"
            className="absolute right-3 top-3 text-sm text-indigo-600 hover:underline"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {/* Confirm Password Input */}
        <label className="block text-gray-700 font-medium mb-2">
          Confirm Password
        </label>
        <div className="relative mb-6">
        <input
  type={showConfirm ? "text" : "password"}
  className="w-full p-3 border border-gray-300 rounded text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
  value={confirm}
  onChange={(e) => setConfirm(e.target.value)}
  placeholder="Re-enter new password"
/>

          <button
            type="button"
            className="absolute right-3 top-3 text-sm text-indigo-600 hover:underline"
            onClick={() => setShowConfirm(!showConfirm)}
          >
            {showConfirm ? "Hide" : "Show"}
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors duration-300 text-white font-semibold py-3 rounded"
        >
          Reset Password
        </button>
      </form>
    </div>
  );
}
