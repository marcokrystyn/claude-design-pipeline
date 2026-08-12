import type { WalkthroughPhoto } from './ChataPovWalkthrough';

/**
 * The five frames of the visit, in narrative order. Replace the `src`/`srcSet`
 * paths with the real photographs — nothing else here needs touching, and the
 * drift for each frame follows from its position in the sequence.
 */
export const chataPhotos: WalkthroughPhoto[] = [
  {
    src: '/designs/chata-pov-walkthrough/photos/1-prijezd.jpg',
    srcSet: [
      '/designs/chata-pov-walkthrough/photos/1-prijezd-800.jpg 800w',
      '/designs/chata-pov-walkthrough/photos/1-prijezd-1600.jpg 1600w',
      '/designs/chata-pov-walkthrough/photos/1-prijezd-2400.jpg 2400w',
    ].join(', '),
    alt: 'Roubená chata z dřeva a kamene za denního světla, pohled od příjezdové cesty.',
    caption: 'Příjezd',
  },
  {
    src: '/designs/chata-pov-walkthrough/photos/2-obyvak.jpg',
    srcSet: [
      '/designs/chata-pov-walkthrough/photos/2-obyvak-800.jpg 800w',
      '/designs/chata-pov-walkthrough/photos/2-obyvak-1600.jpg 1600w',
      '/designs/chata-pov-walkthrough/photos/2-obyvak-2400.jpg 2400w',
    ].join(', '),
    alt: 'Obývací pokoj s dřevěným obkladem, přiznanými trámy a sedací soupravou u krbu.',
    caption: 'Obývací pokoj',
  },
  {
    src: '/designs/chata-pov-walkthrough/photos/3-loznice.jpg',
    srcSet: [
      '/designs/chata-pov-walkthrough/photos/3-loznice-800.jpg 800w',
      '/designs/chata-pov-walkthrough/photos/3-loznice-1600.jpg 1600w',
      '/designs/chata-pov-walkthrough/photos/3-loznice-2400.jpg 2400w',
    ].join(', '),
    alt: 'Ložnice v podkroví s dvoulůžkem pod šikmým dřevěným stropem.',
    caption: 'Ložnice',
  },
  {
    src: '/designs/chata-pov-walkthrough/photos/4-koupelna.jpg',
    srcSet: [
      '/designs/chata-pov-walkthrough/photos/4-koupelna-800.jpg 800w',
      '/designs/chata-pov-walkthrough/photos/4-koupelna-1600.jpg 1600w',
      '/designs/chata-pov-walkthrough/photos/4-koupelna-2400.jpg 2400w',
    ].join(', '),
    alt: 'Koupelna s kamenným obkladem a dřevěnou deskou pod umyvadlem.',
    caption: 'Koupelna',
  },
  {
    src: '/designs/chata-pov-walkthrough/photos/5-vecer.jpg',
    srcSet: [
      '/designs/chata-pov-walkthrough/photos/5-vecer-800.jpg 800w',
      '/designs/chata-pov-walkthrough/photos/5-vecer-1600.jpg 1600w',
      '/designs/chata-pov-walkthrough/photos/5-vecer-2400.jpg 2400w',
    ].join(', '),
    alt: 'Tatáž chata za soumraku, okna svítí teplým světlem do zahrady.',
    caption: 'Večer',
  },
];
