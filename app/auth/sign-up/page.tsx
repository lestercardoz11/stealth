import { SignUpForm } from '@/components/sign-up-form';

export default function Page() {
  return (
    <div className='relative overflow-hidden flex bg-black min-h-svh w-full items-center justify-center p-6 md:p-10'>
      <div className='absolute inset-0'>
        {/* Grid Pattern */}
        <div className='absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse'></div>

        {/* Floating Orbs */}
        <div className='absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse'></div>
        <div className='absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000'></div>
        <div className='absolute top-1/2 left-1/2 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-2000'></div>

        {/* Scanning Lines */}
        <div className='absolute inset-0'>
          <div className='absolute w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-scan-horizontal'></div>
          <div className='absolute h-full w-px bg-gradient-to-b from-transparent via-purple-400 to-transparent animate-scan-vertical'></div>
        </div>
      </div>
      <div className='w-full max-w-sm z-50'>
        <SignUpForm />
      </div>
    </div>
  );
}
