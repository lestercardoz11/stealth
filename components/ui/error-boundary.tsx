'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import Link from 'next/link';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className='min-h-screen flex items-center justify-center p-6 bg-background'>
          <Card className='w-full max-w-md'>
            <CardHeader className='text-center'>
              <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10'>
                <AlertTriangle className='h-6 w-6 text-destructive' />
              </div>
              <CardTitle className='text-xl'>Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p className='text-center text-muted-foreground text-sm'>
                An unexpected error occurred. We apologize for the inconvenience.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className='bg-muted p-3 rounded text-xs font-mono'>
                  <summary className='cursor-pointer font-semibold mb-2'>
                    Error Details (Development)
                  </summary>
                  <div className='space-y-2'>
                    <div>
                      <strong>Error:</strong> {this.state.error.message}
                    </div>
                    <div>
                      <strong>Stack:</strong>
                      <pre className='whitespace-pre-wrap text-xs mt-1'>
                        {this.state.error.stack}
                      </pre>
                    </div>
                  </div>
                </details>
              )}

              <div className='flex flex-col gap-2'>
                <Button onClick={this.handleRetry} className='w-full'>
                  <RefreshCw className='mr-2 h-4 w-4' />
                  Try Again
                </Button>
                
                <Button variant='outline' asChild className='w-full'>
                  <Link href='/'>
                    <Home className='mr-2 h-4 w-4' />
                    Go Home
                  </Link>
                </Button>

                <Button 
                  variant='ghost' 
                  size='sm'
                  onClick={() => {
                    // In production, this would send error reports
                    console.log('Report error clicked');
                  }}
                  className='w-full text-xs'
                >
                  <Bug className='mr-2 h-3 w-3' />
                  Report Issue
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simpler error fallback for smaller components
export function ErrorFallback({ 
  error, 
  resetError 
}: { 
  error: Error; 
  resetError: () => void;
}) {
  return (
    <div className='p-4 border border-destructive/20 bg-destructive/5 rounded-lg'>
      <div className='flex items-center gap-2 mb-2'>
        <AlertTriangle className='h-4 w-4 text-destructive' />
        <h3 className='font-medium text-destructive'>Something went wrong</h3>
      </div>
      <p className='text-sm text-muted-foreground mb-3'>
        {error.message || 'An unexpected error occurred'}
      </p>
      <Button size='sm' variant='outline' onClick={resetError}>
        <RefreshCw className='mr-2 h-3 w-3' />
        Try again
      </Button>
    </div>
  );
}