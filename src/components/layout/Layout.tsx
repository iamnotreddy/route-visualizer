import { Session } from 'next-auth';
import * as React from 'react';
import { useEffect, useState } from 'react';

import { InfoModal } from '@/components/InfoModal';
import Header from '@/components/layout/Header';
import ArrowLink from '@/components/links/ArrowLink';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/primitives/Dialog';

export default function Layout({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: Session | null;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDialogOpen(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className='flex min-h-screen flex-col items-center'>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <div className='absolute top-0 left-0 z-20 w-full'>
          <Header session={session} />
        </div>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Explore the adventures the world has to offer.
            </DialogTitle>
            <DialogDescription>
              <InfoModal />
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <div className='w-full'>{children}</div>
      <footer className='fixed bottom-0 mt-auto hidden justify-center rounded-lg border-2 border-slate-400 border-opacity-5 bg-zinc-400 bg-opacity-20 p-1 text-gray-800 sm:block'>
        © {new Date().getFullYear()} by{' '}
        <ArrowLink href='https://github.com/iamnotreddy'>raveen</ArrowLink>
      </footer>
    </div>
  );
}
