"use client";

import { useState } from "react";

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
                    <form action={actionIzberi} className="space-y-2">
                        <div>
                            <label
                                htmlFor="strankaIzbira"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Poišči drugo stranko
                            </label>

                            <input
                                id="strankaIzbira"
                                name="strankaIzbira"
                                type="text"
                                list="seznam-strank"
                                placeholder="Vpiši naziv ali telefon"
                                required
                                autoComplete="off"
                                className={inputClassName}
                            />

                            <datalist id="seznam-strank">
                                {stranke.map((stranka) => (
                                    <option
                                        key={stranka.id}
                                        value={`${stranka.id} | ${stranka.naziv}`}
                                    >
                                        {stranka.telefonska_stevilka ??
                                            "Brez telefona"}
                                    </option>
                                ))}
                            </datalist>
                        </div>

                        <button
                            type="submit"
                            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                        >
                            Izberi stranko
                        </button>
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