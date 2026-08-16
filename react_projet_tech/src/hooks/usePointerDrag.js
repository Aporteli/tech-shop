import { useCallback, useRef, useState } from 'react';

/**
 * Pointer-based drag (mouse, finger, stylus) with axis locking so a
 * horizontal slider does not steal the page's vertical scroll.
 */
export default function usePointerDrag({
  onStart,
  onMove,
  onEnd,
  axis = 'x',
  lockThreshold = 8
} = {}) {
  const draggingRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0 });
  const axisRef = useRef(null);
  const didDragRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  const onPointerDown = useCallback(
    e => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      draggingRef.current = true;
      didDragRef.current = false;
      axisRef.current = null;
      startRef.current = { x: e.clientX, y: e.clientY };
      setIsDragging(true);
      onStart?.({ x: e.clientX, y: e.clientY, event: e });
    },
    [onStart]
  );

  const onPointerMove = useCallback(
    e => {
      if (!draggingRef.current) return;

      const dx = e.clientX - startRef.current.x;
      const dy = e.clientY - startRef.current.y;

      if (!axisRef.current) {
        if (Math.abs(dx) < lockThreshold && Math.abs(dy) < lockThreshold) return;
        axisRef.current = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y';

        if (axisRef.current !== axis) {
          draggingRef.current = false;
          setIsDragging(false);
          return;
        }

        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          /* capture is best-effort; move/up still bubble */
        }
      }

      if (axisRef.current !== axis) return;

      didDragRef.current = true;
      if (e.cancelable) e.preventDefault();
      onMove?.({ dx, dy, x: e.clientX, y: e.clientY, event: e });
    },
    [axis, lockThreshold, onMove]
  );

  const finish = useCallback(
    e => {
      if (!draggingRef.current) {
        setIsDragging(false);
        return;
      }

      draggingRef.current = false;
      setIsDragging(false);

      if (e?.currentTarget?.hasPointerCapture?.(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }

      const dx = (e?.clientX ?? startRef.current.x) - startRef.current.x;
      const dy = (e?.clientY ?? startRef.current.y) - startRef.current.y;
      onEnd?.({ dx, dy, didDrag: didDragRef.current, event: e });
    },
    [onEnd]
  );

  const onClickCapture = useCallback(e => {
    if (!didDragRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    didDragRef.current = false;
  }, []);

  return {
    isDragging,
    didDragRef,
    dragHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: finish,
      onPointerCancel: finish,
      onClickCapture
    }
  };
}
