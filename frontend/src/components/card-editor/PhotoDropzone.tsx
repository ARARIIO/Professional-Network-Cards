import { useRef, useState } from 'react';
import {
  AVATAR_ACCEPT,
  avatarFileError,
  firstDroppedFile,
} from '../../utils/avatar-file';

type Props = {
  previewUrl: string;
  initials: string;
  busy: boolean;
  onFile: (file: File) => Promise<void>;
  onReject: (message: string) => void;
};

export function PhotoDropzone({
  previewUrl,
  initials,
  busy,
  onFile,
  onReject,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragDepth, setDragDepth] = useState(0);
  const isOver = dragDepth > 0 && !busy;

  const pickFromList = (list: FileList | null) => {
    const chosen = firstDroppedFile(list);
    if (chosen === null) {
      return;
    }
    const problem = avatarFileError(chosen);
    if (problem !== null) {
      onReject(problem);
      return;
    }
    void onFile(chosen);
  };

  const openPicker = () => {
    if (busy) {
      return;
    }
    const input = fileInputRef.current;
    if (input === null) {
      return;
    }
    input.click();
  };

  return (
    <div className="photo-row">
      <div className="photo-preview">
        {previewUrl.length > 0 ? <img src={previewUrl} alt="" /> : initials}
      </div>
      <div
        role="button"
        tabIndex={0}
        className={isOver ? 'photo-drop is-over' : 'photo-drop'}
        aria-disabled={busy}
        onClick={openPicker}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openPicker();
          }
        }}
        onDragEnter={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (busy) {
            return;
          }
          setDragDepth((depth) => depth + 1);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setDragDepth((depth) => (depth > 0 ? depth - 1 : 0));
        }}
        onDrop={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setDragDepth(0);
          if (busy) {
            return;
          }
          pickFromList(event.dataTransfer.files);
        }}
      >
        <span className="photo-drop-title">
          {busy
            ? 'Загрузка…'
            : isOver
              ? 'Отпустите, чтобы загрузить'
              : 'Перетащите фото сюда'}
        </span>
        <span className="photo-drop-hint">или нажмите, чтобы выбрать файл</span>
      </div>
      <input
        ref={fileInputRef}
        className="visually-hidden"
        type="file"
        accept={AVATAR_ACCEPT}
        onChange={(event) => {
          pickFromList(event.currentTarget.files);
          event.currentTarget.value = '';
        }}
      />
    </div>
  );
}
