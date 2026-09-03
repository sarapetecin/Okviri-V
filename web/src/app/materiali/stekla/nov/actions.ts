"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const praznoVNull = (vrednost: unknown) =>
    vrednost === "" || vrednost === null ? null : vrednost;

const novoStekloSchema = z.object({
    oznaka: z
        .string()
        .trim()
        .min(1, "Oznaka je obvezna.")
        .max(100),

    naziv: z
        .string()
        .trim()
        .min(1, "Naziv je obvezen.")
        .max(200),

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

export async function ustvariSteklo(formData: FormData) {
    const supabase = await createClient();

    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    if (napakaZetona || !podatkiZetona?.claims?.sub) {
        redirect("/prijava");
    }

    const rezultat = novoStekloSchema.safeParse({
        oznaka: formData.get("oznaka"),
        naziv: formData.get("naziv"),
        dobaviteljId: formData.get("dobaviteljId"),
        prodajnaCena: formData.get("prodajnaCena"),
        nabavnaCena: formData.get("nabavnaCena"),
        naProdaj: formData.get("naProdaj") === "on",
    });

    if (!rezultat.success) {
        redirect(
            "/materiali/stekla/novo?napaka=neveljavni-podatki",
        );
    }

    const { error } = await supabase.from("steklo").insert({
        oznaka: rezultat.data.oznaka,
        naziv: rezultat.data.naziv,
        dobavitelj_id: rezultat.data.dobaviteljId,
        prodajna_cena: rezultat.data.prodajnaCena,
        nabavna_cena: rezultat.data.nabavnaCena,
        na_prodaj: rezultat.data.naProdaj,
    });

    if (error) {
        console.error("Napaka pri ustvarjanju stekla:", error);

        redirect("/materiali/stekla/novo?napaka=shranjevanje");
    }

    revalidatePath("/materiali");
    revalidatePath("/materiali/stekla");

    redirect("/materiali/stekla");
}