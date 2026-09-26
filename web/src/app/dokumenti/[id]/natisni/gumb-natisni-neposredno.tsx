"use client";

import { useState } from "react";

type GumbNatisniNeposrednoProps = {
    dokumentId: number;
};

export function GumbNatisniNeposredno({
    dokumentId,
}: GumbNatisniNeposrednoProps) {
    const [tiskanje, setTiskanje] = useState(false);

    async function natisniNalozenDokument(okvir: HTMLIFrameElement) {
        const okno = okvir.contentWindow;
        if (!okno) {
            setTiskanje(false);
            return;
        }

        // Ne tiskaj prijavne strani, če je seja medtem potekla.
        if (!okno.location.pathname.endsWith(`/dokumenti/${dokumentId}/natisni`)) {
            setTiskanje(false);
            return;
        }

        await okno.document.fonts.ready;
        okno.addEventListener("afterprint", () => setTiskanje(false), { once: true });
        okno.focus();
        okno.print();
    }

    return (
        <>
            <button
                type="button"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                onClick={() => setTiskanje(true)}
                disabled={tiskanje}
            >
                {tiskanje ? "Pripravljam tisk ..." : "Natisni / Shrani PDF"}
            </button>
            {tiskanje && (
                <iframe
                    title="Naročilnica za tisk"
                    src={`/dokumenti/${dokumentId}/natisni`}
                    className="pointer-events-none fixed -left-[10000px] top-0 h-[148mm] w-[210mm] border-0"
                    onLoad={(dogodek) => {
                        void natisniNalozenDokument(dogodek.currentTarget);
                    }}
                />
            )}
        </>
    );
}
