"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const praznoVNull = z
  .string()
  .trim()
  .transform((vrednost) => vrednost || null);

const novaStrankaSchema = z.object({
  naziv: z
    .string()
    .trim()
    .min(1, "Naziv stranke je obvezen.")
    .max(200, "Naziv stranke je predolg."),

  telefonskaStevilka: praznoVNull,

  email: z
    .union([
      z.literal(""),
      z.string().trim().email("E-poštni naslov ni veljaven."),
    ])
    .transform((vrednost) => vrednost || null),

  hisniNaslov: praznoVNull,
  davcnaStevilka: praznoVNull,
  davcniZavezanec: z.boolean(),
});

export async function ustvariStranko(formData: FormData) {
  const supabase = await createClient();

  const { data: podatkiZetona, error: napakaZetona } =
    await supabase.auth.getClaims();

  if (napakaZetona || !podatkiZetona?.claims?.sub) {
    redirect("/prijava");
  }

  const rezultat = novaStrankaSchema.safeParse({
    naziv: formData.get("naziv"),
    telefonskaStevilka: formData.get("telefonskaStevilka"),
    email: formData.get("email"),
    hisniNaslov: formData.get("hisniNaslov"),
    davcnaStevilka: formData.get("davcnaStevilka"),
    davcniZavezanec: formData.get("davcniZavezanec") === "on",
  });

  if (!rezultat.success) {
    redirect("/stranke/nova?napaka=neveljavni-podatki");
  }

  const { error } = await supabase.from("stranka").insert({
    naziv: rezultat.data.naziv,
    telefonska_stevilka: rezultat.data.telefonskaStevilka,
    email: rezultat.data.email,
    hisni_naslov: rezultat.data.hisniNaslov,
    davcna_stevilka: rezultat.data.davcnaStevilka,
    davcni_zavezanec: rezultat.data.davcniZavezanec,
  });

  if (error) {
    console.error("Napaka pri ustvarjanju stranke:", error);
    redirect("/stranke/nova?napaka=shranjevanje");
  }

  revalidatePath("/stranke");
  redirect("/stranke?uspeh=stranka-ustvarjena");
}