import { LoaderCircle, Wallpaper } from "lucide-react";
import Image from "next/image";
import { ImageMenu } from "./image-menu";

export function PageWallpaper({
  src,
  onUpload,
  onRemove,
}: {
  src: string | null;
  onUpload?: (file: File) => Promise<unknown>;
  onRemove?: () => Promise<unknown>;
}) {
  return (
    <>
      {src && (
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <Image src={src} alt="" fill unoptimized className="object-cover" />
          <div className="absolute inset-0 bg-background/55" />
        </div>
      )}
      {onUpload && onRemove && (
        <ImageMenu
          noun="background"
          hasImage={Boolean(src)}
          onUpload={onUpload}
          onRemove={onRemove}
        >
          {(busy) => (
            <button
              type="button"
              aria-label="Change background"
              title="Change background"
              className="focus-ring absolute bottom-4 left-4 z-10 flex cursor-pointer h-9 w-9 items-center justify-center rounded-full border border-divider bg-surface text-foreground shadow-sm transition-colors hover:bg-rail-item"
            >
              {busy ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <Wallpaper size={16} />
              )}
            </button>
          )}
        </ImageMenu>
      )}
    </>
  );
}
