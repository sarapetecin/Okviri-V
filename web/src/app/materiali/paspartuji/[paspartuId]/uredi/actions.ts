"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const praznoVNull = (vrednost: unknown) =>
    vrednost === "" || vrednost === null ? null : vrednost;

const urediPaspartuSchema = z.object({
    paspartuId: z.coerce.number().int().positive(),
    naziv: z.string().trim().min(1, "Naziv je obvezen.").max(200),
    barva: z.string().trim().transform((v) => v || null),
    sirina: z.preprocess(praznoVNull, z.coerce.number().positive().nullable()),
    dolzina: z.preprocess(praznoVNull, z.coerce.number().positive().nullable()),

    dobaviteljId: z.preprocess(
        praznoVNull,
        z.coerce.number().int().positive().nullable(),
    ),

    prodajnaCena: z.coerce.number().min(0),
    nabavnaCena: z.preprocess(
        praznoVNull,
        z.coerce.number().min(0).nullable(),
    ),

    naProdaj: z.boolean(),
});

export async function urediPaspartu(
    paspartuId: number,
    formData: FormData,
) {
    const supabase = await createClient();

    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    if (napakaZetona || !podatkiZetona?.claims?.sub) {
        redirect("/prijava");
    }

    const rezultat = urediPaspartuSchema.safeParse({
        paspartuId,
        naziv: formData.get("naziv"),
        barva: formData.get("barva"),
        sirina: formData.get("sirina"),
        dolzina: formData.get("dolzina"),
        dobaviteljId: formData.get("dobaviteljId"),
        prodajnaCena: formData.get("prodajnaCena"),
        nabavnaCena: formData.get("nabavnaCena"),
        naProdaj: formData.get("naProdaj") === "on",
    });

    if (!rezultat.success) {
        redirect(
            `/materiali/paspartuji/${paspartuId}/uredi?napaka=neveljavni-podatki`,
        );
    }

    const { error } = await supabase
        .from("paspartu")
        .update({
            naziv: rezultat.data.naziv,
            barva: rezultat.data.barva,
            sirina: rezultat.data.sirina,
            dolzina: rezultat.data.dolzina,
            dobavitelj_id: rezultat.data.dobaviteljId,
            prodajna_cena: rezultat.data.prodajnaCena,
            nabavna_cena: rezultat.data.nabavnaCena,
            na_prodaj: rezultat.data.naProdaj,
        })
        .eq("id", rezultat.data.paspartuId);

    if (error) {
        console.error("Napaka pri urejanju paspartuja:", error);

        redirect(
            `/materiali/paspartuji/${paspartuId}/uredi?napaka=shranjevanje`,
        );
    }

    revalidatePath("/materiali");
    revalidatePath("/materiali/paspartuji");
    revalidatePath(`/materiali/paspartuji/${paspartuId}/uredi`);

    redirect("/materiali/paspartuji");
}