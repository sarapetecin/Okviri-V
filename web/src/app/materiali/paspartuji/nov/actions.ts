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

const novPaspartuSchema = z.object({
    naziv: z.string().trim().min(1),
    oznaka: opcijskoBesedilo,
    barva: opcijskoBesedilo,
    dodatniOpis: opcijskoBesedilo,
    dobaviteljId: opcijskiId,
    prodajnaCena: z.coerce.number().nonnegative(),
    nabavnaCena: opcijskoStevilo,
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
        oznaka: formData.get("oznaka"),
        barva: formData.get("barva"),
        dodatniOpis: formData.get("dodatniOpis"),
        dobaviteljId: formData.get("dobaviteljId"),
        prodajnaCena: formData.get("prodajnaCena"),
        nabavnaCena: formData.get("nabavnaCena"),
        naProdaj: formData.get("naProdaj") === "on",
    });

    if (!rezultat.success) {
        console.error(
            "Neveljavni podatki paspartuja:",
            rezultat.error.flatten(),
        );

        redirect(
            "/materiali/paspartuji/nov?napaka=neveljavni-podatki",
        );
    }

    const { error } = await supabase.from("paspartu").insert({
        naziv: rezultat.data.naziv,
        oznaka: rezultat.data.oznaka,
        barva: rezultat.data.barva,
        dodatni_opis: rezultat.data.dodatniOpis,
        dobavitelj_id: rezultat.data.dobaviteljId,
        prodajna_cena: rezultat.data.prodajnaCena,
        nabavna_cena: rezultat.data.nabavnaCena,
        na_prodaj: rezultat.data.naProdaj,
    });

    if (error) {
        console.error("Napaka pri ustvarjanju paspartuja:", error);

        redirect(
            "/materiali/paspartuji/nov?napaka=shranjevanje",
        );
    }

    revalidatePath("/materiali");
    revalidatePath("/materiali/paspartuji");

    redirect(
        "/materiali/paspartuji?uspeh=paspartu-ustvarjen",
    );
}