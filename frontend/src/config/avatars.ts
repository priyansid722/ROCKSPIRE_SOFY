// Avatar registry – real PNG avatars (256x256) placed in src/assets/avatars/
// The '@' alias maps to './src' (configured in vite.config.ts & tsconfig)

import avatar01 from '@/assets/avatars/avatar-01.png';
import avatar02 from '@/assets/avatars/avatar-02.png';
import avatar03 from '@/assets/avatars/avatar-03.png';
import avatar04 from '@/assets/avatars/avatar-04.png';
import avatar05 from '@/assets/avatars/avatar-05.png';
import avatar06 from '@/assets/avatars/avatar-06.png';
import avatar07 from '@/assets/avatars/avatar-07.png';
import avatar08 from '@/assets/avatars/avatar-08.png';
import avatar09 from '@/assets/avatars/avatar-09.png';
import avatar10 from '@/assets/avatars/avatar-10.png';

export interface AvatarInfo {
  id: number;
  name: string;
  alt: string;
  src: string; // imported image module
  objectPosition?: string; // optional CSS object-position, default 'center'
}

export const AVATARS: AvatarInfo[] = [
  { id: 1, name: 'Hamster', alt: 'Hamster avatar', src: avatar01, objectPosition: 'center' },
  { id: 2, name: 'Monkey', alt: 'Monkey avatar', src: avatar02, objectPosition: 'center' },
  { id: 3, name: 'Goose', alt: 'Goose avatar', src: avatar03, objectPosition: 'center' },
  { id: 4, name: 'Gator', alt: 'Gator avatar', src: avatar04, objectPosition: 'center' },
  { id: 5, name: 'Turtle', alt: 'Turtle avatar', src: avatar05, objectPosition: 'center' },
  { id: 6, name: 'Curly', alt: 'Curly avatar', src: avatar06, objectPosition: 'center' },
  { id: 7, name: 'Cat', alt: 'Cat avatar', src: avatar07, objectPosition: 'center' },
  { id: 8, name: 'Pig', alt: 'Pig avatar', src: avatar08, objectPosition: 'center' },
  { id: 9, name: 'Horse', alt: 'Horse avatar', src: avatar09, objectPosition: 'center' },
  { id: 10, name: 'Cow', alt: 'Cow avatar', src: avatar10, objectPosition: 'center' },
];

export function getAvatarById(id: number): AvatarInfo {
  return AVATARS.find((a) => a.id === id) ?? AVATARS[0];
}
