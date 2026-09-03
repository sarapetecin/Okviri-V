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
    oznaka: z.string().trim().max(100).transform((v) => v || null),
    barva: z.string().trim().max(100).transform((v) => v || null),
    dodatniOpis: z.string().trim().max(500).transform((v) => v || null),

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
        oznaka: formData.get("oznaka"),
        barva: formData.get("barva"),
        dodatniOpis: formData.get("dodatniOpis"),
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
            oznaka: rezultat.data.oznaka,
            barva: rezultat.data.barva,
            dodatni_opis: rezultat.data.dodatniOpis,
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