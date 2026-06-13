import { useEffect, useMemo, useRef } from 'react'
import { REVIEW_PHOTO_MAX } from '../types'
import type { ReviewPhoto } from '../types'

interface Props {
  /** 기존 URL + 새 File 혼합 (ReviewPhoto) */
  value: ReviewPhoto[]
  onChange: (photos: ReviewPhoto[]) => void
}

/**
 * 사진 첨부 — 최대 3장. 새 사진은 File 그대로 보유(업로드는 multipart, BE 가 OCI 처리).
 * 미리보기: 기존 사진은 http URL, 새 File 은 objectURL — useMemo 로 파생 + cleanup effect 로 revoke
 * (dataURL/FileReader 폐기, React Compiler 호환). 프로토타입 52-review-write(rw-photo-grid).
 */
export function ReviewPhotoInput({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const canAdd = value.length < REVIEW_PHOTO_MAX

  // 미리보기 src — 새 File 만 objectURL 생성(revoke 대상), 기존 사진은 url 그대로
  const previews = useMemo(
    () =>
      value.map((photo) =>
        photo.kind === 'new'
          ? { src: URL.createObjectURL(photo.file), revoke: true }
          : { src: photo.url, revoke: false },
      ),
    [value],
  )
  useEffect(() => {
    return () => {
      for (const pv of previews) {
        if (pv.revoke) URL.revokeObjectURL(pv.src)
      }
    }
  }, [previews])

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const room = REVIEW_PHOTO_MAX - value.length
    const picked = Array.from(files).slice(0, room)
    const next: ReviewPhoto[] = picked.map((file) => ({ kind: 'new', file }))
    onChange([...value, ...next])
  }

  return (
    <div className="flex flex-wrap gap-2">
      {previews.map((pv, i) => (
        <div
          key={i}
          className="relative size-[72px] overflow-hidden rounded-xl border border-border"
        >
          <img src={pv.src} alt={`첨부 사진 ${i + 1}`} className="size-full object-cover" />
          <button
            type="button"
            aria-label={`사진 ${i + 1} 삭제`}
            onClick={() => onChange(value.filter((_, idx) => idx !== i))}
            className="absolute right-1 top-1 flex size-[22px] items-center justify-center rounded-full bg-black/65 text-[11px] font-extrabold text-white"
          >
            ✕
          </button>
        </div>
      ))}

      {canAdd && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex size-[72px] flex-col items-center justify-center gap-[3px] rounded-xl border-[1.5px] border-dashed border-border bg-background text-[11px] font-bold text-muted-foreground"
        >
          <span className="text-[22px]">📷</span>
          <span>사진 추가</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          handleFiles(e.target.files)
          e.target.value = ''
        }}
      />
    </div>
  )
}
