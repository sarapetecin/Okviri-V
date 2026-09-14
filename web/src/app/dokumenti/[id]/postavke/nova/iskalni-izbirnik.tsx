"use client";

import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

function jeVelikostPrimernaZaPaspartu(
    dolzina: number,
    sirina: number,
) {
    const krajsaStran = Math.min(
        dolzina,
        sirina,
    );

    const daljsaStran = Math.max(
        dolzina,
        sirina,
    );

    return (
        krajsaStran <= 80 &&
        daljsaStran <= 120
    );
}

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
    onSelectionChange?: (
        moznost: Moznost | null,
    ) => void;
};

type IzbiraDodatnihDelProps = {
    moznosti: Moznost[];
    privzetiIds?: number[];
    privzetoEnkratnoDelo?: EnkratnoDelo | null;
};

type IzbiraMaterialovProps = {
    moznostiOkvirjev: Moznost[];
    moznostiPaspartujev: Moznost[];
    moznostiStekel: Moznost[];
    privzetiOkvirIds?: number[];
    privzetiPaspartuIds?: number[];
    privzetiNaciniPaspartuja?: Array<"vrezan" | "polozen">;
    privzetoStekloId?: number | null;
    privzetaPostavitev?: "pokoncno" | "lezece";
};

type EnkratnoDelo = {
    naziv: string;
    opis: string | null;
    cena_enote: number;
};

export function IskalniIzbirnik({
    name,
    label,
    placeholder,
    moznosti,
    required = false,
    privzetiId = null,
    onSelectionChange,
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
        onSelectionChange?.(moznost);
    }

    function pocistiIzbiro() {
        setIzbranaMoznost(null);
        setIskanje("");
        setOdprto(true);
        onSelectionChange?.(null);
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
    privzetoEnkratnoDelo = null,
}: IzbiraDodatnihDelProps) {
    const [steviloDel, setSteviloDel] = useState(
        Math.max(1, privzetiIds.length),
    );

    const [
        prikaziEnkratnoDelo,
        setPrikaziEnkratnoDelo,
    ] = useState(privzetoEnkratnoDelo !== null,);

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
            <div className="border-t border-slate-200 pt-4">
                <button
                    type="button"
                    onClick={() => {
                        setPrikaziEnkratnoDelo(
                            (trenutno) => !trenutno,
                        );
                    }}
                    className="text-sm font-semibold text-slate-700 underline"
                >
                    {prikaziEnkratnoDelo
                        ? "Odstrani enkratno delo"
                        : "Vnesi drugo dodatno delo"}
                </button>

                {prikaziEnkratnoDelo && (
                    <div className="mt-3 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
                        <div>
                            <label
                                htmlFor="enkratnoDeloNaziv"
                                className="mb-1 block text-sm font-medium text-slate-700"
                            >
                                Naziv dela *
                            </label>

                            <input
                                id="enkratnoDeloNaziv"
                                name="enkratnoDeloNaziv"
                                type="text"
                                required
                                maxLength={200}
                                defaultValue={
                                    privzetoEnkratnoDelo?.naziv ?? ""
                                }
                                placeholder="Na primer: posebno čiščenje"
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="enkratnoDeloCena"
                                className="mb-1 block text-sm font-medium text-slate-700"
                            >
                                Cena na kos (€) *
                            </label>

                            <input
                                id="enkratnoDeloCena"
                                name="enkratnoDeloCena"
                                type="number"
                                min="0"
                                step="0.01"
                                required
                                defaultValue={
                                    privzetoEnkratnoDelo?.cena_enote ?? ""
                                }
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label
                                htmlFor="enkratnoDeloOpis"
                                className="mb-1 block text-sm font-medium text-slate-700"
                            >
                                Opis
                            </label>

                            <input
                                id="enkratnoDeloOpis"
                                name="enkratnoDeloOpis"
                                type="text"
                                maxLength={500}
                                defaultValue={
                                    privzetoEnkratnoDelo?.opis ?? ""
                                }
                                placeholder="Neobvezno"
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
                            />
                        </div>
                    </div>
                )}
            </div>
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
    privzetaPostavitev = "pokoncno",
}: IzbiraMaterialovProps) {
    const [steviloOkvirjev, setSteviloOkvirjev] =
        useState(Math.max(1, privzetiOkvirIds.length));

    const [
        steviloPaspartujev,
        setSteviloPaspartujev,
    ] = useState(Math.max(1, privzetiPaspartuIds.length));

    const vsebnikRef = useRef<HTMLDivElement>(null);

    const [dolzinaSlike, setDolzinaSlike] =
        useState(0);

    const [sirinaSlike, setSirinaSlike] =
        useState(0);

    const [izbranPaspartu, setIzbranPaspartu] =
        useState(privzetiPaspartuIds.length > 0);

    const privzetoSteklo =
        moznostiStekel.find(
            (moznost) =>
                moznost.id === privzetoStekloId,
        );

    const [
        izbranoStekloJeOgledalo,
        setIzbranoStekloJeOgledalo,
    ] = useState(
        privzetoSteklo?.naziv
            .toLocaleLowerCase("sl")
            .includes("ogledalo") ?? false,
    );

    useEffect(() => {
        const obrazec =
            vsebnikRef.current?.closest("form");

        if (!obrazec) {
            return;
        }

        const dolzinaInput =
            obrazec.elements.namedItem("dolzina");

        const sirinaInput =
            obrazec.elements.namedItem("sirina");

        if (
            !(dolzinaInput instanceof HTMLInputElement) ||
            !(sirinaInput instanceof HTMLInputElement)
        ) {
            return;
        }


        const dolzinaPolje = dolzinaInput;
        const sirinaPolje = sirinaInput;

        function osveziMere() {
            setDolzinaSlike(
                Number(dolzinaPolje.value) || 0,
            );

            setSirinaSlike(
                Number(sirinaPolje.value) || 0,
            );
        }

        osveziMere();

        dolzinaPolje.addEventListener(
            "input",
            osveziMere,
        );

        sirinaPolje.addEventListener(
            "input",
            osveziMere,
        );

        return () => {
            dolzinaPolje.removeEventListener(
                "input",
                osveziMere,
            );

            sirinaPolje.removeEventListener(
                "input",
                osveziMere,
            );
        };
    }, []);

    const mereSoVnesene =
        dolzinaSlike > 0 && sirinaSlike > 0;

    const paspartuJePrimeren =
        mereSoVnesene &&
        jeVelikostPrimernaZaPaspartu(
            dolzinaSlike,
            sirinaSlike,
        );

    return (
        <div ref={vsebnikRef} className="grid items-start gap-6 lg:grid-cols-3">
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
            {/* PASPARTUJI */}
            <div
                className={
                    izbranPaspartu &&
                        mereSoVnesene &&
                        !paspartuJePrimeren
                        ? "space-y-4 rounded-xl border-2 border-red-300 bg-red-50 p-3"
                        : izbranPaspartu && paspartuJePrimeren
                            ? "space-y-4 rounded-xl border border-green-300 bg-green-50 p-3"
                            : "space-y-4"
                }
            >
                {izbranPaspartu && mereSoVnesene && (
                    <div
                        role={
                            paspartuJePrimeren
                                ? "status"
                                : "alert"
                        }
                        className={
                            paspartuJePrimeren
                                ? "rounded-lg bg-green-100 px-3 py-2 text-sm font-semibold text-green-800"
                                : "rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-800"
                        }
                    >
                        {paspartuJePrimeren
                            ? `Primerno za paspartu: ${dolzinaSlike} × ${sirinaSlike} cm`
                            : `Ni primerno za paspartu. Največja dovoljena velikost je 80 × 120 cm.`}
                    </div>
                )}
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
                                onSelectionChange={(id) => {
                                    setIzbranPaspartu(id !== null);
                                }}
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

            {/* STEKLO IN POSTAVITEV */}
            <div className="space-y-4">
                <IskalniIzbirnik
                    name="stekloId"
                    label="Steklo"
                    placeholder="Poišči steklo"
                    moznosti={moznostiStekel}
                    privzetiId={privzetoStekloId}
                    onSelectionChange={(moznost) => {
                        const naziv =
                            moznost?.naziv
                                .trim()
                                .toLocaleLowerCase("sl") ?? "";

                        setIzbranoStekloJeOgledalo(
                            naziv.includes("ogledalo"),
                        );
                    }}
                />

                {izbranoStekloJeOgledalo && (
                    <fieldset>
                        <legend className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                            Postavitev ogledala
                        </legend>

                        <div className="grid grid-cols-2 gap-2">
                            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900">
                                <input
                                    name="postavitev"
                                    type="radio"
                                    value="pokoncno"
                                    defaultChecked={
                                        privzetaPostavitev ===
                                        "pokoncno"
                                    }
                                    className="h-4 w-4 accent-slate-900"
                                />

                                <span
                                    aria-hidden="true"
                                    className="inline-block h-6 w-4 rounded-sm border-2 border-slate-700"
                                />

                                <span className="text-slate-900">
                                    Pokončno
                                </span>
                            </label>

                            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900">
                                <input
                                    name="postavitev"
                                    type="radio"
                                    value="lezece"
                                    defaultChecked={
                                        privzetaPostavitev ===
                                        "lezece"
                                    }
                                    className="h-4 w-4 accent-slate-900"
                                />

                                <span
                                    aria-hidden="true"
                                    className="inline-block h-4 w-6 rounded-sm border-2 border-slate-700"
                                />

                                <span className="text-slate-900">
                                    Ležeče
                                </span>
                            </label>
                        </div>
                    </fieldset>
                )}
            </div>
        </div>
    );
}
