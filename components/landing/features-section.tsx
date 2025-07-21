'use client';

import {
  Shield,
  Brain,
  Zap,
  Lock,
  Users,
  FileText,
  MessageSquare,
  BarChart3,
} from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      icon: Brain,
      title: 'Advanced AI Processing',
      description:
        'State-of-the-art language models trained specifically for legal workflows and document analysis.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description:
        'Bank-grade encryption, SOC 2 compliance, and zero-trust architecture protect your sensitive data.',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Lock,
      title: 'Private Deployment',
      description:
        'Your data never leaves your infrastructure. Complete control over your AI models and information.',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: Zap,
      title: 'Lightning Performance',
      description:
        'Optimized for speed with sub-second response times and real-time document processing.',
      gradient: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description:
        'Role-based access controls and collaborative workspaces designed for legal teams.',
      gradient: 'from-indigo-500 to-purple-500',
    },
    {
      icon: FileText,
      title: 'Document Intelligence',
      description:
        'Automated contract analysis, legal research, and document generation with AI assistance.',
      gradient: 'from-teal-500 to-blue-500',
    },
    {
      icon: MessageSquare,
      title: 'Intelligent Chat',
      description:
        'Natural language interface for legal queries, research, and document drafting assistance.',
      gradient: 'from-rose-500 to-pink-500',
    },
    {
      icon: BarChart3,
      title: 'Analytics & Insights',
      description:
        'Comprehensive analytics on usage patterns, efficiency gains, and ROI metrics.',
      gradient: 'from-violet-500 to-purple-500',
    },
  ];

  return (
    <section id='features' className='py-24 bg-background'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Section Header */}
        <div className='text-center mb-16'>
          <h2 className='text-4xl md:text-6xl font-bold mb-6 text-foreground'>
            Powerful Features
          </h2>
          <p className='text-xl text-muted-foreground max-w-3xl mx-auto'>
            Everything you need to transform your legal practice with AI-powered
            intelligence
          </p>
        </div>

        {/* Features Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className='group relative bg-card border rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 hover:transform hover:scale-105'
              style={{
                animationDelay: `${index * 100}ms`,
              }}>
              {/* Icon */}
              <div
                className='relative w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300'>
                <feature.icon className='w-6 h-6 text-primary-foreground' />
              </div>

              {/* Content */}
              <h3 className='text-xl font-semibold text-card-foreground mb-3 transition-all duration-300'>
                {feature.title}
              </h3>
              <p className='text-muted-foreground leading-relaxed'>
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Security Section */}
        <div className='mt-24 text-center'>
          <div className='bg-card border rounded-3xl p-12 max-w-7xl mx-auto'>
            <div className='flex justify-center mb-6'>
              <div className='w-16 h-16 bg-primary rounded-2xl flex items-center justify-center'>
                <Shield className='w-8 h-8 text-primary-foreground' />
              </div>
            </div>
            <h3 className='text-3xl font-bold text-card-foreground mb-4'>
              Security First Approach
            </h3>
            <p className='text-xl text-muted-foreground mb-8 max-w-2xl mx-auto'>
              Built with the highest security standards in mind. Your data is
              encrypted at rest and in transit, with complete audit trails and
              compliance with legal industry requirements.
            </p>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
              <div className='text-center'>
                <div className='text-2xl font-bold text-card-foreground mb-2'>SOC 2</div>
                <div className='text-muted-foreground'>Type II Certified</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-card-foreground mb-2'>GDPR</div>
                <div className='text-muted-foreground'>Compliant</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-card-foreground mb-2'>
                  ISO 27001
                </div>
                <div className='text-muted-foreground'>Certified</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
