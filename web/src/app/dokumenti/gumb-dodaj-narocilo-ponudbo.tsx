"use client";

import { useFormStatus } from "react-dom";

type GumbUstvariDokumentProps = {
    naziv: string;
    nazivMedShranjevanjem: string;
    poudarjen?: boolean;
};

export function GumbUstvariDokument({
    naziv,
    nazivMedShranjevanjem,
    poudarjen = false,
}: GumbUstvariDokumentProps) {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className={
                poudarjen
                    ? "rounded-lg bg-slate-900 px-5 py-2.5 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-wait disabled:opacity-60"
                    : "rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
            }
        >
            {pending ? nazivMedShranjevanjem : naziv}
        </button>
    );
}