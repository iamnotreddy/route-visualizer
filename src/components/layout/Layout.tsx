import * as React from 'react';

import ArrowLink from '@/components/links/ArrowLink';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex min-h-screen flex-col'>
      <div className='flex flex-grow items-center justify-center bg-slate-100'>
        <div className='w-full'>{children}</div>
        <footer className='fixed bottom-0 mt-auto hidden justify-center rounded-lg border-2 border-slate-400 border-opacity-5 bg-zinc-400 bg-opacity-5 p-1 text-gray-800 sm:block'>
          © {new Date().getFullYear()} by{' '}
          <ArrowLink href='https://github.com/iamnotreddy'>raveen</ArrowLink>
        </footer>
      </div>
    </div>
  );
}
