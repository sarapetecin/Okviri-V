"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
const optional = z.string().trim().max(255).transform(v => v || null);
const schema = z.object({ naziv: z.string().trim().min(1).max(255), kratica: optional, telefon: optional, email: z.string().trim().email().or(z.literal("")).transform(v => v || null), naslov: z.string().trim().max(500).transform(v => v || null), spletnaStran: optional });
export async function ustvariDobavitelja(formData: FormData) {
  const supabase = await createClient(); const { data: token, error: authError } = await supabase.auth.getClaims(); if (authError || !token?.claims?.sub) redirect("/prijava");
  const rezultat = schema.safeParse({ naziv: formData.get("naziv"), kratica: formData.get("kratica"), telefon: formData.get("telefon"), email: formData.get("email"), naslov: formData.get("naslov"), spletnaStran: formData.get("spletnaStran") });
  if (!rezultat.success) redirect("/materiali/dobavitelji/nov?napaka=neveljavni-podatki");
  const { error } = await supabase.from("dobavitelj").insert({ naziv: rezultat.data.naziv, kratica: rezultat.data.kratica, telefonska_stevilka: rezultat.data.telefon, email: rezultat.data.email, naslov: rezultat.data.naslov, spletna_stran: rezultat.data.spletnaStran });
  if (error) redirect("/materiali/dobavitelji/nov?napaka=shranjevanje");
  revalidatePath("/materiali"); revalidatePath("/materiali/dobavitelji"); redirect("/materiali/dobavitelji");
}
