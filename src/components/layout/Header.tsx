import Image from 'next/image';
import { Session } from 'next-auth';
import { signIn, signOut } from 'next-auth/react';
import * as React from 'react';

import { InfoCircle } from '@/components/layout/icons';
import UnstyledLink from '@/components/links/UnstyledLink';
import { DialogTrigger } from '@/components/primitives/Dialog';

export default function Header(props: { session: Session | null | undefined }) {
  const { session } = props;

  let imageLink = '';
  let name = '';

  if (
    session &&
    session.user &&
    typeof session.user.image == 'string' &&
    typeof session.user.name == 'string'
  ) {
    imageLink = session.user?.image;
    name = session.user.name;
  }

  return (
    <header className='sticky top-0 z-50 rounded-lg bg-transparent pt-2'>
      <div className='mx-8 flex h-14 items-center justify-between'>
        <div className='flex flex-row items-center justify-center space-x-2'>
          <UnstyledLink
            href='/'
            className='rounded-lg border-white bg-black bg-opacity-70 p-2 font-sans text-3xl text-white hover:text-blue-200'
          >
            re.play
          </UnstyledLink>
          <DialogTrigger>
            <InfoCircle />
          </DialogTrigger>
        </div>

        <nav>
          <div className='flex flex-row items-center justify-center space-x-2 rounded-2xl bg-black bg-opacity-70 px-2 pt-1 text-white hover:bg-slate-500'>
            {session && session.user ? (
              <UnstyledLink href='/' onClick={() => signOut()}>
                <Image
                  className='rounded-full'
                  src={imageLink}
                  alt='profile picture'
                  width={45}
                  height={45}
                />
              </UnstyledLink>
            ) : (
              <UnstyledLink href='/' onClick={() => signIn('strava')}>
                <p className='m-2 px-2 pb-1'>Sign In</p>
              </UnstyledLink>
            )}

            <p className='text-xs font-light text-white'>{name}</p>
          </div>
        </nav>
      </div>
    </header>
  );
}
