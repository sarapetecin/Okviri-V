"use client";

import { useFormStatus } from "react-dom";

type VrstaDokumenta = "ponudba" | "narocilo";

type ServerAction = (
    formData: FormData,
) => void | Promise<void>;

type GumbNovDokumentProps = {
    vrsta: VrstaDokumenta | null;
    actionPonudba: ServerAction;
    actionNarocilo: ServerAction;
};

type GumbOddajProps = {
    naziv: string;
    nazivMedNalaganjem: string;
    poudarjen: boolean;
};

function GumbOddaj({
    naziv,
    nazivMedNalaganjem,
    poudarjen,
}: GumbOddajProps) {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            aria-disabled={pending}
            className={
                poudarjen
                    ? "rounded-lg bg-slate-900 px-5 py-2.5 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-wait disabled:opacity-60"
                    : "rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
            }
        >
            {pending ? nazivMedNalaganjem : naziv}
        </button>
    );
}

export function GumbNovDokument({
    vrsta,
    actionPonudba,
    actionNarocilo,
}: GumbNovDokumentProps) {
    return (
        <div className="flex flex-wrap gap-3">
            {(vrsta === null || vrsta === "ponudba") && (
                <form action={actionPonudba}>
                    <GumbOddaj
                        naziv="Nova ponudba"
                        nazivMedNalaganjem="Ustvarjam ponudbo ..."
                        poudarjen
                    />
                </form>
            )}

            {(vrsta === null || vrsta === "narocilo") && (
                <form action={actionNarocilo}>
                    <GumbOddaj
                        naziv="Novo naročilo"
                        nazivMedNalaganjem="Ustvarjam naročilo ..."
                        poudarjen
                    />
                </form>
            )}
        </div>
    );
}