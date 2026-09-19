"use client";

import { useState, useTransition } from "react";

import type { Database } from "@/types/database.types";

import { KlikabilnaVrstica } from "./klikabilna-vrstica";

type StatusDokumenta =
    Database["public"]["Enums"]["status_prodajnega_dokumenta"];

type VrstaDokumenta =
    Database["public"]["Enums"]["vrsta_prodajnega_dokumenta"];

type Dokument = {
    id: number;
    datum_sprejema: string;
    rok_izdelave: string | null;
    stranka_naziv: string;
    vrsta: VrstaDokumenta;
    status: StatusDokumenta;
    skupni_znesek: number;
    izdal_uporabnik_id: number | null;
    izdal_ime: string;
};

type Props = {
    dokumenti: Dokument[];
    vrsta: VrstaDokumenta | null;
    actionIzbrisi: (
        dokumentIds: number[],
        vrsta: VrstaDokumenta | null,
    ) => Promise<void>;
};

const naziviStatusov: Record<
    StatusDokumenta,
    string
> = {
    osnutek: "Osnutek",
    poslano_v_pregled: "Poslano v pregled",
    zavrnjeno: "Zavrnjeno",
    potrjeno: "Potrjeno",
    v_izdelavi: "V izdelavi",
    dokoncano: "Dokončano",
    rocno_zaprto: "Ročno zaprto",
    preklicano: "Preklicano",
};

const naziviVrst: Record<VrstaDokumenta, string> = {
    ponudba: "Ponudba",
    narocilo: "Naročilo",
};

function oblikujDatum(datum: string) {
    return new Intl.DateTimeFormat("sl-SI").format(
        new Date(`${datum}T00:00:00`),
    );
}

function oblikujZnesek(znesek: number) {
    return new Intl.NumberFormat("sl-SI", {
        style: "currency",
        currency: "EUR",
    }).format(znesek);
}

export function TabelaDokumentov({
    dokumenti,
    vrsta,
    actionIzbrisi,
}: Props) {
    const [izbrani, setIzbrani] = useState<
        Set<number>
    >(new Set());

    const [brisanjePoteka, zacniBrisanje] =
        useTransition();

    const vsiPrikazaniSoIzbrani =
        dokumenti.length > 0 &&
        dokumenti.every((dokument) =>
            izbrani.has(dokument.id),
        );

    function preklopiDokument(
        dokumentId: number,
    ) {
        setIzbrani((trenutni) => {
            const novi = new Set(trenutni);

            if (novi.has(dokumentId)) {
                novi.delete(dokumentId);
            } else {
                novi.add(dokumentId);
            }

            return novi;
        });
    }

    function preklopiVsePrikazane() {
        if (vsiPrikazaniSoIzbrani) {
            setIzbrani(new Set());

            return;
        }

        setIzbrani(
            new Set(
                dokumenti.map(
                    (dokument) => dokument.id,
                ),
            ),
        );
    }

    function izbrisiIzbrane() {
        const dokumentIds = Array.from(izbrani);

        if (dokumentIds.length === 0) {
            return;
        }

        const potrjeno = window.confirm(
            `Trajno bo izbrisanih ${dokumentIds.length} izbranih dokumentov in vse njihove postavke. Tega dejanja ni mogoče razveljaviti. Nadaljujem?`,
        );

        if (!potrjeno) {
            return;
        }

        zacniBrisanje(() => {
            void actionIzbrisi(
                dokumentIds,
                vrsta,
            );
        });
    }

    return (
        <div className="space-y-3">
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <p className="px-1 text-sm text-slate-600">
                    {izbrani.size > 0
                        ? `Izbranih dokumentov: ${izbrani.size}`
                        : "Izberi dokumente v tabeli."}
                </p>

                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        disabled={
                            brisanjePoteka ||
                            izbrani.size === 0
                        }
                        onClick={izbrisiIzbrane}
                        className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {brisanjePoteka
                            ? "Brišem ..."
                            : "Izbriši izbrane"}
                    </button>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-slate-200 bg-slate-50">
                            <tr>
                                <th className="w-12 px-5 py-3">
                                    <input
                                        type="checkbox"
                                        checked={
                                            vsiPrikazaniSoIzbrani
                                        }
                                        onChange={
                                            preklopiVsePrikazane
                                        }
                                        aria-label="Izberi vse prikazane dokumente"
                                        className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-slate-900"
                                    />
                                </th>

                                <th className="px-5 py-3 text-sm font-semibold text-slate-700">
                                    Številka
                                </th>

                                <th className="px-5 py-3 text-sm font-semibold text-slate-700">
                                    Vrsta
                                </th>

                                <th className="px-5 py-3 text-sm font-semibold text-slate-700">
                                    Stranka
                                </th>

                                {vrsta === "ponudba" && (
                                    <th className="px-5 py-3 text-sm font-semibold text-slate-700">
                                        Avtor
                                    </th>
                                )}

                                <th className="px-5 py-3 text-sm font-semibold text-slate-700">
                                    Datum
                                </th>

                                <th className="px-5 py-3 text-sm font-semibold text-slate-700">
                                    Rok izdelave
                                </th>

                                <th className="px-5 py-3 text-sm font-semibold text-slate-700">
                                    Status
                                </th>

                                <th className="px-5 py-3 text-right text-sm font-semibold text-slate-700">
                                    Znesek
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-200">
                            {dokumenti.map(
                                (dokument) => (
                                    <KlikabilnaVrstica
                                        key={dokument.id}
                                        href={`/dokumenti/${dokument.id}`}
                                        oznaka={`Odpri dokument ${dokument.id}`}
                                    >
                                        <td
                                            className="w-12 px-5 py-4"
                                            onClick={(
                                                dogodek,
                                            ) => {
                                                dogodek.stopPropagation();
                                            }}
                                            onKeyDown={(
                                                dogodek,
                                            ) => {
                                                dogodek.stopPropagation();
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={izbrani.has(
                                                    dokument.id,
                                                )}
                                                onChange={() =>
                                                    preklopiDokument(
                                                        dokument.id,
                                                    )
                                                }
                                                aria-label={`Izberi dokument ${dokument.id}`}
                                                className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-slate-900"
                                            />
                                        </td>

                                        <td className="px-5 py-4 text-sm text-slate-900">
                                            {dokument.id}
                                        </td>

                                        <td className="px-5 py-4 text-sm text-slate-700">
                                            {
                                                naziviVrst[
                                                dokument
                                                    .vrsta
                                                ]
                                            }
                                        </td>

                                        <td className="px-5 py-4 text-sm text-slate-700">
                                            {
                                                dokument.stranka_naziv
                                            }
                                        </td>

                                        {vrsta ===
                                            "ponudba" && (
                                                <td className="px-5 py-4 text-sm font-medium text-slate-700">
                                                    {
                                                        dokument.izdal_ime
                                                    }
                                                </td>
                                            )}

                                        <td className="px-5 py-4 text-sm text-slate-600">
                                            {oblikujDatum(
                                                dokument.datum_sprejema,
                                            )}
                                        </td>

                                        <td className="px-5 py-4 text-sm text-slate-600">
                                            {dokument.rok_izdelave
                                                ? oblikujDatum(
                                                    dokument.rok_izdelave,
                                                )
                                                : "—"}
                                        </td>

                                        <td className="px-5 py-4 text-sm text-slate-700">
                                            {
                                                naziviStatusov[
                                                dokument
                                                    .status
                                                ]
                                            }
                                        </td>

                                        <td className="px-5 py-4 text-right text-sm font-medium text-slate-900">
                                            {oblikujZnesek(
                                                dokument.skupni_znesek,
                                            )}
                                        </td>
                                    </KlikabilnaVrstica>
                                ),
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}