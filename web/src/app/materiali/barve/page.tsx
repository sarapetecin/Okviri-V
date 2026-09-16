import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type Props = { searchParams: Promise<{ iskanje?: string }> };

export default async function BarvePage({ searchParams }: Props) {
  const { iskanje = "" } = await searchParams;
  const supabase = await createClient();
  const { data: token, error: napakaTokena } = await supabase.auth.getClaims();
  if (napakaTokena || !token?.claims?.sub) redirect("/prijava");

  let poizvedba = supabase.from("barva").select("id, naziv").order("naziv");
  if (iskanje.trim()) poizvedba = poizvedba.ilike("naziv", `%${iskanje.trim()}%`);
  const { data: barve, error } = await poizvedba;

  return <main className="min-h-screen bg-slate-100">
    <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4"><div><p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Materiali</p><h1 className="text-xl font-bold text-slate-900">Barve</h1></div><Link href="/materiali" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700">Nazaj na katalog</Link></div></header>
    <section className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-7 flex items-end justify-between gap-4"><div><h2 className="text-3xl font-bold text-slate-900">Pregled barv</h2><p className="mt-2 text-slate-600">V katalogu je {barve?.length ?? 0} barv.</p></div><Link href="/materiali/barve/nov" className="rounded-lg bg-slate-900 px-5 py-2.5 font-semibold text-white">Dodaj barvo</Link></div>
      <form className="mb-6 flex gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><input name="iskanje" defaultValue={iskanje} placeholder="Poišči po nazivu" className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900"/><button className="rounded-lg bg-slate-900 px-5 py-2.5 font-semibold text-white">Poišči</button>{iskanje && <Link href="/materiali/barve" className="rounded-lg border border-slate-300 px-5 py-2.5 text-slate-700">Počisti</Link>}</form>
      {error ? <p className="rounded-xl bg-red-50 p-4 text-red-700">Barv ni bilo mogoče naložiti.</p> : <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><table className="w-full text-left"><thead className="bg-slate-50"><tr><th className="px-5 py-3 text-sm text-slate-700">Naziv</th><th className="px-5 py-3 text-right text-sm text-slate-700">Dejanja</th></tr></thead><tbody className="divide-y divide-slate-200">{(barve ?? []).map(barva => <tr key={barva.id}><td className="px-5 py-4 font-medium text-slate-900">{barva.naziv}</td><td className="px-5 py-4 text-right"><Link href={`/materiali/barve/${barva.id}/uredi`} className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700">Uredi</Link></td></tr>)}</tbody></table></div>}
    </section>
  </main>;
}
