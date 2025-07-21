'use client';
import { Shield, Zap, Brain, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';

export function FuturisticHero() {
  const [currentText, setCurrentText] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const heroTexts = [
    'AI-Powered Legal Intelligence',
    'Secure Document Processing',
    'Private LLM Platform',
    'Enterprise-Grade Security',
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
  });
  return (
    <div className='relative min-h-screen flex items-center justify-center overflow-hidden bg-background'>
      {/* Content */}
      <div className='relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
        {/* Logo */}
        <div className='mb-8 flex justify-center'>
          <div className='w-24 h-24 bg-primary rounded-2xl flex items-center justify-center'>
            <span className='text-primary-foreground font-bold text-3xl'>
              S
            </span>
          </div>
        </div>
        {/* Main Heading */}
        <h1 className='text-6xl md:text-8xl font-bold mb-6 text-foreground'>
          STEALTH
        </h1>
        {/* Animated Subheading */}
        <div className='h-16 mb-8 flex items-center justify-center'>
          <h2
            className={`text-2xl md:text-4xl font-semibold text-primary transition-all duration-300 ${
              isVisible
                ? 'opacity-100 transform translate-y-0'
                : 'opacity-0 transform translate-y-4'
            }`}>
            {heroTexts[currentText]}
          </h2>
        </div>
        {/* Description */}
        <p className='text-xl md:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed'>
          The next-generation private LLM platform designed exclusively for law
          firms. Harness the power of AI while maintaining absolute
          confidentiality and security.
        </p>
        {/* Feature Pills */}
        <div className='flex flex-wrap justify-center gap-4 mb-12'>
          <div className='flex items-center space-x-2 bg-card border rounded-full px-4 py-2'>
            <Shield className='w-4 h-4 text-primary' />
            <span className='text-sm text-card-foreground'>
              Enterprise Security
            </span>
          </div>
          <div className='flex items-center space-x-2 bg-card border rounded-full px-4 py-2'>
            <Brain className='w-4 h-4 text-primary' />
            <span className='text-sm text-card-foreground'>AI-Powered</span>
          </div>
          <div className='flex items-center space-x-2 bg-card border rounded-full px-4 py-2'>
            <Lock className='w-4 h-4 text-primary' />
            <span className='text-sm text-card-foreground'>
              Private & Secure
            </span>
          </div>
          <div className='flex items-center space-x-2 bg-card border rounded-full px-4 py-2'>
            <Zap className='w-4 h-4 text-primary' />
            <span className='text-sm text-card-foreground'>Lightning Fast</span>
          </div>
        </div>
      </div>
    </div>
  );
}
