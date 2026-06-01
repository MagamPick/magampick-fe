import { useRef } from 'react'
import { REVIEW_PHOTO_MAX } from '../types'

interface Props {
  /** dataURL 배열 (mock — 실연동 시 업로드 URL) */
  value: string[]
  onChange: (photos: string[]) => void
}

/** 사진 첨부 — 최대 3장, File→dataURL 변환(mock). 프로토타입 52-review-write(rw-photo-grid) */
export function ReviewPhotoInput({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const canAdd = value.length < REVIEW_PHOTO_MAX

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const room = REVIEW_PHOTO_MAX - value.length
    const picked = Array.from(files).slice(0, room)
    const dataUrls = await Promise.all(picked.map(readAsDataUrl))
    onChange([...value, ...dataUrls])
  }

  return (
    <div className="flex flex-wrap gap-2">
      {value.map((src, i) => (
        <div
          key={i}
          className="relative size-[72px] overflow-hidden rounded-xl border border-border"
        >
          <img src={src} alt={`첨부 사진 ${i + 1}`} className="size-full object-cover" />
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
          void handleFiles(e.target.files)
          e.target.value = ''
        }}
      />
    </div>
  )
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
