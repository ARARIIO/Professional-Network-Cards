import { QRCodeSVG } from 'qrcode.react';

type Props = {
  value: string;
};

export function QRCode({ value }: Props) {
  return <QRCodeSVG value={value} size={160} />;
}
