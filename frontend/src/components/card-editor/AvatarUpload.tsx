import type { UseFormRegister } from 'react-hook-form';
import { Input } from '../common/Input/Input';
import type { CardValues } from '../../utils/validators';

type Props = {
  register: UseFormRegister<CardValues>;
  error: string | null;
  previewUrl: string | null;
};

export function AvatarUpload({ register, error, previewUrl }: Props) {
  return (
    <div>
      <Input label="URL аватара" error={error} {...register('avatarUrl')} />
      {previewUrl !== null && previewUrl.length > 0 ? (
        <img src={previewUrl} alt="Аватар" width={80} height={80} />
      ) : null}
    </div>
  );
}
