"use client";

import { useRef, useState } from "react";

export default function SignaturePad({ onSave }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [empty, setEmpty] = useState(true);

  function pos(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;
    return { x: point.clientX - rect.left, y: point.clientY - rect.top };
  }

  function start(e) {
    drawing.current = true;
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = pos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }
  function move(e) {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#12294D";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
    setEmpty(false);
  }
  function end() {
    drawing.current = false;
  }

  function clear() {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setEmpty(true);
  }

  function save() {
    canvasRef.current.toBlob((blob) => {
      if (blob) onSave(blob);
    }, "image/png");
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={440}
        height={140}
        className="border border-gray-200 rounded-lg w-full touch-none bg-white"
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={end}
        onMouseLeave={end}
        onTouchStart={start}
        onTouchMove={move}
        onTouchEnd={end}
      />
      <div className="flex gap-2 mt-1.5">
        <button type="button" onClick={clear} className="text-[12px] px-2.5 py-1 border border-gray-200 rounded">
          Borrar
        </button>
        <button
          type="button"
          onClick={save}
          disabled={empty}
          className="text-[12px] px-2.5 py-1 border border-gray-200 rounded disabled:opacity-50"
        >
          Guardar firma
        </button>
      </div>
    </div>
  );
}
