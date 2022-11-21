/* eslint-disable @next/next/no-img-element */
import { useSession } from 'next-auth/react';
import * as React from 'react';

import UnstyledLink from '@/components/links/UnstyledLink';

const href = '/';

export default function Header() {
  const { data: session } = useSession();

  let imageLink = '';

  if (typeof session?.user?.image == 'string') {
    imageLink = session.user?.image;
  }

  return (
    <header className='sticky top-0 z-50 bg-green-900'>
      <div className='layout flex h-14 items-center justify-between'>
        <UnstyledLink
          href='/'
          className='font-sans text-xl text-slate-200 hover:text-blue-200'
        >
          RouteViz
        </UnstyledLink>
        <nav>
          <ul className='flex items-center justify-between space-x-4'>
            <UnstyledLink href={href}>
              {session && (
                <img
                  className='h-10 w-10 rounded-full hover:text-gray-600'
                  src={imageLink}
                  alt=''
                />
              )}
            </UnstyledLink>
          </ul>
        </nav>
      </div>
    </header>
  );
}
