import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { ustvariUporabnika } from "./actions";

type NovUporabnikPageProps = {
    searchParams: Promise<{
        napaka?: string;
    }>;
};

export default async function NovUporabnikPage({
    searchParams,
}: NovUporabnikPageProps) {
    const { napaka } = await searchParams;
    const supabase = await createClient();

    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    if (napakaZetona || !podatkiZetona?.claims?.sub) {
        redirect("/prijava");
    }

    const { data: jeAdministrator } =
        await supabase.rpc("je_administrator");

    if (!jeAdministrator) {
        redirect("/?napaka=ni-dovoljenja");
    }

    const sporociloNapake =
        napaka === "neveljavni-podatki"
            ? "Preveri vnesene podatke. Začasno geslo mora imeti najmanj 12 znakov, obe gesli pa se morata ujemati."
            : napaka === "uporabnisko-ime-obstaja"
                ? "To uporabniško ime že obstaja."
                : napaka === "email-obstaja"
                    ? "Račun s tem e-poštnim naslovom že obstaja."
                    : napaka === "ustvarjanje-profila"
                        ? "Uporabniškega profila ni bilo mogoče ustvariti."
                        : napaka === "ustvarjanje"
                            ? "Uporabniškega računa ni bilo mogoče ustvariti."
                            : null;

    const inputClassName =
        "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-slate-700 focus:ring-2 focus:ring-slate-200";

    return (
        <main className="min-h-screen bg-slate-100" >
            <header className="border-b border-slate-200 bg-white" >
                <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4" >
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500" >
                            Administracija · Uporabniki
                        </p>

                        < h1 className="text-xl font-bold text-slate-900" >
                            Nov uporabnik
                        </h1>
                    </div>

                    < Link
                        href="/uporabniki"
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        Prekliči
                    </Link>
                </div>
            </header>

            < section className="mx-auto max-w-4xl px-6 py-10" >
                <form
                    action={ustvariUporabnika}
                    className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
                >
                    <div className="mb-7" >
                        <h2 className="text-2xl font-bold text-slate-900" >
                            Podatki uporabnika
                        </h2>

                        < p className="mt-2 text-sm text-slate-600" >
                            Uporabnik bo moral ob prvi prijavi spremeniti
                            začasno geslo.
                        </p>
                    </div>

                    {
                        sporociloNapake && (
                            <div
                                role="alert"
                                className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                            >
                                {sporociloNapake}
                            </div>
                        )
                    }

                    <div className="grid gap-6 sm:grid-cols-2" >
                        <div>
                            <label
                                htmlFor="uporabniskoIme"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Uporabniško ime *
                            </label>

                            < input
                                id="uporabniskoIme"
                                name="uporabniskoIme"
                                type="text"
                                required
                                minLength={2}
                                maxLength={100}
                                autoFocus
                                autoComplete="off"
                                className={inputClassName}
                            />
                        </div>

                        < div >
                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                E - poštni naslov *
                            </label>

                            < input
                                id="email"
                                name="email"
                                type="email"
                                required
                                autoComplete="off"
                                className={inputClassName}
                            />
                        </div>

                        < div >
                            <label
                                htmlFor="geslo"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Začasno geslo *
                            </label>

                            < input
                                id="geslo"
                                name="geslo"
                                type="password"
                                required
                                minLength={12}
                                maxLength={200}
                                autoComplete="new-password"
                                className={inputClassName}
                            />

                            <p className="mt-2 text-xs text-slate-500" >
                                Uporabi najmanj 12 znakov.
                            </p>
                        </div>

                        < div >
                            <label
                                htmlFor="ponoviGeslo"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Ponovi začasno geslo *
                            </label>

                            < input
                                id="ponoviGeslo"
                                name="ponoviGeslo"
                                type="password"
                                required
                                minLength={12}
                                maxLength={200}
                                autoComplete="new-password"
                                className={inputClassName}
                            />
                        </div>

                        < div className="sm:col-span-2" >
                            <label
                                htmlFor="uporabniskePravice"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                Uporabniške pravice *
                            </label>

                            < select
                                id="uporabniskePravice"
                                name="uporabniskePravice"
                                defaultValue="zaposleni"
                                className={inputClassName}
                            >
                                <option value="zaposleni" >
                                    Zaposleni
                                </option>

                                < option value="partner" >
                                    Partner
                                </option>

                                < option value="administrator" >
                                    Administrator
                                </option>
                            </select>
                        </div>

                        < label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2" >
                            <input
                                name="aktiven"
                                type="checkbox"
                                defaultChecked
                                className="mt-0.5 h-4 w-4 rounded border-slate-300"
                            />

                            <span>
                                <span className="block text-sm font-semibold text-slate-900" >
                                    Račun je aktiven
                                </span>

                                < span className="mt-1 block text-sm text-slate-600" >
                                    Neaktiven uporabnik se ne more prijaviti v
                                    aplikacijo.
                                </span>
                            </span>
                        </label>
                    </div>

                    < div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800" >
                        Začasno geslo varno posreduj uporabniku.Po
                        ustvarjanju ga aplikacija ne bo več prikazala.
                    </div>

                    < div className="mt-8 flex justify-end gap-3 border-t border-slate-200 pt-6" >
                        <Link
                            href="/uporabniki"
                            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Prekliči
                        </Link>

                        < button
                            type="submit"
                            className="rounded-lg bg-slate-900 px-5 py-2.5 font-semibold text-white hover:bg-slate-700"
                        >
                            Ustvari uporabnika
                        </button>
                    </div>
                </form>
            </section>
        </main>
    );
}