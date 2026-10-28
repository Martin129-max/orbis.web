import { Camera, ImagePlus, LoaderCircle } from "lucide-react";
import { ImageMenu } from "./image-menu";

const COVER_MAX_SIZE = 1600;
const MIN_COVER_ASPECT = 1.5;
const MAX_COVER_ASPECT = 6;
const DEFAULT_COVER_ASPECT = 4;

export function coverAspect(width: number, height: number) {
  if (width <= 0 || height <= 0) return DEFAULT_COVER_ASPECT;
  return Math.min(Math.max(width / height, MIN_COVER_ASPECT), MAX_COVER_ASPECT);
}

export function CoverButton({
  hasImage,
  aspect,
  onUpload,
  onRemove,
  className = "",
}: {
  hasImage: boolean;
  aspect: () => number;
  onUpload: (file: File) => Promise<unknown>;
  onRemove: () => Promise<unknown>;
  className?: string;
}) {
  return (
    <ImageMenu
      noun="cover"
      hasImage={hasImage}
      onUpload={onUpload}
      onRemove={onRemove}
      crop={{ aspect, maxSize: COVER_MAX_SIZE }}
    >
      {(busy) => (
        <button
          type="button"
          className={`focus-ring flex cursor-pointer items-center gap-1.5 rounded-full border border-divider bg-surface px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm transition-colors hover:bg-rail-item ${className}`}
        >
          {busy ? (
            <LoaderCircle size={14} className="animate-spin" />
          ) : hasImage ? (
            <Camera size={14} />
          ) : (
            <ImagePlus size={14} />
          )}
          <span className="sr-only sm:not-sr-only">
            {hasImage ? "Edit cover" : "Add cover"}
          </span>
        </button>
      )}
    </ImageMenu>
  );
}
