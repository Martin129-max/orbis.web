import { Camera, ImagePlus, LoaderCircle } from "lucide-react";
import { ImageMenu } from "./image-menu";

export function CoverButton({
  hasImage,
  onUpload,
  onRemove,
  className = "",
}: {
  hasImage: boolean;
  onUpload: (file: File) => Promise<unknown>;
  onRemove: () => Promise<unknown>;
  className?: string;
}) {
  return (
    <ImageMenu noun="cover" hasImage={hasImage} onUpload={onUpload} onRemove={onRemove}>
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
