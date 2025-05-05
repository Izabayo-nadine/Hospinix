"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
// import Dr from '../public/images/dr.jpg'
import Link from "next/link";


export default function Home() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

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
                <a
                  href="#demo"
                  className="border border-indigo-600 text-indigo-600 px-8 py-3 rounded-full text-center hover:bg-indigo-50 transition"
                >
                  Watch Demo
                </a>
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
                icon: "🏥"
              },
              {
                title: "Doctor Portal",
                description: "Manage patient appointments, medical records, and treatment plans efficiently.",
                icon: "👨‍⚕️"
              },
              {
                title: "Pharmacy Management",
                description: "Track inventory, manage prescriptions, and monitor medicine expiration dates.",
                icon: "💊"
              },
              {
                title: "Reception & Billing",
                description: "Streamline patient registration, appointment scheduling, and payment processing.",
                icon: "🧾"
              },
              {
                title: "Patient Records",
                description: "Maintain comprehensive electronic health records with secure access controls.",
                icon: "📋"
              },
              {
                title: "Analytics & Reports",
                description: "Generate detailed reports for informed decision-making and operational improvements.",
                icon: "📊"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg transition-all hover:shadow-lg">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
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
                <div className="text-indigo-600 text-4xl mb-4">"</div>
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
                name: "Basic",
                price: "$299",
                period: "per month",
                description: "Perfect for small clinics",
                features: [
                  "Up to 5 doctor accounts",
                  "Patient management",
                  "Basic appointment scheduling",
                  "Simple billing system",
                  "Email support"
                ]
              },
              {
                name: "Professional",
                price: "$599",
                period: "per month",
                description: "Ideal for growing medical facilities",
                features: [
                  "Up to 15 doctor accounts",
                  "All Basic features",
                  "Advanced scheduling system",
                  "Comprehensive billing & insurance",
                  "Pharmacy management",
                  "Priority support"
                ],
                highlighted: true
              },
              {
                name: "Enterprise",
                price: "Custom",
                period: "",
                description: "For large hospitals & healthcare networks",
                features: [
                  "Unlimited accounts",
                  "All Professional features",
                  "Custom integrations",
                  "Advanced analytics & reporting",
                  "Dedicated support manager",
                  "Staff training sessions"
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
    </div>
  );
}
