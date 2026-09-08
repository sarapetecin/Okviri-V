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

type IzbiraDodatnihDelProps = {
    moznosti: Moznost[];
    privzetiIds?: number[];
};

type IzbiraMaterialovProps = {
    moznostiOkvirjev: Moznost[];
    moznostiPaspartujev: Moznost[];
    moznostiStekel: Moznost[];
    privzetiOkvirIds?: number[];
    privzetiPaspartuIds?: number[];
    privzetiNaciniPaspartuja?: Array<"vrezan" | "polozen">;
    privzetoStekloId?: number | null;
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

export function IzbiraDodatnihDel({
    moznosti,
    privzetiIds = [],
}: IzbiraDodatnihDelProps) {
    const [steviloDel, setSteviloDel] = useState(
        Math.max(1, privzetiIds.length),
    );

    return (
        <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
                {Array.from(
                    { length: steviloDel },
                    (_, indeks) => (
                        <div key={indeks}>
                            <IskalniIzbirnik
                                name="dodatnoDeloId"
                                label={
                                    indeks === 0
                                        ? "Dodatno delo"
                                        : `Dodatno delo ${indeks + 1}`
                                }
                                placeholder="Poišči dodatno delo"
                                moznosti={moznosti}
                                privzetiId={privzetiIds[indeks]}
                            />

                            {indeks === steviloDel - 1 &&
                                indeks > 0 && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSteviloDel(
                                                (trenutno) => trenutno - 1,
                                            )
                                        }
                                        className="mt-2 text-sm font-medium text-red-600 transition hover:text-red-800"
                                    >
                                        Odstrani dodatno delo
                                    </button>
                                )}
                        </div>
                    ),
                )}
            </div>

            {steviloDel <
                Math.min(moznosti.length, 50) && (
                    <button
                        type="button"
                        onClick={() =>
                            setSteviloDel(
                                (trenutno) => trenutno + 1,
                            )
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:bg-slate-50"
                    >
                        <span
                            aria-hidden="true"
                            className="text-lg leading-none"
                        >
                            +
                        </span>
                        Dodaj dodatno delo
                    </button>
                )}
        </div>
    );
}

export function IzbiraMaterialov({
    moznostiOkvirjev,
    moznostiPaspartujev,
    moznostiStekel,
    privzetiOkvirIds = [],
    privzetiPaspartuIds = [],
    privzetiNaciniPaspartuja = [],
    privzetoStekloId = null,
}: IzbiraMaterialovProps) {
    const [steviloOkvirjev, setSteviloOkvirjev] =
        useState(Math.max(1, privzetiOkvirIds.length));

    const [
        steviloPaspartujev,
        setSteviloPaspartujev,
    ] = useState(Math.max(1, privzetiPaspartuIds.length));

    return (
        <div className="grid items-start gap-6 lg:grid-cols-3">
            {/* OKVIRJI */}
            <div className="space-y-4">
                {Array.from(
                    { length: steviloOkvirjev },
                    (_, indeks) => (
                        <div key={indeks}>
                            <IskalniIzbirnik
                                name="okvirId"
                                label={
                                    indeks === 0
                                        ? "Okvir"
                                        : `Okvir ${indeks + 1}`
                                }
                                placeholder="Poišči okvir"
                                moznosti={moznostiOkvirjev}
                                privzetiId={privzetiOkvirIds[indeks]}
                            />

                            {indeks === steviloOkvirjev - 1 &&
                                indeks > 0 && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSteviloOkvirjev(
                                                (trenutno) => trenutno - 1,
                                            )
                                        }
                                        className="mt-2 text-sm font-medium text-red-600 hover:text-red-800"
                                    >
                                        Odstrani okvir
                                    </button>
                                )}
                        </div>
                    ),
                )}

                {steviloOkvirjev < 3 && (
                    <button
                        type="button"
                        onClick={() =>
                            setSteviloOkvirjev(
                                (trenutno) => trenutno + 1,
                            )
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-500 hover:bg-slate-50"
                    >
                        <span
                            aria-hidden="true"
                            className="text-lg leading-none"
                        >
                            +
                        </span>
                        Dodaj okvir
                    </button>
                )}
            </div>

            {/* PASPARTUJI */}
            <div className="space-y-4">
                {Array.from(
                    { length: steviloPaspartujev },
                    (_, indeks) => (
                        <div key={indeks} className="space-y-3">
                            <IskalniIzbirnik
                                name="paspartuId"
                                label={
                                    indeks === 0
                                        ? "Paspartu"
                                        : "Paspartu 2"
                                }
                                placeholder="Poišči paspartu"
                                moznosti={moznostiPaspartujev}
                                privzetiId={privzetiPaspartuIds[indeks]}
                            />

                            <fieldset>
                                <legend className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                                    Način paspartuja
                                </legend>

                                <div className="grid grid-cols-2 gap-2">
                                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                                        <input
                                            name={`nacinPaspartu${indeks + 1}`}
                                            type="radio"
                                            value="vrezan"
                                            defaultChecked={
                                                privzetiNaciniPaspartuja[indeks] !==
                                                "polozen"
                                            }
                                            className="h-4 w-4 accent-slate-900"
                                        />
                                        <span
                                            aria-hidden="true"
                                            className="text-xl font-bold leading-none text-slate-900"
                                        >
                                            □
                                        </span>
                                        <span className="text-slate-900">Vrezan</span>
                                    </label>

                                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                                        <input
                                            name={`nacinPaspartu${indeks + 1}`}
                                            type="radio"
                                            value="polozen"
                                            defaultChecked={
                                                privzetiNaciniPaspartuja[indeks] ===
                                                "polozen"
                                            }
                                            className="h-4 w-4 accent-slate-900"
                                        />
                                        <span
                                            aria-hidden="true"
                                            className="text-xl font-bold leading-none text-slate-900"
                                        >
                                            ○
                                        </span>
                                        <span className="text-slate-900">Položen</span>
                                    </label>
                                </div>
                            </fieldset>

                            {indeks === 1 && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setSteviloPaspartujev(1)
                                    }
                                    className="text-sm font-medium text-red-600 hover:text-red-800"
                                >
                                    Odstrani paspartu
                                </button>
                            )}
                        </div>
                    ),
                )}

                {steviloPaspartujev < 2 && (
                    <button
                        type="button"
                        onClick={() =>
                            setSteviloPaspartujev(2)
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-500 hover:bg-slate-50"
                    >
                        <span
                            aria-hidden="true"
                            className="text-lg leading-none"
                        >
                            +
                        </span>
                        Dodaj paspartu
                    </button>
                )}
            </div>

            {/* STEKLO */}
            <IskalniIzbirnik
                name="stekloId"
                label="Steklo"
                placeholder="Poišči steklo"
                moznosti={moznostiStekel}
                privzetiId={privzetoStekloId}
            />
        </div>
    );
}
