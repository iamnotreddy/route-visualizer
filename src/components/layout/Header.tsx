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
    <header className='sticky top-0 z-50 rounded-lg  bg-transparent'>
      <div className='border- mx-8 flex h-14 items-center justify-between'>
        <UnstyledLink
          href='/'
          className='rounded-lg border-white bg-green-800 bg-opacity-80 p-2 font-sans text-3xl text-white hover:text-blue-200'
        >
          RouteMapper
        </UnstyledLink>

        <nav>
          <ul className='flex items-center space-x-4'>
            {name && (
              <div className='flex flex-row items-center justify-center space-x-2 rounded-full bg-slate-400 bg-opacity-60 px-2 text-sm text-black'>
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
                <p>{name}</p>
              </div>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
