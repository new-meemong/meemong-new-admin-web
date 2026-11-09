"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

const DOCUMENT =
  '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/v3-hair-preview/preview.css"></head><body><div id="preview-root"></div></body></html>';

/** Isolate the original app tokens, typography and photo dialogs from admin styles. */
export default function PreviewFrame({
  title,
  children,
  autoHeight = false,
}: {
  title: string;
  children: ReactNode;
  autoHeight?: boolean;
}) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    if (!target || !autoHeight) return;
    const resize = () => {
      if (frame.current)
        frame.current.style.height = `${Math.ceil(target.getBoundingClientRect().height)}px`;
    };
    const observer = new ResizeObserver(resize);
    observer.observe(target);
    resize();
    return () => observer.disconnect();
  }, [target, autoHeight]);
  return (
    <iframe
      ref={frame}
      title={title}
      srcDoc={DOCUMENT}
      className={
        autoHeight
          ? "block w-full border-0"
          : "block h-full min-h-0 w-full flex-1 border-0"
      }
      style={autoHeight ? { height: 220 } : undefined}
      onLoad={() =>
        setTarget(
          frame.current?.contentDocument?.getElementById("preview-root") ??
            null,
        )
      }
    >
      {target && createPortal(children, target)}
    </iframe>
  );
}
