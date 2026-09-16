"use client";

import { useState } from "react";

type VrstaDokumenta =
    | "ponudba"
    | "narocilo";

type GumbNovDokumentProps = {
    vrsta: VrstaDokumenta | null;
    actionPonudba: () => Promise<void>;
    actionNarocilo: () => Promise<void>;
};

const glavniGumb =
    "rounded-lg bg-slate-900 px-5 py-2.5 text-center font-semibold text-white transition hover:bg-slate-700";

export function GumbNovDokument({
    vrsta,
    actionPonudba,
    actionNarocilo,
}: GumbNovDokumentProps) {
    const [odprto, setOdprto] = useState(false);

    if (vrsta === "ponudba") {
        return (
            <form action={actionPonudba}>
                <button
                    type="submit"
                    className={glavniGumb}
                >
                    Nova ponudba
                </button>
            </form>
        );
    }

    if (vrsta === "narocilo") {
        return (
            <form action={actionNarocilo}>
                <button
                    type="submit"
                    className={glavniGumb}
                >
                    Novo naročilo
                </button>
            </form>
        );
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setOdprto(true)}
                className={glavniGumb}
            >
                Nov dokument
            </button>

            {odprto && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="naslov-novega-dokumenta"
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
                    onClick={() => setOdprto(false)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
                        onClick={(dogodek) => {
                            dogodek.stopPropagation();
                        }}
                    >
                        <h2
                            id="naslov-novega-dokumenta"
                            className="text-xl font-bold text-slate-900"
                        >
                            Kaj želiš ustvariti?
                        </h2>

                        <p className="mt-2 text-sm text-slate-600">
                            Izberi vrsto novega dokumenta.
                        </p>

                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                            <form action={actionPonudba}>
                                <button
                                    type="submit"
                                    className="w-full rounded-xl border border-slate-300 bg-white px-5 py-4 text-left transition hover:border-slate-400 hover:bg-slate-50"
                                >
                                    <span className="block font-semibold text-slate-900">
                                        Ponudba
                                    </span>

                                    <span className="mt-1 block text-sm text-slate-500">
                                        Informativni izračun
                                    </span>
                                </button>
                            </form>

                            <form action={actionNarocilo}>
                                <button
                                    type="submit"
                                    className="w-full rounded-xl bg-slate-900 px-5 py-4 text-left text-white transition hover:bg-slate-700"
                                >
                                    <span className="block font-semibold">
                                        Naročilo
                                    </span>

                                    <span className="mt-1 block text-sm text-slate-300">
                                        Neposredno v izdelavo
                                    </span>
                                </button>
                            </form>
                        </div>

                        <button
                            type="button"
                            onClick={() => setOdprto(false)}
                            className="mt-4 w-full rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                        >
                            Prekliči
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}