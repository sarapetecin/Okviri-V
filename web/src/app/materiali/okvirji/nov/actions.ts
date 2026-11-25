"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const opcijskoBesedilo = z
  .string()
  .trim()
  .transform((vrednost) => vrednost || null);

const opcijskoStevilo = z.preprocess(
  (vrednost) =>
    typeof vrednost === "string" && vrednost.trim() === ""
      ? null
      : vrednost,
  z.coerce.number().nonnegative().nullable(),
);

const opcijskiId = z.preprocess(
  (vrednost) =>
    typeof vrednost === "string" && vrednost.trim() === ""
      ? null
      : vrednost,
  z.coerce.number().int().positive().nullable(),
);

const novOkvirSchema = z.object({
  vzorec: z.string().trim().min(1, "Vzorec je obvezen."),
  serijskaStevilka: opcijskoBesedilo,
  nazivBarve: opcijskoBesedilo,
  dobaviteljId: opcijskiId,

  sirina: z.preprocess(
    (vrednost) =>
      typeof vrednost === "string" && vrednost.trim() === ""
        ? null
        : vrednost,
    z.coerce.number().positive().nullable(),
  ),

  prodajnaCena: z.coerce.number().nonnegative(),
  nabavnaCena: opcijskoStevilo,
  naProdaj: z.boolean(),
});

export async function ustvariOkvir(formData: FormData) {
  const supabase = await createClient();

  const { data: podatkiZetona, error: napakaZetona } =
    await supabase.auth.getClaims();

  if (napakaZetona || !podatkiZetona?.claims?.sub) {
    redirect("/prijava");
  }

  const rezultat = novOkvirSchema.safeParse({
    vzorec: formData.get("vzorec"),
    serijskaStevilka: formData.get("serijskaStevilka"),
    nazivBarve: formData.get("nazivBarve"),
    dobaviteljId: formData.get("dobaviteljId"),
    sirina: formData.get("sirina"),
    prodajnaCena: formData.get("prodajnaCena"),
    nabavnaCena: formData.get("nabavnaCena"),
    naProdaj: formData.get("naProdaj") === "on",
  });

  if (!rezultat.success) {
    console.error(
      "Neveljavni podatki novega okvirja:",
      rezultat.error.flatten(),
    );

    redirect(
      "/materiali/okvirji/nov?napaka=neveljavni-podatki",
    );
  }

  const { error } = await supabase.from("okvir").insert({
    vzorec: rezultat.data.vzorec,
    serijska_stevilka: rezultat.data.serijskaStevilka,
    naziv_barve: rezultat.data.nazivBarve,
    dobavitelj_id: rezultat.data.dobaviteljId,
    sirina: rezultat.data.sirina,
    prodajna_cena: rezultat.data.prodajnaCena,
    nabavna_cena: rezultat.data.nabavnaCena,
    na_prodaj: rezultat.data.naProdaj,
  });

  if (error) {
    console.error("Napaka pri ustvarjanju okvirja:", error);

    redirect("/materiali/okvirji/nov?napaka=shranjevanje");
  }

  revalidatePath("/materiali");
  revalidatePath("/materiali/okvirji");
  revalidatePath("/dokumenti");

  redirect("/materiali/okvirji?uspeh=okvir-ustvarjen");
}