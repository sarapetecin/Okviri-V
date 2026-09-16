import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Obrazec } from "../../nov/page";
import { urediBarvo } from "./actions";
type Props = { params: Promise<{ barvaId: string }>; searchParams: Promise<{ napaka?: string }> };
export default async function UrediBarvoPage({ params, searchParams }: Props) {
  const id = Number((await params).barvaId); if (!Number.isInteger(id) || id <= 0) notFound();
  const supabase = await createClient(); const { data: token, error: authError } = await supabase.auth.getClaims();
  if (authError || !token?.claims?.sub) redirect("/prijava");
  const { data: barva, error } = await supabase.from("barva").select("id, naziv").eq("id", id).maybeSingle(); if (error || !barva) notFound();
  const { napaka } = await searchParams; const sporocilo = napaka === "ze-obstaja" ? "Barva s tem nazivom že obstaja." : napaka ? "Sprememb ni bilo mogoče shraniti." : null;
  return <Obrazec naslov="Uredi barvo" opis="Spremeni naziv barve." action={urediBarvo.bind(null, id)} sporocilo={sporocilo} naziv={barva.naziv}/>;
}
