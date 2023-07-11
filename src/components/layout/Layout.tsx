import * as React from 'react';

import Header from '@/components/layout/Header';
import ArrowLink from '@/components/links/ArrowLink';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex min-h-screen flex-col items-center'>
      <div className='absolute top-0 left-0 z-20 w-full'>
        <Header />
      </div>
      <div className='w-full'>{children}</div>
      <footer className='fixed bottom-0 mt-auto hidden justify-center rounded-lg border-2 border-slate-400 border-opacity-5 bg-zinc-400 bg-opacity-20 p-1 text-gray-800 sm:block'>
        © {new Date().getFullYear()} by{' '}
        <ArrowLink href='https://github.com/iamnotreddy'>raveen</ArrowLink>
      </footer>
    </div>
  );
}
