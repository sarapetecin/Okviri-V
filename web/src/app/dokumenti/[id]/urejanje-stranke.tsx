"use client";

import { useState, useMemo, useRef } from "react";

import { useFormStatus } from "react-dom";

type Stranka = {
    id: number;
    naziv: string;
    telefonska_stevilka: string | null;
};

type UrejanjeStrankeProps = {
    stranke: Stranka[];
    salonPrevzema: "ljubljana" | "bevke";

    actionIzberi: (
        formData: FormData,
    ) => void | Promise<void>;

    actionUstvari: (
        formData: FormData,
    ) => void | Promise<void>;

    actionSalon: (
        formData: FormData,
    ) => void | Promise<void>;
};

const inputClassName =
    "w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900 outline-none focus:border-slate-600";

function GumbUstvariInIzberi() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            aria-disabled={pending}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-wait disabled:opacity-60"
        >
            {pending
                ? "Ustvarjam stranko ..."
                : "Ustvari in izberi"}
        </button>
    );
}

function IzbiraStranke({
    stranke,
}: {
    stranke: Stranka[];
}) {
    const { pending } = useFormStatus();
    const [iskanje, setIskanje] = useState("");
    const [odprto, setOdprto] = useState(false);

    const skritoPoljeRef =
        useRef<HTMLInputElement>(null);

    const rezultati = useMemo(() => {
        const iskaniNiz = iskanje
            .trim()
            .toLocaleLowerCase("sl");

        if (!iskaniNiz) {
            return stranke.slice(0, 8);
        }

        return stranke
            .filter((stranka) => {
                const vsebina = [
                    stranka.naziv,
                    stranka.telefonska_stevilka,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLocaleLowerCase("sl");

                return vsebina.includes(iskaniNiz);
            })
            .slice(0, 8);
    }, [iskanje, stranke]);

    function izberiStranko(stranka: Stranka) {
        const skritoPolje =
            skritoPoljeRef.current;

        if (!skritoPolje) {
            return;
        }

        setIskanje(stranka.naziv);
        setOdprto(false);

        skritoPolje.value =
            `${stranka.id} | ${stranka.naziv}`;

        skritoPolje.form?.requestSubmit();
    }

    return (
        <div className="relative">
            <label
                htmlFor="iskanjeStranke"
                className="mb-2 block text-sm font-medium text-slate-700"
            >
                Poišči drugo stranko
            </label>

            <input
                ref={skritoPoljeRef}
                name="strankaIzbira"
                type="hidden"
            />

            <input
                id="iskanjeStranke"
                type="search"
                value={iskanje}
                placeholder="Vpiši naziv ali telefon"
                autoComplete="off"
                disabled={pending}
                onFocus={() => setOdprto(true)}
                onChange={(dogodek) => {
                    setIskanje(
                        dogodek.currentTarget.value,
                    );
                    setOdprto(true);
                }}
                className={`${inputClassName} disabled:cursor-wait disabled:bg-slate-100`}
            />

            {odprto && !pending && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-xl">
                    {rezultati.length > 0 ? (
                        rezultati.map((stranka) => (
                            <button
                                key={stranka.id}
                                type="button"
                                onMouseDown={(dogodek) => {
                                    dogodek.preventDefault();
                                    izberiStranko(stranka);
                                }}
                                className="block w-full rounded-md px-3 py-2 text-left transition hover:bg-slate-100 focus:bg-slate-100"
                            >
                                <span className="block text-sm font-semibold text-slate-900">
                                    {stranka.naziv}
                                </span>

                                <span className="mt-0.5 block text-xs text-slate-500">
                                    {stranka.telefonska_stevilka ??
                                        "Brez telefonske številke"}
                                </span>
                            </button>
                        ))
                    ) : (
                        <p className="px-3 py-3 text-sm text-slate-500">
                            Nobena stranka ne ustreza iskanju.
                        </p>
                    )}
                </div>
            )}

            {pending && (
                <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                    <span
                        aria-hidden="true"
                        className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900"
                    />
                    Izbiram stranko …
                </div>
            )}
        </div>
    );
}

export function UrejanjeStranke({
    stranke,
    salonPrevzema,
    actionIzberi,
    actionUstvari,
    actionSalon,
}: UrejanjeStrankeProps) {
    const [prikaziUstvarjanje, setPrikaziUstvarjanje] =
        useState(false);
    const [racunNaPodjetje, setRacunNaPodjetje] =
        useState(false);
    const [
        prikaziDodatnePodatke,
        setPrikaziDodatnePodatke,
    ] = useState(false);

    return (
        <div className="mt-5 border-t border-slate-200 pt-4">
            {!prikaziUstvarjanje ? (
                <>
                    <form
                        action={actionSalon}
                        className="mb-4 border-b border-slate-200 pb-4"
                    >
                        <label
                            htmlFor="salonPrevzema"
                            className="mb-1 block text-sm font-medium text-slate-700"
                        >
                            Salon prevzema
                        </label>

                        <select
                            id="salonPrevzema"
                            name="salonPrevzema"
                            defaultValue={salonPrevzema}
                            onChange={(dogodek) => {
                                dogodek.currentTarget.form?.requestSubmit();
                            }}
                            className={inputClassName}
                        >
                            <option value="ljubljana">
                                Ljubljana
                            </option>

                            <option value="bevke">
                                Bevke
                            </option>
                        </select>
                    </form>
                    <form action={actionIzberi}>
                        <IzbiraStranke stranke={stranke} />
                    </form>

                    <button
                        type="button"
                        onClick={() => setPrikaziUstvarjanje(true)}
                        className="mt-3 text-sm font-semibold text-slate-700 underline"
                    >
                        Stranka še ne obstaja
                    </button>
                </>
            ) : (
                <form action={actionUstvari} className="space-y-2">
                    <div>
                        <label
                            htmlFor="nazivNoveStranke"
                            className="mb-1 block text-sm font-medium text-slate-700"
                        >
                            Naziv stranke *
                        </label>

                        <input
                            id="nazivNoveStranke"
                            name="naziv"
                            type="text"
                            required
                            maxLength={200}
                            className={inputClassName}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="telefonNoveStranke"
                            className="mb-1 block text-sm font-medium text-slate-700"
                        >
                            Telefonska številka
                        </label>

                        <input
                            id="telefonNoveStranke"
                            name="telefonskaStevilka"
                            type="tel"
                            className={inputClassName}
                        />
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setPrikaziDodatnePodatke(
                                (trenutnoStanje) => !trenutnoStanje,
                            );
                        }}
                        className="text-sm font-medium text-slate-600 underline hover:text-slate-900"
                    >
                        {prikaziDodatnePodatke
                            ? "Skrij e-pošto in naslov"
                            : "Dodaj e-pošto in naslov"}
                    </button>

                    {prikaziDodatnePodatke && (
                        <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <div>
                                <label
                                    htmlFor="emailNoveStranke"
                                    className="mb-1 block text-xs font-medium text-slate-700"
                                >
                                    E-poštni naslov
                                </label>

                                <input
                                    id="emailNoveStranke"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    className={inputClassName}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="naslovNoveStranke"
                                    className="mb-1 block text-xs font-medium text-slate-700"
                                >
                                    Naslov
                                </label>

                                <input
                                    id="naslovNoveStranke"
                                    name="hisniNaslov"
                                    type="text"
                                    autoComplete="street-address"
                                    className={inputClassName}
                                />
                            </div>
                        </div>
                    )}

                    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                        <input
                            name="davcniZavezanec"
                            type="checkbox"
                            checked={racunNaPodjetje}
                            onChange={(dogodek) => {
                                setRacunNaPodjetje(dogodek.target.checked);
                            }}
                            className="h-4 w-4 rounded border-slate-300"
                        />

                        Račun na podjetje
                    </label>

                    {racunNaPodjetje && (
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="nazivPodjetja"
                                    className="mb-1 block text-xs font-medium text-slate-700"
                                >
                                    Naziv podjetja *
                                </label>

                                <input
                                    id="nazivPodjetja"
                                    name="nazivPodjetja"
                                    type="text"
                                    required
                                    maxLength={200}
                                    className={inputClassName}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="davcnaNoveStranke"
                                    className="mb-1 block text-xs font-medium text-slate-700"
                                >
                                    Davčna številka *
                                </label>

                                <input
                                    id="davcnaNoveStranke"
                                    name="davcnaStevilka"
                                    type="text"
                                    required
                                    className={inputClassName}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2">
                        <GumbUstvariInIzberi />

                        <button
                            type="button"
                            onClick={() => setPrikaziUstvarjanje(false)}
                            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
                        >
                            Prekliči
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}