"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, Brain, Lock } from "lucide-react";
import Link from "next/link";

export function FuturisticHero() {
  const [currentText, setCurrentText] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const heroTexts = [
    "AI-Powered Legal Intelligence",
    "Secure Document Processing",
    "Private LLM Platform",
    "Enterprise-Grade Security"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentText((prev) => (prev + 1) % heroTexts.length);
        setIsVisible(true);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse"></div>
        
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
        {/* Scanning Lines */}
        <div className="absolute inset-0">
          <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-scan-horizontal"></div>
          <div className="absolute h-full w-px bg-gradient-to-b from-transparent via-purple-400 to-transparent animate-scan-vertical"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Logo Animation */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center transform rotate-12 animate-float">
              <span className="text-white font-bold text-3xl transform -rotate-12">S</span>
            </div>
            <div className="absolute inset-0 w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-50 blur-xl animate-pulse"></div>
          </div>
        </div>

        {/* Main Heading */}
        <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
          STEALTH
        </h1>

        {/* Animated Subheading */}
        <div className="h-16 mb-8 flex items-center justify-center">
          <h2 className={`text-2xl md:text-4xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent transition-all duration-300 ${isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}`}>
            {heroTexts[currentText]}
          </h2>
        </div>

        {/* Description */}
        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
          The next-generation private LLM platform designed exclusively for law firms. 
          Harness the power of AI while maintaining absolute confidentiality and security.
        </p>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <div className="flex items-center space-x-2 bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-full px-4 py-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-300">Enterprise Security</span>
          </div>
          <div className="flex items-center space-x-2 bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-full px-4 py-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-300">AI-Powered</span>
          </div>
          <div className="flex items-center space-x-2 bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-full px-4 py-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-gray-300">Private & Secure</span>
          </div>
          <div className="flex items-center space-x-2 bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-full px-4 py-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-300">Lightning Fast</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-200"
            asChild
          >
            <Link href="/auth/sign-up">
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
          
          <Button 
            size="lg" 
            variant="outline" 
            className="border-gray-600 text-white hover:bg-gray-800 px-8 py-4 text-lg font-semibold rounded-xl backdrop-blur-sm"
            asChild
          >
            <Link href="#features">
              Learn More
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">99.9%</div>
            <div className="text-gray-400">Uptime Guarantee</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">256-bit</div>
            <div className="text-gray-400">Encryption Standard</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">24/7</div>
            <div className="text-gray-400">Expert Support</div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full mt-2 animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}