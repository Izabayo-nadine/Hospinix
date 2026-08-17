"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
// import Dr from '../public/images/dr.jpg'
import Link from "next/link";


export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [activeDemoTab, setActiveDemoTab] = useState("admin");
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  // Demo video playback simulation effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isDemoOpen && isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            // Auto switch tab when progress completes
            setActiveDemoTab((currentTab) => {
              const tabs = ["admin", "doctor", "pharmacist", "receptionist"];
              const nextIndex = (tabs.indexOf(currentTab) + 1) % tabs.length;
              return tabs[nextIndex];
            });
            return 0;
          }
          return prev + 2.5; // Advances progress
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isDemoOpen, isPlaying]);

  // Reset progress when switching tabs manually
  const handleTabChange = (tab: string) => {
    setActiveDemoTab(tab);
    setProgress(0);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Navigation */}
      <nav className={`fixed w-full z-10 transition-all duration-300 ${scrolled ? "bg-white shadow py-2" : "bg-transparent py-4"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Image 
                src="/logo.svg" 
                alt="HMS Logo" 
                width={40} 
                height={40} 
                className="mr-2"
              />
              <span className="text-indigo-800 font-bold text-xl">Hospinix</span>
            </div>
            <div className="hidden md:flex space-x-6">
              <a href="#features" className="text-gray-700 hover:text-indigo-600 transition">Features</a>
              <a href="#testimonials" className="text-gray-700 hover:text-indigo-600 transition">Testimonials</a>
              <a href="#pricing" className="text-gray-700 hover:text-indigo-600 transition">Pricing</a>
            </div>
            <Link 
              href="/login" 
              className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Modern Healthcare Management Solution
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Streamline your hospital operations with our comprehensive management system designed for doctors, pharmacists, and staff.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/login" 
                  className="bg-indigo-600 text-white px-8 py-3 rounded-full text-center hover:bg-indigo-700 transition"
                >
                  Get Started
                </Link>
                <button
                  onClick={() => setIsDemoOpen(true)}
                  className="border border-indigo-600 text-indigo-600 px-8 py-3 rounded-full text-center hover:bg-indigo-50 transition cursor-pointer"
                >
                  Watch Demo
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg blur opacity-30"></div>
              <div className="relative bg-white p-6 rounded-lg shadow-xl">
                <Image 
                  src="/doctors.png" 
                  alt="Dashboard Preview"
                  width={600} 
                  height={400}
                  className="rounded-md"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Comprehensive Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our hospital management system is designed to meet the needs of all healthcare professionals.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Admin Dashboard",
                description: "Complete overview of hospital operations, staff management, and financial metrics.",
                icon: (
                  <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                )
              },
              {
                title: "Doctor Portal",
                description: "Manage patient appointments, medical records, and treatment plans efficiently.",
                icon: (
                  <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h2.5L9 5l4 14 2.5-7h2.5" />
                  </svg>
                )
              },
              {
                title: "Pharmacy Management",
                description: "Track inventory, manage prescriptions, and monitor medicine expiration dates.",
                icon: (
                  <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3h6a6 6 0 016 6v6a6 6 0 01-6 6H9a6 6 0 01-6-6V9a6 6 0 016-6z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15" />
                  </svg>
                )
              },
              {
                title: "Reception & Billing",
                description: "Streamline patient registration, appointment scheduling, and payment processing.",
                icon: (
                  <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              },
              {
                title: "Patient Records",
                description: "Maintain comprehensive electronic health records with secure access controls.",
                icon: (
                  <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )
              },
              {
                title: "Analytics & Reports",
                description: "Generate detailed reports for informed decision-making and operational improvements.",
                icon: (
                  <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2a2 2 0 00-2 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                )
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg transition-all hover:shadow-lg">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6 text-indigo-600">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-indigo-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Healthcare Professionals</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what our users have to say about our hospital management system.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "This system has transformed how we manage patient care. Everything is now streamlined and efficient.",
                name: "Dr. Sarah Johnson",
                role: "Chief Medical Officer",
                hospital: "Metro General Hospital"
              },
              {
                quote: "The pharmacy module is intuitive and helps us prevent medication errors. Stock management has never been easier.",
                name: "Robert Chen",
                role: "Head Pharmacist",
                hospital: "City Medical Center"
              },
              {
                quote: "Patient registration and billing are now seamless processes. Our reception staff loves the user-friendly interface.",
                name: "Emily Rodriguez",
                role: "Admin Manager",
                hospital: "Riverside Health"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow">
                <div className="text-indigo-600 text-4xl mb-4">&quot;</div>
                <p className="text-gray-700 mb-6 italic">{testimonial.quote}</p>
                <div>
                  <p className="font-bold text-gray-900">{testimonial.name}</p>
                  <p className="text-gray-600">{testimonial.role}</p>
                  <p className="text-gray-600">{testimonial.hospital}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that works for your healthcare facility.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Basic Plan",
                price: "150,000 RWF",
                period: "per month",
                description: "Perfect for local clinics & individual pharmacies",
                features: [
                  "Up to 5 staff accounts",
                  "Patient registration & history",
                  "Standard appointment booking",
                  "Basic inventory & billing",
                  "Email & Phone support"
                ]
              },
              {
                name: "Professional Plan",
                price: "350,000 RWF",
                period: "per month",
                description: "Ideal for busy clinics & larger pharmacies",
                features: [
                  "Up to 25 staff accounts",
                  "RSSB / Mutuelle de Santé billing integration",
                  "E-prescriptions & laboratory records",
                  "Multi-branch stock & distributor tracking",
                  "24/7 priority support & training"
                ],
                highlighted: true
              },
              {
                name: "Enterprise Plan",
                price: "Custom",
                period: "",
                description: "For large hospitals & referral health networks",
                features: [
                  "Unlimited staff & doctor accounts",
                  "Full RSSB, MMI & private insurance billing",
                  "Integrated pharmacy, labs, wards & billing",
                  "Dedicated local server deployment",
                  "Custom analytics, exports & API access"
                ]
              }
            ].map((plan, index) => (
              <div 
                key={index} 
                className={`p-6 rounded-lg transition-all ${
                  plan.highlighted 
                    ? 'bg-indigo-600 text-white shadow-xl relative scale-105' 
                    : 'bg-gray-50 text-gray-900 hover:shadow-lg'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white px-4 py-1 rounded-full text-sm">
                    Most Popular
                  </div>
                )}
                <h3 className={`text-2xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className={`${plan.highlighted ? 'text-indigo-100' : 'text-gray-600'}`}> {plan.period}</span>
                </div>
                <p className={`mb-6 ${plan.highlighted ? 'text-indigo-100' : 'text-gray-600'}`}>
                  {plan.description}
                </p>
                <ul className="mb-8 space-y-2">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center">
                      <svg className={`w-5 h-5 mr-2 ${plan.highlighted ? 'text-indigo-200' : 'text-indigo-600'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/login">
                  <div
                    className={`block text-center w-full py-2 px-4 rounded-full transition focus:outline-none ${
                      plan.highlighted 
                        ? 'bg-white text-indigo-600 hover:bg-indigo-50' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-indigo-600 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to transform your healthcare management?</h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">
            Join thousands of healthcare professionals who are already using our system to improve patient care.
          </p>
          <Link 
            href="/login" 
            className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-full font-medium hover:bg-indigo-50 transition"
          >
            Get Started Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Image 
                  src="/logo.svg" 
                  alt="HMS Logo" 
                  width={30} 
                  height={30} 
                  className="mr-2"
                />
                <span className="font-bold text-xl">Hospinix</span>
              </div>
              <p className="text-gray-400">
                Modern healthcare management solution for hospitals and clinics of all sizes.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Case Studies</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Blog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">HIPAA Compliance</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Hospinix. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      {isDemoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-opacity duration-300">
          <div className="bg-slate-950 text-white rounded-2xl max-w-4xl w-full border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800 bg-slate-900/50">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span className="text-sm font-semibold text-slate-300">Hospinix Interactive Demo Walkthrough</span>
              </div>
              <button 
                onClick={() => setIsDemoOpen(false)}
                className="text-slate-400 hover:text-white transition p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Tabs / Chapters */}
              <div className="flex space-x-2 mb-6 bg-slate-900 p-1.5 rounded-lg border border-slate-800/80">
                {[
                  { id: "admin", label: "Admin Portal", icon: "🏥" },
                  { id: "doctor", label: "Doctor Portal", icon: "👨‍⚕️" },
                  { id: "pharmacist", label: "Pharmacy Hub", icon: "💊" },
                  { id: "receptionist", label: "Reception & Billing", icon: "🧾" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-all cursor-pointer ${
                      activeDemoTab === tab.id
                        ? "bg-indigo-600 text-white shadow-lg"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Simulated Video Screen */}
              <div className="relative aspect-video bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-inner flex flex-col justify-between">
                {/* Simulated Screen Content based on Active Tab */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  {/* Title Bar */}
                  <div className="flex justify-between items-center text-xs text-slate-400 border-b border-slate-800 pb-3 mb-4">
                    <span>Hospinix OS v1.0.0</span>
                    <span className="font-mono text-indigo-400">{activeDemoTab.toUpperCase()}_SESSION_ACTIVE</span>
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 flex flex-col justify-center">
                    {activeDemoTab === "admin" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-4 gap-4">
                          {[
                            { label: "Total Doctors", val: "14", color: "border-emerald-500 text-emerald-400" },
                            { label: "Pharmacists", val: "8", color: "border-sky-500 text-sky-400" },
                            { label: "Beds Occupied", val: "22/30", color: "border-amber-500 text-amber-400" },
                            { label: "Today's Revenue", val: "840,000 RWF", color: "border-indigo-500 text-indigo-400" }
                          ].map((stat, i) => (
                            <div key={i} className={`bg-slate-950 p-3 rounded-lg border-l-4 ${stat.color}`}>
                              <p className="text-[10px] text-slate-400 uppercase tracking-wider">{stat.label}</p>
                              <p className="text-lg font-bold mt-1">{stat.val}</p>
                            </div>
                          ))}
                        </div>
                        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/80">
                          <p className="text-xs font-semibold mb-2 text-slate-300">Staff Account Management</p>
                          <div className="space-y-1.5">
                            {[
                              { name: "Dr. Mutangana Eric", role: "Doctor", status: "Active" },
                              { name: "Mukamana Marie", role: "Pharmacist", status: "Active" }
                            ].map((staff, idx) => (
                              <div key={idx} className="flex justify-between text-xs py-1.5 border-b border-slate-900 last:border-0">
                                <span className="text-slate-300">{staff.name}</span>
                                <span className="text-slate-400">{staff.role}</span>
                                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px]">{staff.status}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeDemoTab === "doctor" && (
                      <div className="space-y-4">
                        <div className="flex space-x-4">
                          <div className="flex-1 bg-slate-950 p-4 rounded-lg border border-slate-800/80">
                            <p className="text-xs font-semibold mb-2 text-slate-300">Current Consultation</p>
                            <div className="space-y-1 text-xs">
                              <p><span className="text-slate-400">Patient:</span> Kagabo Jean</p>
                              <p><span className="text-slate-400">Age / Sex:</span> 34 / Male</p>
                              <p><span className="text-slate-400">Insurance:</span> RSSB (RAMA) - 85% Coverage</p>
                              <p className="text-indigo-400 font-medium mt-2">Diagnosis: Acute Respiratory Infection</p>
                            </div>
                          </div>
                          <div className="w-1/3 bg-slate-950 p-4 rounded-lg border border-slate-800/80">
                            <p className="text-xs font-semibold mb-2 text-slate-300">Prescription Builder</p>
                            <div className="space-y-1 text-[11px]">
                              <div className="bg-indigo-950/40 text-indigo-300 p-1.5 rounded border border-indigo-900/50">
                                Amoxicillin 500mg
                                <p className="text-[9px] text-slate-400">1 tab x 3 times daily - 5 days</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeDemoTab === "pharmacist" && (
                      <div className="space-y-4">
                        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/80">
                          <div className="flex justify-between items-center mb-3">
                            <p className="text-xs font-semibold text-slate-300">Pharmacy Inventory & Warnings</p>
                            <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] animate-pulse">Low Stock Alert</span>
                          </div>
                          <div className="space-y-2">
                            {[
                              { name: "Paracetamol 500mg", stock: 12, minStock: 100, status: "Low Stock" },
                              { name: "Amoxicillin 500mg", stock: 240, minStock: 50, status: "Healthy" },
                              { name: "Coartem (Artemether/Lumefantrine)", stock: 8, minStock: 40, status: "Critical" }
                            ].map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-xs py-1">
                                <span className="text-slate-300">{item.name}</span>
                                <div className="flex items-center space-x-3">
                                  <span className="text-slate-400">{item.stock} units left</span>
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                                    item.status === "Healthy" 
                                      ? "bg-emerald-500/20 text-emerald-400" 
                                      : item.status === "Low Stock"
                                        ? "bg-amber-500/20 text-amber-400"
                                        : "bg-red-500/20 text-red-400"
                                  }`}>{item.status}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeDemoTab === "receptionist" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-center">
                            <p className="text-[10px] text-slate-400 uppercase">Registered Today</p>
                            <p className="text-xl font-bold text-slate-200 mt-1">24</p>
                          </div>
                          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-center">
                            <p className="text-[10px] text-slate-400 uppercase">Pending Invoices</p>
                            <p className="text-xl font-bold text-amber-400 mt-1">3</p>
                          </div>
                          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-center">
                            <p className="text-[10px] text-slate-400 uppercase">Completed Claims</p>
                            <p className="text-xl font-bold text-emerald-400 mt-1">19</p>
                          </div>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/80">
                          <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800 mb-2">
                            <span className="font-semibold text-slate-300">Invoice: INV-2026-0089</span>
                            <span className="text-slate-400">Patient: Nkurunziza Jean</span>
                          </div>
                          <div className="flex justify-between text-xs py-1">
                            <span className="text-slate-400">Consultation + Labs Fee:</span>
                            <span className="text-slate-300">15,000 RWF</span>
                          </div>
                          <div className="flex justify-between text-xs py-1">
                            <span className="text-slate-400">RSSB (RAMA) Copay (85%):</span>
                            <span className="text-emerald-400">-12,750 RWF</span>
                          </div>
                          <div className="flex justify-between text-xs pt-2 border-t border-slate-800 font-bold">
                            <span>Patient Pays (15%):</span>
                            <span className="text-indigo-400">2,250 RWF</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Simulated Player Controls */}
                <div className="bg-slate-950 px-4 py-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="text-white hover:text-indigo-400 transition cursor-pointer"
                    >
                      {isPlaying ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                    <span>{isPlaying ? "Simulated Playback" : "Paused"}</span>
                  </div>

                  <div className="flex-1 flex items-center mx-6">
                    <div className="relative w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-500 h-full rounded-full transition-all duration-100 ease-out" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <span className="ml-3 font-mono text-[10px]">
                      {`0:${Math.floor((progress * 0.15)).toString().padStart(2, '0')} / 0:15`}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] bg-indigo-900/50 text-indigo-300 border border-indigo-800 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">HD 1080p</span>
                  </div>
                </div>
              </div>

              {/* Guide/Instruction Text */}
              <div className="mt-4 text-center text-xs text-slate-400">
                <p>Click on any portal tab above to pause auto-play and inspect that system module manually.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
