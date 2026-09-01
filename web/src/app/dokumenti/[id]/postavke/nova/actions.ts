"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const novaPostavkaSchema = z.object({
  dokumentId: z.coerce.number().int().positive(),

  kolicina: z.coerce
    .number()
    .int()
    .min(1, "Količina mora biti najmanj 1.")
    .max(100),

  dolzina: z.coerce
    .number()
    .positive("Dolžina mora biti večja od 0.")
    .max(10000),

  sirina: z.coerce
    .number()
    .positive("Širina mora biti večja od 0.")
    .max(10000),

  opisSlike: z
    .string()
    .trim()
    .transform((vrednost) => vrednost || null),

  opombe: z
    .string()
    .trim()
    .transform((vrednost) => vrednost || null),

  ogledalo: z.boolean(),
});

export async function ustvariPostavko(
  dokumentId: number,
  formData: FormData,
) {
  const supabase = await createClient();

  const { data: podatkiZetona, error: napakaZetona } =
    await supabase.auth.getClaims();

  if (napakaZetona || !podatkiZetona?.claims?.sub) {
    redirect("/prijava");
  }

  const rezultat = novaPostavkaSchema.safeParse({
    dokumentId,
    kolicina: formData.get("kolicina"),
    dolzina: formData.get("dolzina"),
    sirina: formData.get("sirina"),
    opisSlike: formData.get("opisSlike"),
    opombe: formData.get("opombe"),
    ogledalo: formData.get("ogledalo") === "on",
  });

  if (!rezultat.success) {
    redirect(
      `/dokumenti/${dokumentId}/postavke/nova?napaka=neveljavni-podatki`,
    );
  }

  const { data: dokument } = await supabase
    .from("narocilo")
    .select("id")
    .eq("id", rezultat.data.dokumentId)
    .maybeSingle();

  if (!dokument) {
    redirect("/dokumenti");
  }

  const { data: zadnjaPostavka } = await supabase
    .from("narocilo_postavka")
    .select("vrstni_red")
    .eq("narocilo_id", dokument.id)
    .order("vrstni_red", { ascending: false })
    .limit(1)
    .maybeSingle();

  const naslednjiVrstniRed =
    (zadnjaPostavka?.vrstni_red ?? 0) + 1;

  const { error } = await supabase
    .from("narocilo_postavka")
    .insert({
      narocilo_id: dokument.id,
      kolicina: rezultat.data.kolicina,
      dolzina: rezultat.data.dolzina,
      sirina: rezultat.data.sirina,
      opis_slike: rezultat.data.opisSlike,
      opombe: rezultat.data.opombe,
      ogledalo: rezultat.data.ogledalo,
      cena_postavke: 0,
      vrstni_red: naslednjiVrstniRed,
    });

  if (error) {
    console.error("Napaka pri ustvarjanju postavke:", error);

    redirect(
      `/dokumenti/${dokumentId}/postavke/nova?napaka=shranjevanje`,
    );
  }

  revalidatePath(`/dokumenti/${dokumentId}`);
  redirect(`/dokumenti/${dokumentId}`);
}