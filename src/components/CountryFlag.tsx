import React,{ useState } from 'react';
import { getFlagApiUrl,getFlagPngSrcSet } from '../lib/flagApi';
import { cn } from '../lib/utils';

interface CountryFlagProps {
  code: string;
  name: string;
  fallback?: string;
  selected?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const sizeClasses = {
  sm: {
    frame: 'h-5 w-7',
    fallback: 'text-sm',
  },
  md: {
    frame: 'h-7 w-10',
    fallback: 'text-lg',
  },
};

export const CountryFlag: React.FC<CountryFlagProps> = ({
  code,
  name,
  fallback,
  selected = false,
  size = 'md',
  className,
}) => {
  const [failed, setFailed] = useState(false);
  const src = getFlagApiUrl(code);
  const srcSet = getFlagPngSrcSet(code);
  const showFallback = failed || !src;
  const label = `${name} flag`;

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded border bg-white shadow-sm',
        selected ? 'border-white/50 bg-white/20' : 'border-slate-200',
        sizeClasses[size].frame,
        className,
      )}
    >
      {showFallback ? (
        <span role="img" aria-label={label} className={cn('leading-none', sizeClasses[size].fallback)}>
          {fallback || code.slice(0, 2)}
        </span>
      ) : (
        <img
          src={src}
          srcSet={srcSet}
          width={size === 'md' ? 40 : 28}
          height={size === 'md' ? 30 : 20}
          alt={label}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
};
