/* eslint-disable @next/next/no-img-element */

/** Il sigillo: un sole tirato a pennello. */
export default function Marchio({ dimensione = 30 }: { dimensione?: number }) {
  return <img src="/marchio.svg" width={dimensione} height={dimensione} alt="" aria-hidden />;
}
