import Image from 'next/image';
import { signOut, useSession } from 'next-auth/react';
import * as React from 'react';

import UnstyledLink from '@/components/links/UnstyledLink';

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
          RouteMapper
        </UnstyledLink>

        <nav>
          <ul className='flex items-center space-x-4'>
            <UnstyledLink href='/' onClick={() => signOut()}>
              {session && (
                <Image
                  className='rounded-full'
                  src={imageLink}
                  alt='profile picture'
                  width={45}
                  height={45}
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
