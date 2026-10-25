"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { LinkPreview as Preview } from "@/lib/api";
import { gifLink, previewFor, youtubeVideo, type YouTubeVideo } from "@/lib/links";
import { useAuthStore } from "@/stores/auth-store";

const external = { target: "_blank", rel: "noopener noreferrer nofollow" } as const;

export function LinkPreview({ url, onRemove }: { url: string; onRemove?: () => void }) {
  const video = useMemo(() => youtubeVideo(url), [url]);
  const gif = useMemo(() => gifLink(url), [url]);
  const [preview, setPreview] = useState<{ url: string; data: Preview | null } | null>(null);

  useEffect(() => {
    const { token } = useAuthStore.getState();

    let current = true;
    previewFor(token, url).then((data) => {
      if (current) setPreview({ url, data });
    });
    return () => {
      current = false;
    };
  }, [url]);

  const data = preview?.url === url ? preview.data : null;
  if (!video && !data) return null;

  return (
    <div className="relative">
      {video ? (
        <YouTubeEmbed link={url} video={video} preview={data} />
      ) : (
        <LinkCard link={url} preview={data!} media={gif} />
      )}
      {onRemove && (
        <button
          type="button"
          aria-label="Remove link preview"
          onClick={onRemove}
          className="focus-ring absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/65 text-white transition-colors hover:bg-black/85"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

function YouTubeEmbed({
  link,
  video,
  preview,
}: {
  link: string;
  video: YouTubeVideo;
  preview: Preview | null;
}) {
  const title = preview?.title ?? "YouTube video";
  const query = new URLSearchParams({ rel: "0" });
  if (video.start) query.set("start", String(video.start));

  return (
    <div className="overflow-hidden rounded-xl border border-divider bg-rail-item/40">
      <div className="relative aspect-video bg-black">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${video.id}?${query}`}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full"
        />
      </div>
      {preview && (
        <a
          href={link}
          {...external}
          className="focus-ring flex flex-col gap-0.5 px-3 py-2 transition-colors hover:bg-rail-item"
        >
          <span className="truncate text-xs text-muted">
            YouTube{preview.description ? ` · ${preview.description}` : ""}
          </span>
          <span className="line-clamp-2 text-sm font-semibold">{preview.title}</span>
        </a>
      )}
    </div>
  );
}

function LinkCard({
  link,
  preview,
  media = false,
}: {
  link: string;
  preview: Preview;
  media?: boolean;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const image = preview.image && !imageFailed && (
    <span className="relative block aspect-[1.91/1] max-h-72 w-full bg-rail-item">
      <Image
        src={preview.image}
        alt=""
        fill
        unoptimized
        referrerPolicy="no-referrer"
        onError={() => setImageFailed(true)}
        className="object-cover"
      />
    </span>
  );

  if (media && image) {
    return (
      <a
        href={link}
        {...external}
        aria-label={preview.title}
        className="focus-ring block overflow-hidden rounded-xl border border-divider bg-rail-item/40 transition-opacity hover:opacity-90"
      >
        {image}
      </a>
    );
  }

  return (
    <a
      href={link}
      {...external}
      className="focus-ring flex flex-col overflow-hidden rounded-xl border border-divider bg-rail-item/40 transition-colors hover:bg-rail-item"
    >
      {image}
      <span className="flex min-w-0 flex-col gap-0.5 px-3 py-2">
        <span className="truncate text-xs text-muted">{preview.siteName}</span>
        <span className="line-clamp-2 text-sm font-semibold">{preview.title}</span>
        {preview.description && (
          <span className="line-clamp-2 text-xs text-muted">{preview.description}</span>
        )}
      </span>
    </a>
  );
}
