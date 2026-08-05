"use client";

import { useRef } from "react";

export function RechazarButton() {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input ref={inputRef} type="hidden" name="reason" />
      <button
        type="submit"
        onClick={(e) => {
          const input = window.prompt("Motivo del rechazo (opcional):");
          if (input === null) {
            e.preventDefault();
            return;
          }
          if (inputRef.current) inputRef.current.value = input;
        }}
        className="rounded border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
      >
        Rechazar
      </button>
    </>
  );
}
