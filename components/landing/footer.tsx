import Link from 'next/link';
import { Shield, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className='bg-card border-t'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
          {/* Brand */}
          <div className='col-span-1 md:col-span-2'>
            <div className='flex items-center space-x-3 mb-4'>
              <div className='w-8 h-8 bg-primary rounded-lg flex items-center justify-center'>
                <span className='text-primary-foreground font-bold text-sm'>S</span>
              </div>
              <span className='text-xl font-bold text-primary'>
                Stealth
              </span>
            </div>
            <p className='text-muted-foreground mb-6 max-w-md'>
              The next-generation private LLM platform designed exclusively for
              law firms. Secure, intelligent, and built for the future of legal
              practice.
            </p>
            <div className='flex items-center space-x-2 text-sm text-muted-foreground'>
              <Shield className='w-4 h-4' />
              <span>Enterprise-grade security and compliance</span>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className='text-card-foreground font-semibold mb-4'>Contact</h3>
            <ul className='space-y-3'>
              <li className='flex items-center space-x-2 text-muted-foreground'>
                <Mail className='w-4 h-4' />
                <span>contact@stealth.ai</span>
              </li>
              <li className='flex items-center space-x-2 text-muted-foreground'>
                <Phone className='w-4 h-4' />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className='flex items-center space-x-2 text-muted-foreground'>
                <MapPin className='w-4 h-4' />
                <span>Mumbai, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className='border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center'>
          <p className='text-muted-foreground text-sm'>
            © 2024 Stealth AI. All rights reserved.
          </p>
          <div className='flex space-x-6 mt-4 md:mt-0'>
            <Link
              href='/privacy'
              className='text-muted-foreground hover:text-foreground text-sm transition-colors'>
              Privacy Policy
            </Link>
            <Link
              href='/terms'
              className='text-muted-foreground hover:text-foreground text-sm transition-colors'>
              Terms of Service
            </Link>
            <Link
              href='/compliance'
              className='text-muted-foreground hover:text-foreground text-sm transition-colors'>
              Compliance
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
