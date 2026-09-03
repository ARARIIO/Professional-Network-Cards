import { useState } from 'react';
import { initialsFromName } from '../../../utils/format';
import { resolveAvatarSrc } from '../../../utils/avatar-src';

type Props = {
  src: string | null;
  name: string;
  className: string;
  fallbackColor: string | null;
};

export function Avatar({ src, name, className, fallbackColor }: Props) {
  const resolved = resolveAvatarSrc(src);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const photo = resolved !== null && resolved !== failedSrc;

  const markFailed = () => {
    if (resolved !== null) {
      setFailedSrc(resolved);
    }
  };

  return (
    <div
      className={className}
      style={
        photo || fallbackColor === null ? {} : { background: fallbackColor }
      }
    >
      {photo ? (
        <img
          src={resolved}
          alt=""
          decoding="async"
          onError={markFailed}
          onLoad={(event) => {
            const image = event.currentTarget;
            if (image.naturalWidth < 8 || image.naturalHeight < 8) {
              markFailed();
            }
          }}
        />
      ) : (
        initialsFromName(name)
      )}
    </div>
  );
}
