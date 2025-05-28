"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AuthService from "../../../services/auth.service";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setIsLoading(true);

    try {
      const userData = await AuthService.login(email, password);
      
      // The backend will determine the role and return it
      // We'll redirect based on the role returned from the backend
      const role = userData.role.toLowerCase();
      
      // Map roles to their dashboard paths
      const rolePaths: { [key: string]: string } = {
        'admin': '/admin',
        'doctor': '/doctor',
        'pharmacist': '/pharmacist',
        'receptionist': '/receptionist'
      };

      const dashboardPath = rolePaths[role];
      if (!dashboardPath) {
        throw new Error("Invalid user role");
      }

      router.push(dashboardPath);
    } catch (err: any) {
      console.error("Login error:", err);
      // Use a generic error message for security
      setError("Invalid email or password");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl w-full flex flex-col md:flex-row">
        {/* Left side - Form */}
        <div className="p-8 md:p-12 md:w-1/2">
          <div className="flex items-center mb-8">
            <Image 
              src="/logo.svg" 
              alt="HMS Logo" 
              width={40} 
              height={40} 
              className="mr-2"
            />
            <span className="text-indigo-800 font-bold text-xl">Hospinix</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-gray-600 mb-8">Login to access your dashboard</p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-gray-50 text-gray-800 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-gray-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link href="login/forgotPassword" className="text-sm text-indigo-600 hover:text-indigo-800">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-gray-50 text-gray-800 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-gray-400 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember_me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
              />
              <label htmlFor="remember_me" className="ml-3 block text-sm text-gray-700">
                Remember me
              </label>
            </div>

            <button
              type="submit"
              className={`w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        {/* Right side - Graphics */}
        <div className="hidden md:block md:w-1/2 bg-indigo-600 p-12 flex flex-col justify-center">
          <div className="text-white mb-6">
            <h2 className="text-2xl font-bold mb-2">Healthcare Management System</h2>
            <p className="text-indigo-200">Streamline your healthcare operations with our comprehensive system designed for medical professionals.</p>
          </div>

          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm text-white">
            <div className="flex items-center mb-3">
              <div className="rounded-full bg-white/20 p-2 mr-3">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="font-medium">Efficient patient management</p>
            </div>

            <div className="flex items-center mb-3">
              <div className="rounded-full bg-white/20 p-2 mr-3">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="font-medium">Streamlined appointment scheduling</p>
            </div>

            <div className="flex items-center">
              <div className="rounded-full bg-white/20 p-2 mr-3">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="font-medium">Comprehensive medicine management</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
