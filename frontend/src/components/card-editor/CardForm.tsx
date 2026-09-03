import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CARD_SWATCHES,
  EMAIL_HINT,
  cardSchema,
  type CardValues,
} from '../../utils/validators';
import { initialsFromName } from '../../utils/format';
import { SkillsInput } from './SkillsInput';
import { PhotoDropzone } from './PhotoDropzone';

type Props = {
  defaultValues: CardValues;
  onSubmit: (values: CardValues) => Promise<void>;
  onUploadAvatar: (file: File) => Promise<string>;
  error: string | null;
};

export function CardForm({ defaultValues, onSubmit, onUploadAvatar, error }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CardValues>({
    resolver: zodResolver(cardSchema),
    defaultValues,
  });

  const values = watch();
  const emailInvalid = typeof errors.email?.message === 'string';
  const bio = values.bio;
  const [uploadBusy, setUploadBusy] = useState(false);
  const [dropError, setDropError] = useState<string | null>(null);

  const save = (isPublic: boolean) =>
    handleSubmit((form) => onSubmit({ ...form, isPublic }));

  return (
    <div className="editor-grid">
      <div>
        <h2 className="page-title">Редактор визитки</h2>
        <div className="page-sub">Изменения видны в превью справа</div>
        <form className="panel form-card" onSubmit={save(true)}>
          <div>
            <div className="field-label">Фото</div>
            <PhotoDropzone
              previewUrl={values.avatarUrl}
              initials={initialsFromName(values.name)}
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
            <div className="field-hint">JPEG, PNG или WebP, до 2 МБ</div>
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
        </div>
      </div>
      <div>
        <div className="preview-kicker">Превью</div>
        <div className="panel preview-card">
          <div
            className="preview-head"
            style={{ background: values.backgroundColor }}
          />
          <div className="preview-body">
            <div className="preview-avatar">
              {values.avatarUrl.length > 0 ? (
                <img src={values.avatarUrl} alt="" />
              ) : (
                initialsFromName(values.name)
              )}
            </div>
            <div className="preview-name">{values.name}</div>
            <div className="preview-role">{values.role}</div>
            <p className="preview-bio">{values.bio}</p>
            <div className="chips" style={{ marginTop: 14 }}>
              {values.skills.map((skill) => (
                <span className="tag" key={skill}>
                  {skill}
                </span>
              ))}
            </div>
            <div className="preview-contacts">
              <div className="preview-contact">{values.email}</div>
              <div className="preview-contact">{values.phone}</div>
            </div>
            <div
              className="preview-cta"
              style={{ background: values.backgroundColor }}
            >
              Сохранить контакт
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
