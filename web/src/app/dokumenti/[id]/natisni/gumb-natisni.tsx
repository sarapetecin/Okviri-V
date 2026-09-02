"use client";

export function GumbNatisni() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden rounded-lg bg-slate-900 px-5 py-2.5 font-semibold text-white transition hover:bg-slate-700"
    >
      Natisni / Shrani PDF
    </button>
  );
}