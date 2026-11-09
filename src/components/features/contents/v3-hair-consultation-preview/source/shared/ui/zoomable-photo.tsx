'use client';
import { useRef, useState, type ReactNode } from 'react';

/** Local image zoom/pan; never zoom or move the enclosing WebView. */
export function ZoomablePhoto({
  children,
  onSwipe,
}: {
  children: ReactNode;
  onSwipe: (direction: number) => void;
}) {
  const surface = useRef<HTMLDivElement>(null);
  const points = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef({ distance: 0, scale: 1, x: 0, y: 0, startX: 0, startY: 0 });
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 });
  const current = useRef(view);
  current.current = view;
  const update = (scale: number, x = 0, y = 0) => {
    scale = Math.max(0.5, Math.min(5, scale));
    const width = surface.current?.clientWidth ?? 0,
      height = surface.current?.clientHeight ?? 0;
    const boundX = Math.max(0, ((scale - 1) * width) / 2),
      boundY = Math.max(0, ((scale - 1) * height) / 2);
    const next = {
      scale,
      x: Math.max(-boundX, Math.min(boundX, x)),
      y: Math.max(-boundY, Math.min(boundY, y)),
    };
    current.current = next;
    setView(next);
  };
  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        ref={surface}
        className="h-full w-full touch-none"
        aria-label="사진 확대 및 이동"
        onPointerDown={(event) => {
          if ((event.target as Element).closest('button')) return;
          event.currentTarget.setPointerCapture?.(event.pointerId);
          points.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
          const pair = [...points.current.values()];
          gesture.current = {
            distance:
              pair.length === 2 ? Math.hypot(pair[0].x - pair[1].x, pair[0].y - pair[1].y) : 0,
            scale: current.current.scale,
            x: current.current.x,
            y: current.current.y,
            startX: event.clientX,
            startY: event.clientY,
          };
        }}
        onPointerMove={(event) => {
          if (!points.current.has(event.pointerId)) return;
          points.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
          const pair = [...points.current.values()],
            base = gesture.current;
          if (pair.length === 2 && base.distance > 0)
            update(
              (base.scale * Math.hypot(pair[0].x - pair[1].x, pair[0].y - pair[1].y)) /
                base.distance,
              base.x,
              base.y,
            );
          else if (pair.length === 1 && base.scale > 1)
            update(
              base.scale,
              base.x + event.clientX - base.startX,
              base.y + event.clientY - base.startY,
            );
        }}
        onPointerUp={(event) => {
          const base = gesture.current;
          if (
            points.current.size === 1 &&
            base.distance === 0 &&
            current.current.scale === 1 &&
            Math.abs(event.clientX - base.startX) > 50 &&
            Math.abs(event.clientX - base.startX) > Math.abs(event.clientY - base.startY)
          )
            onSwipe(event.clientX < base.startX ? 1 : -1);
          points.current.delete(event.pointerId);
          const remaining = [...points.current.values()][0];
          if (remaining)
            gesture.current = {
              distance: -1,
              scale: current.current.scale,
              x: current.current.x,
              y: current.current.y,
              startX: remaining.x,
              startY: remaining.y,
            };
        }}
        onPointerCancel={() => points.current.clear()}
        onDoubleClick={() => update(current.current.scale === 1 ? 2 : 1)}
      >
        <div
          className="relative h-full w-full"
          style={{
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
            transformOrigin: 'center',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
