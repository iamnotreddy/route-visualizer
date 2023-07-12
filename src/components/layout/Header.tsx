import Image from 'next/image';
import { signIn, signOut, useSession } from 'next-auth/react';
import * as React from 'react';

import { UserProfileIcon } from '@/components/layout/icons';
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
    <header className='sticky top-0 z-50 rounded-lg bg-transparent pt-2'>
      <div className='border- mx-8 flex h-14 items-center justify-between'>
        <UnstyledLink
          href='/'
          className='rounded-lg border-white bg-black bg-opacity-70 p-2 font-sans text-3xl text-white hover:text-blue-200'
        >
          re.play
        </UnstyledLink>

        <nav>
          <div className='flex flex-row items-center justify-center space-x-2 rounded-2xl bg-black bg-opacity-70 px-2 pt-1 text-black'>
            <UnstyledLink href='/' onClick={() => signOut()}>
              {session ? (
                <Image
                  className='rounded-full'
                  src={imageLink}
                  alt='profile picture'
                  width={45}
                  height={45}
                />
              ) : (
                <button onClick={() => signIn()} className='text-white '>
                  <UserProfileIcon />
                </button>
              )}
            </UnstyledLink>
            <p className='text-xs font-light text-white'>{name}</p>
          </div>
        </nav>
      </div>
    </header>
  );
}
