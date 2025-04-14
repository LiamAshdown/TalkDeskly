"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

// Slider content
const slides = [
  {
    title: "Welcome to our platform",
    description:
      "We're excited to have you join us. Complete your registration to get started with all the features our platform has to offer.",
    features: [
      {
        title: "Personalized Dashboard",
        description: "Access all your information in one place",
      },
      {
        title: "Seamless Collaboration",
        description: "Work together with your team efficiently",
      },
      {
        title: "Advanced Analytics",
        description: "Gain insights with detailed reporting",
      },
    ],
  },
  {
    title: "Join thousands of users",
    description:
      "Our platform helps teams around the world to collaborate and achieve their goals faster.",
    features: [
      {
        title: "Real-time Updates",
        description: "Stay informed with instant notifications",
      },
      {
        title: "Secure Environment",
        description: "Your data is protected with enterprise-grade security",
      },
      {
        title: "24/7 Support",
        description: "Our team is always ready to help you",
      },
    ],
  },
  {
    title: "Powerful tools for your workflow",
    description:
      "Unlock your team's potential with our suite of productivity tools designed for modern teams.",
    features: [
      {
        title: "Smart Automation",
        description: "Save time with automated workflows",
      },
      {
        title: "Integrated Calendar",
        description: "Schedule and manage events effortlessly",
      },
      {
        title: "File Management",
        description: "Store and share files securely in the cloud",
      },
    ],
  },
];

export function LeftColumn() {
  // Slider state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, []);

  // Auto-rotate slides
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  return (
    <div
      className="flex min-h-[600px] md:min-h-screen flex-col justify-center bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-white md:p-8 lg:p-10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="mx-auto w-full max-w-xl overflow-hidden">
        <div className="mb-6 inline-block rounded-lg bg-slate-700/30 p-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>

        {/* Slider container */}
        <div className="relative h-[420px]">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute left-0 top-0 w-full transition-all duration-500 ease-in-out ${
                index === currentSlide
                  ? "translate-x-0 opacity-100"
                  : index < currentSlide
                  ? "-translate-x-full opacity-0"
                  : "translate-x-full opacity-0"
              }`}
              aria-hidden={index !== currentSlide}
            >
              <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
                {slide.title}
              </h1>
              <p className="mb-8 text-slate-300">{slide.description}</p>

              <div className="space-y-5">
                {slide.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-4">
                    <div className="rounded-full bg-slate-700/30 p-1">
                      <Check className="h-5 w-5 text-teal-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-slate-300">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Slider controls */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={prevSlide}
            className="rounded-full bg-slate-700/50 p-2 text-white transition-colors hover:bg-slate-600/50"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 w-2 rounded-full transition-all ${
                  index === currentSlide
                    ? "w-6 bg-teal-400"
                    : "bg-slate-600 hover:bg-slate-500"
                }`}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === currentSlide}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            className="rounded-full bg-slate-700/50 p-2 text-white transition-colors hover:bg-slate-600/50"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
