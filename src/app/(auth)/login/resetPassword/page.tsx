"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  if (!searchParams) {
    throw new Error("Search params not available");
  }
  const token = searchParams.get("token");
  console.log("this is the token from the url" + token);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
    const res = await axios.post("http://localhost:8080/auth/reset-password", { token, password },{
      headers: {
        "Content-Type": "application/json",
      },
    });
      setMessage(res.data.message);
      setError("");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Reset failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form className="bg-white p-6 rounded shadow-md w-96" onSubmit={handleSubmit}>
        <h2 className="text-xl font-bold mb-4 text-black-500">Reset Password</h2>
        {message && <p className="text-green-600 mb-2">{message}</p>}
        {error && <p className="text-red-600 mb-2">{error}</p>}

        <label className="block mb-2">New Password</label>
        <input
          type="password"
          className="w-full p-2 border mb-4 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label className="block mb-2">Confirm Password</label>
        <input
          type="password"
          className="w-full p-2 border mb-4 rounded"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded">
          Reset Password
        </button>
      </form>
    </div>
  );
}
