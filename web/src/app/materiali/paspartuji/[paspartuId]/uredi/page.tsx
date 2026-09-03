import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { urediPaspartu } from "./actions";

type Props = {
    params: Promise<{
        paspartuId: string;
    }>;
    searchParams: Promise<{
        napaka?: string;
    }>;
};

export default async function UrediPaspartuPage({
    params,
    searchParams,
}: Props) {
    const { paspartuId: paspartuIdBesedilo } = await params;
    const { napaka } = await searchParams;

    const paspartuId = Number(paspartuIdBesedilo);

    if (!Number.isInteger(paspartuId) || paspartuId <= 0) {
        notFound();
    }

    const supabase = await createClient();

    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    if (napakaZetona || !podatkiZetona?.claims?.sub) {
        redirect("/prijava");
    }

    const [
        { data: paspartu, error: napakaPaspartuja },
        { data: dobavitelji, error: napakaDobaviteljev },
    ] = await Promise.all([
        supabase
            .from("paspartu")
            .select(
                `
          id,
          naziv,
          oznaka,
          barva,
          dodatni_opis,
          dobavitelj_id,
          prodajna_cena,
          nabavna_cena,
          na_prodaj
        `,
            )
            .eq("id", paspartuId)
            .maybeSingle(),

        supabase
            .from("dobavitelj")
            .select("id, naziv")
            .order("naziv"),
    ]);

    if (napakaPaspartuja || !paspartu) {
        notFound();
    }

    const shraniPaspartu = urediPaspartu.bind(null, paspartu.id);

    return (
        <main className="min-h-screen bg-slate-100">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                            Materiali
                        </p>

                        <h1 className="text-xl font-bold text-slate-900">
                            Uredi paspartu
                        </h1>
                    </div>

                    <Link
                        href="/materiali/paspartuji"
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        Nazaj
                    </Link>
                </div>
            </header>

            <section className="mx-auto max-w-4xl px-6 py-10">
                {napaka && (
                    <div
                        role="alert"
                        className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700"
                    >
                        {napaka === "neveljavni-podatki"
                            ? "Preveri vnesene podatke."
                            : "Paspartuja ni bilo mogoče shraniti."}
                    </div>
                )}

                {napakaDobaviteljev && (
                    <div
                        role="alert"
                        className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-800"
                    >
                        Dobaviteljev ni bilo mogoče naložiti.
                    </div>
                )}

                <form
                    action={shraniPaspartu}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                    <div className="grid gap-6 sm:grid-cols-2">
                        <label className="block">
                            <span className="text-sm font-semibold text-slate-700">
                                Naziv *
                            </span>

                            <input
                                name="naziv"
                                required
                                maxLength={200}
                                defaultValue={paspartu.naziv}
                                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                            />
                        </label>

                        <label className="block">
                            <span className="text-sm font-semibold text-slate-700">
                                Oznaka
                            </span>

                            <input
                                name="oznaka"
                                maxLength={100}
                                defaultValue={paspartu.oznaka ?? ""}
                                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                            />
                        </label>

                        <label className="block">
                            <span className="text-sm font-semibold text-slate-700">
                                Barva
                            </span>

                            <input
                                name="barva"
                                maxLength={100}
                                defaultValue={paspartu.barva ?? ""}
                                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                            />
                        </label>

                        <label className="block">
                            <span className="text-sm font-semibold text-slate-700">
                                Dobavitelj
                            </span>

                            <select
                                name="dobaviteljId"
                                defaultValue={paspartu.dobavitelj_id?.toString() ?? ""}
                                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900"
                            >
                                <option value="">Brez dobavitelja</option>

                                {(dobavitelji ?? []).map((dobavitelj) => (
                                    <option
                                        key={dobavitelj.id}
                                        value={dobavitelj.id}
                                    >
                                        {dobavitelj.naziv}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="block">
                            <span className="text-sm font-semibold text-slate-700">
                                Prodajna cena na m² *
                            </span>

                            <input
                                name="prodajnaCena"
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                defaultValue={paspartu.prodajna_cena}
                                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                            />
                        </label>

                        <label className="block">
                            <span className="text-sm font-semibold text-slate-700">
                                Nabavna cena
                            </span>

                            <input
                                name="nabavnaCena"
                                type="number"
                                min="0"
                                step="0.01"
                                defaultValue={paspartu.nabavna_cena ?? ""}
                                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                            />
                        </label>

                        <label className="block sm:col-span-2">
                            <span className="text-sm font-semibold text-slate-700">
                                Dodatni opis
                            </span>

                            <textarea
                                name="dodatniOpis"
                                rows={4}
                                maxLength={500}
                                defaultValue={paspartu.dodatni_opis ?? ""}
                                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                            />
                        </label>
                    </div>

                    <label className="mt-6 flex items-center gap-3">
                        <input
                            name="naProdaj"
                            type="checkbox"
                            defaultChecked={paspartu.na_prodaj}
                            className="h-4 w-4 rounded border-slate-300"
                        />

                        <span className="text-sm font-medium text-slate-700">
                            Paspartu je na prodaj
                        </span>
                    </label>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <button
                            type="submit"
                            className="rounded-lg bg-slate-900 px-5 py-2.5 font-semibold text-white hover:bg-slate-700"
                        >
                            Shrani spremembe
                        </button>

                        <Link
                            href="/materiali/paspartuji"
                            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            Prekliči
                        </Link>
                    </div>
                </form>
            </section>
        </main>
    );
}