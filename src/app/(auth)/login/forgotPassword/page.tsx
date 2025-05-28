"use client";
import { useState } from "react";
import axios from "axios";
import AuthService from "@/services/auth.service";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await AuthService.forgotPassword(email);
      setMessage(res.data.message);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-black">
      <form className="bg-white p-6 rounded shadow-md w-96" onSubmit={handleSubmit}>
        <h2 className="text-xl font-bold mb-4">Forgot Password</h2>

        {message && <p className="mb-2 text-green-600">{message}</p>}
        {error && <p className="mb-2 text-red-600">{error}</p>}

        <label className="block mb-2">Email Address</label>
        <input
          type="email"
          required
          className="w-full p-2 border border-gray-300 text-black mb-4 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
        >
          Send Reset Link
        </button>
      </form>
    </div>
  );
}
