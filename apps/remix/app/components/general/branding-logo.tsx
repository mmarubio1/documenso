import type { SVGAttributes } from 'react';

export type LogoProps = SVGAttributes<SVGSVGElement>;

export const BrandingLogo = ({ ...props }: LogoProps) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 60" {...props}>
      <text
        x="0"
        y="45"
        fontFamily="Georgia, serif"
        fontSize="48"
        fontWeight="600"
        fill="currentColor"
        letterSpacing="-1"
      >
        Verafirma
      </text>
    </svg>
  );
};
