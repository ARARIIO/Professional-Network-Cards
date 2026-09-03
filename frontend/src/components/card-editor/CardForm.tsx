import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CARD_SWATCHES,
  EMAIL_HINT,
  cardSchema,
  mergeWatchedCardValues,
  type CardValues,
} from '../../utils/validators';
import { SkillsInput } from './SkillsInput';
import { PhotoDropzone } from './PhotoDropzone';
import { CardFace } from '../card-viewer/CardFace';
import type { PublicCard } from '../../graphql/types';

type Props = {
  defaultValues: CardValues;
  shareUrl: string;
  onSubmit: (values: CardValues) => Promise<void>;
  onUploadAvatar: (file: File) => Promise<string>;
  error: string | null;
  onDelete: (() => Promise<void>) | null;
};

export function CardForm({
  defaultValues,
  shareUrl,
  onSubmit,
  onUploadAvatar,
  error,
  onDelete,
}: Props) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CardValues>({
    resolver: zodResolver(cardSchema),
    defaultValues,
  });

  const watched = useWatch({
    control,
    defaultValue: defaultValues,
  });
  const values = mergeWatchedCardValues(defaultValues, watched);
  const emailInvalid = typeof errors.email?.message === 'string';
  const bio = values.bio;
  const [uploadBusy, setUploadBusy] = useState(false);
  const [dropError, setDropError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const previewCard = cardFaceFromValues(values);

  const save = (isPublic: boolean) =>
    handleSubmit((form) => onSubmit({ ...form, isPublic }));

  return (
    <div className="editor-grid">
      <div>
        <h2 className="page-title">Редактор визитки</h2>
        <div className="page-sub">Изменения видны в превью справа</div>
        <form
          className="panel form-card"
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <div>
            <div className="field-label">Фото</div>
            <PhotoDropzone
              previewUrl={values.avatarUrl}
              name={values.name}
              busy={uploadBusy}
              onReject={setDropError}
              onFile={async (file) => {
                setDropError(null);
                setUploadBusy(true);
                try {
                  const url = await onUploadAvatar(file);
                  setValue('avatarUrl', url, { shouldDirty: true });
                } finally {
                  setUploadBusy(false);
                }
              }}
            />
            <div className="field-hint">JPEG, PNG или WebP, до 50 МБ</div>
            {dropError !== null ? <div className="field-error">{dropError}</div> : null}
          </div>
          <div>
            <div className="field-label">Имя</div>
            <input className="field-input" {...register('name')} />
          </div>
          <div>
            <div className="field-label">Роль</div>
            <input className="field-input" {...register('role')} />
          </div>
          <div className="two-col">
            <div>
              <div className="field-label">Email</div>
              <input
                className={emailInvalid ? 'field-input is-error' : 'field-input'}
                {...register('email')}
              />
              {emailInvalid ? <div className="field-error">{EMAIL_HINT}</div> : null}
            </div>
            <div>
              <div className="field-label">Телефон</div>
              <input className="field-input" {...register('phone')} />
            </div>
          </div>
          <div>
            <div className="field-label">Сайт</div>
            <input className="field-input" {...register('website')} />
          </div>
          <div>
            <div className="field-label">Био</div>
            <textarea className="field-textarea" rows={3} {...register('bio')} />
            <div className="field-hint">
              {bio.length} / 240
            </div>
          </div>
          <SkillsInput
            skills={values.skills}
            onChange={(skills) => setValue('skills', skills, { shouldDirty: true })}
          />
          <div className="three-col">
            <div>
              <div className="field-label">LinkedIn</div>
              <input className="field-input" {...register('linkedin')} />
            </div>
            <div>
              <div className="field-label">X</div>
              <input className="field-input" {...register('twitter')} />
            </div>
            <div>
              <div className="field-label">GitHub</div>
              <input className="field-input" {...register('github')} />
            </div>
          </div>
          <div>
            <div className="field-label" style={{ marginBottom: 8 }}>
              Цвет фона карточки
            </div>
            <div className="swatches">
              {CARD_SWATCHES.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={
                    color === values.backgroundColor
                      ? 'swatch-btn is-on'
                      : 'swatch-btn'
                  }
                  style={{ background: color }}
                  onClick={() =>
                    setValue('backgroundColor', color, { shouldDirty: true })
                  }
                />
              ))}
            </div>
          </div>
        </form>
        <div className="actions-row" style={{ marginTop: 16 }}>
          <button
            type="button"
            className="primary-btn"
            disabled={isSubmitting}
            onClick={() => void save(true)()}
          >
            Сохранить и опубликовать
          </button>
          <button
            type="button"
            className="ghost-btn"
            disabled={isSubmitting}
            onClick={() => void save(false)()}
          >
            Сохранить черновик
          </button>
          {emailInvalid ? (
            <span className="toolbar-error">1 поле заполнено с ошибкой</span>
          ) : null}
          {error !== null ? <span className="toolbar-error">{error}</span> : null}
          {onDelete !== null ? (
            <button
              type="button"
              className="ghost-btn nav-logout"
              disabled={isSubmitting}
              onClick={() => {
                if (window.confirm('Удалить визитку? Это нельзя отменить.') === false) {
                  return;
                }
                void onDelete();
              }}
            >
              Удалить визитку
            </button>
          ) : null}
        </div>
      </div>
      <div>
        <div className="preview-kicker">Превью</div>
        <CardFace card={previewCard} compact={true} interactive={false}>
          {shareUrl.length > 0 ? (
            <div className="share-box">
              <div className="share-title">Поделиться визиткой</div>
              <div className="share-hint">Ссылка или файл для адресной книги</div>
              <div className="share-actions">
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => {
                    void (async () => {
                      try {
                        await navigator.clipboard.writeText(shareUrl);
                        setCopied(true);
                        window.setTimeout(() => setCopied(false), 1600);
                      } catch {
                        return;
                      }
                    })();
                  }}
                >
                  {copied ? 'Ссылка скопирована' : 'Скопировать ссылку'}
                </button>
              </div>
            </div>
          ) : null}
          <div className="preview-cta" style={{ background: values.backgroundColor }}>
            Сохранить контакт
          </div>
        </CardFace>
      </div>
    </div>
  );
}

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function cardFaceFromValues(values: CardValues): PublicCard {
  return {
    name: values.name.trim().length === 0 ? 'Имя' : values.name,
    role: emptyToNull(values.role),
    email: values.email,
    phone: emptyToNull(values.phone),
    website: emptyToNull(values.website),
    bio: emptyToNull(values.bio),
    skills: values.skills,
    avatarUrl: emptyToNull(values.avatarUrl),
    backgroundColor: values.backgroundColor,
    linkedin: emptyToNull(values.linkedin),
    github: emptyToNull(values.github),
    twitter: emptyToNull(values.twitter),
  };
}
