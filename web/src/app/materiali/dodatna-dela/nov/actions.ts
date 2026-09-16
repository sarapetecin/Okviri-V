"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
const stevilo = z.preprocess(v => typeof v === "string" && v.trim() === "" ? null : v, z.coerce.number().nonnegative().nullable());
const schema = z.object({ naziv: z.string().trim().min(1).max(255), cena: stevilo, cenaNaM: stevilo, cenaNaM2: stevilo, naProdaj: z.boolean() });
export async function ustvariDodatnoDelo(formData: FormData) { const supabase = await createClient(); const { data: token, error: authError } = await supabase.auth.getClaims(); if (authError || !token?.claims?.sub) redirect("/prijava"); const rezultat = schema.safeParse({ naziv: formData.get("naziv"), cena: formData.get("cena"), cenaNaM: formData.get("cenaNaM"), cenaNaM2: formData.get("cenaNaM2"), naProdaj: formData.get("naProdaj") === "on" }); if (!rezultat.success) redirect("/materiali/dodatna-dela/nov?napaka=neveljavni-podatki"); const { error } = await supabase.from("dodatna_dela").insert({ naziv: rezultat.data.naziv, cena: rezultat.data.cena, cena_na_m: rezultat.data.cenaNaM, cena_na_m2: rezultat.data.cenaNaM2, na_prodaj: rezultat.data.naProdaj }); if (error) redirect(`/materiali/dodatna-dela/nov?napaka=${error.code === "23505" ? "ze-obstaja" : "shranjevanje"}`); revalidatePath("/materiali"); revalidatePath("/materiali/dodatna-dela"); redirect("/materiali/dodatna-dela"); }
