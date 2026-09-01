"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const novDokumentSchema = z.object({
  vrsta: z.enum(["ponudba", "narocilo"]),

  strankaId: z.coerce
    .number()
    .int()
    .positive("Izberi stranko."),

  rokIzdelave: z
    .union([
      z.literal(""),
      z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    ])
    .transform((vrednost) => vrednost || null),

  popust: z.coerce
    .number()
    .min(0, "Popust ne sme biti manjši od 0.")
    .max(100, "Popust ne sme biti večji od 100."),
});

export async function ustvariDokument(formData: FormData) {
  const supabase = await createClient();

  const { data: podatkiZetona, error: napakaZetona } =
    await supabase.auth.getClaims();

  const authUserId = podatkiZetona?.claims?.sub;

  if (napakaZetona || !authUserId) {
    redirect("/prijava");
  }

  const rezultat = novDokumentSchema.safeParse({
    vrsta: formData.get("vrsta"),
    strankaId: formData.get("strankaId"),
    rokIzdelave: formData.get("rokIzdelave"),
    popust: formData.get("popust"),
  });

  if (!rezultat.success) {
    redirect("/dokumenti/nov?napaka=neveljavni-podatki");
  }

  const { data: stranka, error: napakaStranke } = await supabase
    .from("stranka")
    .select(
      "id, naziv, telefonska_stevilka, email, hisni_naslov, davcna_stevilka, davcni_zavezanec",
    )
    .eq("id", rezultat.data.strankaId)
    .single();

  if (napakaStranke || !stranka) {
    redirect("/dokumenti/nov?napaka=stranka-ne-obstaja");
  }

  const { data: uporabnik, error: napakaUporabnika } = await supabase
    .from("uporabnik")
    .select("id, uporabnisko_ime")
    .eq("auth_user_id", authUserId)
    .single();

  if (napakaUporabnika || !uporabnik) {
    redirect("/dokumenti/nov?napaka=uporabnik-ne-obstaja");
  }

  const { error } = await supabase.from("narocilo").insert({
    vrsta: rezultat.data.vrsta,
    status: "osnutek",
    stranka_id: stranka.id,
    stranka_naziv: stranka.naziv,
    stranka_telefonska_stevilka: stranka.telefonska_stevilka,
    stranka_email: stranka.email,
    stranka_hisni_naslov: stranka.hisni_naslov,
    stranka_davcna_stevilka: stranka.davcna_stevilka,
    stranka_davcni_zavezanec: stranka.davcni_zavezanec,
    rok_izdelave: rezultat.data.rokIzdelave,
    popust: rezultat.data.popust,
    izdal_uporabnik_id: uporabnik.id,
    izdal_ime: uporabnik.uporabnisko_ime,
  });

  if (error) {
    console.error("Napaka pri ustvarjanju dokumenta:", error);
    redirect("/dokumenti/nov?napaka=shranjevanje");
  }

  revalidatePath("/dokumenti");
  redirect("/dokumenti?uspeh=dokument-ustvarjen");
}