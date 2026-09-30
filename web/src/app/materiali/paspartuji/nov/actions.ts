"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const praznoStevilo = (vrednost: unknown) => {
    if (
        vrednost === "" ||
        vrednost === null ||
        vrednost === undefined
    ) {
        return null;
    }

    return vrednost;
};

const prazenNiz = (vrednost: unknown) => {
    if (
        vrednost === "" ||
        vrednost === null ||
        vrednost === undefined
    ) {
        return null;
    }

    return vrednost;
};

const novPaspartuSchema = z.object({
    naziv: z
        .string()
        .trim()
        .min(1, "Naziv je obvezen.")
        .max(200),

    barva: z.preprocess(
        prazenNiz,
        z.string().trim().max(100).nullable(),
    ),

    dodatniOpis: z.preprocess(
        prazenNiz,
        z.string().trim().max(500).nullable(),
    ),

    prodajnaCena: z.coerce
        .number()
        .min(0, "Prodajna cena ne sme biti negativna."),

    nabavnaCena: z.preprocess(
        praznoStevilo,
        z.coerce
            .number()
            .min(0, "Nabavna cena ne sme biti negativna.")
            .nullable(),
    ),

    dobaviteljId: z.preprocess(
        praznoStevilo,
        z.coerce.number().int().positive().nullable(),
    ),

    naProdaj: z.boolean(),
});

export async function ustvariPaspartu(formData: FormData) {
    const supabase = await createClient();

    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    if (napakaZetona || !podatkiZetona?.claims?.sub) {
        redirect("/prijava");
    }

    const rezultat = novPaspartuSchema.safeParse({
        naziv: formData.get("naziv"),
        barva: formData.get("barva"),
        dodatniOpis: formData.get("dodatniOpis"),
        prodajnaCena: formData.get("prodajnaCena"),
        nabavnaCena: formData.get("nabavnaCena"),
        dobaviteljId: formData.get("dobaviteljId"),
        naProdaj: formData.get("naProdaj") === "on",
    });

    if (!rezultat.success) {
        console.error(
            "Neveljavni podatki paspartuja:",
            rezultat.error.flatten(),
        );

        redirect(
            "/materiali/paspartuji/novo?napaka=neveljavni-podatki",
        );
    }

    const { error } = await supabase.from("paspartu").insert({
        naziv: rezultat.data.naziv,
        barva: rezultat.data.barva,
        dodatni_opis: rezultat.data.dodatniOpis,
        prodajna_cena: rezultat.data.prodajnaCena,
        nabavna_cena: rezultat.data.nabavnaCena,
        dobavitelj_id: rezultat.data.dobaviteljId,
        na_prodaj: rezultat.data.naProdaj,
    });

    if (error) {
        console.error(
            "Napaka pri ustvarjanju paspartuja:",
            error,
        );

        redirect(
            "/materiali/paspartuji/novo?napaka=shranjevanje",
        );
    }

    revalidatePath("/materiali");
    revalidatePath("/materiali/paspartuji");

    redirect("/materiali/paspartuji");
}