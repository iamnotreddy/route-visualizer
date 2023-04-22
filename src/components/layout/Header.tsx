/* eslint-disable @next/next/no-img-element */
import { useSession } from 'next-auth/react';
import * as React from 'react';

import UnstyledLink from '@/components/links/UnstyledLink';

const href = '/';

export default function Header() {
  const { data: session } = useSession();

  let imageLink = '';
  let name = '';

  if (
    typeof session?.user?.image == 'string' &&
    typeof session.user.name == 'string'
  ) {
    imageLink = session.user?.image;
    name = session.user.name;
  }

  return (
    <header className='sticky top-0 z-50 bg-green-900'>
      <div className='border- mx-8 flex h-14 items-center justify-between'>
        <UnstyledLink
          href='/'
          className='font-sans text-xl text-slate-200 hover:text-blue-200'
        >
          RouteViz
        </UnstyledLink>

        <nav>
          <ul className='flex items-center space-x-4'>
            <UnstyledLink href={href}>
              {session && (
                <img
                  className='h-10 w-10 rounded-full hover:text-gray-600'
                  src={imageLink}
                  alt=''
                />
              )}
            </UnstyledLink>
            {name && <p className='text-sm text-white'>{name}</p>}
          </ul>
        </nav>
      </div>
    </header>
  );
}
