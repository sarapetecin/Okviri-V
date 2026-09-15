"use client";

import { sl } from "date-fns/locale";
import { format, parseISO } from "date-fns";
import {
    useState,
    type CSSProperties,
} from "react"; import { DayPicker } from "react-day-picker";

import "react-day-picker/style.css";

type KoledarRokaProps = {
    trenutniRok: string | null;
    zasedenost: Record<string, number>;
    steviloSlikNarocila: number;
    action: (
        formData: FormData,
    ) => void | Promise<void>;
};

function razredZasedenosti(stevilo: number) {
    if (stevilo <= 30) {
        return "bg-green-100 text-green-900";
    }

    if (stevilo <= 60) {
        return "bg-yellow-100 text-yellow-900";
    }

    if (stevilo <= 75) {
        return "bg-orange-100 text-orange-900";
    }

    return "bg-red-100 text-red-900";
}

export function KoledarRoka({
    trenutniRok,
    zasedenost,
    steviloSlikNarocila,
    action,
}: KoledarRokaProps) {
    const [izbraniDatum, setIzbraniDatum] =
        useState<Date | undefined>(
            trenutniRok
                ? parseISO(trenutniRok)
                : undefined,
        );

    const [odprto, setOdprto] =
        useState(false);

    const datumZaBazo = izbraniDatum
        ? format(izbraniDatum, "yyyy-MM-dd")
        : "";

    const trenutnoStevilo = datumZaBazo
        ? zasedenost[datumZaBazo] ?? 0
        : 0;

    const skupnoPoShranitvi =
        trenutnoStevilo + steviloSlikNarocila;

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => {
                    setOdprto((trenutno) => !trenutno);
                }}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
            >
                {izbraniDatum
                    ? format(izbraniDatum, "d. M. yyyy")
                    : "Določi rok"}
            </button>

            {odprto && (
                <div className="absolute left-0 top-full z-40 mt-2 w-[340px] rounded-xl border border-slate-200 bg-white p-4 text-slate-900 shadow-xl">
                    <DayPicker
                        className="text-slate-900"
                        style={
                            {
                                "--rdp-accent-color": "#334155",
                                "--rdp-accent-background-color": "#e2e8f0",
                                "--rdp-today-color": "#334155",
                            } as CSSProperties
                        }
                        mode="single"
                        locale={sl}
                        selected={izbraniDatum}
                        onSelect={setIzbraniDatum}
                        weekStartsOn={1}
                        modifiers={{
                            danes: new Date(),
                            cetrtek: (datum) =>
                                datum.getDay() === 4,

                            zelena: (datum) => {
                                const kljuc = format(
                                    datum,
                                    "yyyy-MM-dd",
                                );

                                return (
                                    datum.getDay() === 4 &&
                                    (zasedenost[kljuc] ?? 0) <= 30
                                );
                            },

                            rumena: (datum) => {
                                const stevilo =
                                    zasedenost[
                                    format(datum, "yyyy-MM-dd")
                                    ] ?? 0;

                                return (
                                    datum.getDay() === 4 &&
                                    stevilo >= 31 &&
                                    stevilo <= 60
                                );
                            },

                            oranzna: (datum) => {
                                const stevilo =
                                    zasedenost[
                                    format(datum, "yyyy-MM-dd")
                                    ] ?? 0;

                                return (
                                    datum.getDay() === 4 &&
                                    stevilo >= 61 &&
                                    stevilo <= 75
                                );
                            },

                            rdeca: (datum) => {
                                const stevilo =
                                    zasedenost[
                                    format(datum, "yyyy-MM-dd")
                                    ] ?? 0;

                                return (
                                    datum.getDay() === 4 &&
                                    stevilo >= 76
                                );
                            },
                        }}
                        modifiersClassNames={{
                            danes:
                                "font-black outline outline-2 outline-offset-2 outline-slate-900",
                            cetrtek:
                                "font-bold ring-2 ring-slate-500",
                            zelena:
                                "!bg-green-100 !text-green-900",
                            rumena:
                                "!bg-yellow-100 !text-yellow-900",
                            oranzna:
                                "!bg-orange-100 !text-orange-900",
                            rdeca:
                                "!bg-red-100 !text-red-900",
                        }}
                    />

                    {izbraniDatum && (
                        <div
                            className={`mt-3 rounded-lg px-3 py-2 text-sm ${razredZasedenosti(
                                trenutnoStevilo,
                            )}`}
                        >
                            Trenutno načrtovanih:{" "}
                            <strong>
                                {trenutnoStevilo}
                            </strong>

                            <br />

                            Po tem naročilu:{" "}
                            <strong>
                                {skupnoPoShranitvi}
                            </strong>
                        </div>
                    )}

                    <form
                        action={action}
                        className="mt-3"
                        onSubmit={(dogodek) => {
                            if (!izbraniDatum) {
                                dogodek.preventDefault();
                                return;
                            }

                            if (skupnoPoShranitvi > 80) {
                                const potrjeno =
                                    window.confirm(
                                        `Za ta datum je načrtovanih ${trenutnoStevilo} slik. ` +
                                        `S tem naročilom jih bo ${skupnoPoShranitvi}. ` +
                                        "Ali si prepričana, da želiš določiti ta rok?",
                                    );

                                if (!potrjeno) {
                                    dogodek.preventDefault();
                                    return;
                                }

                                const obrazec =
                                    dogodek.currentTarget;

                                const potrditev =
                                    obrazec.elements.namedItem(
                                        "potrdiPreseganje",
                                    );

                                if (
                                    potrditev instanceof
                                    HTMLInputElement
                                ) {
                                    potrditev.value = "da";
                                }
                            }
                            setOdprto(false);
                        }}
                    >
                        <input
                            type="hidden"
                            name="rokIzdelave"
                            value={datumZaBazo}
                        />

                        <input
                            type="hidden"
                            name="potrdiPreseganje"
                            value="ne"
                        />

                        <button
                            type="submit"
                            disabled={!izbraniDatum}
                            className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Shrani rok izdelave
                        </button>
                    </form>

                    <div className="mt-3 grid grid-cols-2 gap-1 text-xs text-slate-600">
                        <span className="rounded bg-green-100 px-2 py-1">
                            0–30
                        </span>
                        <span className="rounded bg-yellow-100 px-2 py-1">
                            31–60
                        </span>
                        <span className="rounded bg-orange-100 px-2 py-1">
                            61–75
                        </span>
                        <span className="rounded bg-red-100 px-2 py-1">
                            76 ali več
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}