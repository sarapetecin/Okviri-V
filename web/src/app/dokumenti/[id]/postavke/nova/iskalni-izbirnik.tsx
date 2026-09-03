"use client";

import { useMemo, useState } from "react";

type Moznost = {
    id: number;
    naziv: string;
    opis?: string | null;
};

type IskalniIzbirnikProps = {
    name: string;
    label: string;
    placeholder: string;
    moznosti: Moznost[];
    required?: boolean;
    privzetiId?: number | null;
};

export function IskalniIzbirnik({
    name,
    label,
    placeholder,
    moznosti,
    required = false,
    privzetiId = null,
}: IskalniIzbirnikProps) {
    const privzetaMoznost =
        moznosti.find((moznost) => moznost.id === privzetiId) ?? null;

    const [iskanje, setIskanje] = useState(
        privzetaMoznost?.naziv ?? "",);

    const [izbranaMoznost, setIzbranaMoznost] =
        useState<Moznost | null>(privzetaMoznost);

    const [odprto, setOdprto] = useState(false);

    const filtriraneMoznosti = useMemo(() => {
        const iskaniNiz = iskanje.trim().toLocaleLowerCase("sl");

        if (!iskaniNiz) {
            return moznosti.slice(0, 30);
        }

        return moznosti
            .filter((moznost) => {
                const vsebina = `${moznost.naziv} ${moznost.opis ?? ""}`
                    .toLocaleLowerCase("sl");

                return vsebina.includes(iskaniNiz);
            })
            .slice(0, 30);
    }, [iskanje, moznosti]);

    function izberiMoznost(moznost: Moznost) {
        setIzbranaMoznost(moznost);
        setIskanje(moznost.naziv);
        setOdprto(false);
    }

    function pocistiIzbiro() {
        setIzbranaMoznost(null);
        setIskanje("");
        setOdprto(true);
    }

    return (
        <div className="relative">
            <label className="mb-2 block text-sm font-medium text-slate-700">
                {label}
                {required ? " *" : ""}
            </label>

            <input
                type="hidden"
                name={name}
                value={izbranaMoznost?.id ?? ""}
                required={required}
            />

            <div className="flex rounded-lg border border-slate-300 bg-white focus-within:border-slate-700 focus-within:ring-2 focus-within:ring-slate-200">
                <input
                    type="text"
                    value={iskanje}
                    placeholder={placeholder}
                    autoComplete="off"
                    className="min-w-0 flex-1 rounded-l-lg px-3 py-2.5 text-slate-900 outline-none"
                    onFocus={() => setOdprto(true)}
                    onBlur={() => {
                        window.setTimeout(() => setOdprto(false), 150);
                    }}
                    onChange={(dogodek) => {
                        setIskanje(dogodek.target.value);
                        setIzbranaMoznost(null);
                        setOdprto(true);
                    }}
                />

                {(izbranaMoznost || iskanje) && (
                    <button
                        type="button"
                        onClick={pocistiIzbiro}
                        className="rounded-r-lg px-3 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                        aria-label={`Počisti izbiro: ${label}`}
                    >
                        Počisti
                    </button>
                )}
            </div>

            {odprto && (
                <div className="absolute z-30 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-xl">
                    {filtriraneMoznosti.length === 0 ? (
                        <p className="px-3 py-4 text-sm text-slate-500">
                            Ni zadetkov.
                        </p>
                    ) : (
                        filtriraneMoznosti.map((moznost) => (
                            <button
                                key={moznost.id}
                                type="button"
                                onMouseDown={(dogodek) => {
                                    dogodek.preventDefault();
                                    izberiMoznost(moznost);
                                }}
                                className="block w-full rounded-md px-3 py-2 text-left transition hover:bg-slate-100"
                            >
                                <span className="block text-sm font-medium text-slate-900">
                                    {moznost.naziv}
                                </span>

                                {moznost.opis && (
                                    <span className="mt-0.5 block text-xs text-slate-500">
                                        {moznost.opis}
                                    </span>
                                )}
                            </button>
                        ))
                    )}

                    {filtriraneMoznosti.length === 30 && (
                        <p className="border-t border-slate-100 px-3 py-2 text-xs text-slate-500">
                            Prikazanih je prvih 30 zadetkov. Za ožji izbor nadaljuj
                            iskanje.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}