import type { SVGAttributes } from 'react';

export type LogoProps = SVGAttributes<SVGSVGElement>;

export const BrandingLogoIcon = ({ ...props }: LogoProps) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" {...props}>
      <text
        x="50%"
        y="50"
        fontFamily="Georgia, serif"
        fontSize="52"
        fontWeight="600"
        fill="currentColor"
        textAnchor="middle"
      >
        V
      </text>
    </svg>
  );
};
