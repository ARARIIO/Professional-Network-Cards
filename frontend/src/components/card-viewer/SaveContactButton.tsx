import { Button } from '../common/Button/Button';

type Props = {
  disabled: boolean;
  onSave: () => void;
};

export function SaveContactButton({ disabled, onSave }: Props) {
  return (
    <Button type="button" disabled={disabled} onClick={onSave}>
      Сохранить контакт
    </Button>
  );
}
