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

const urediOkvirSchema = z.object({
    okvirId: z.number().int().positive(),
    vzorec: z.string().trim().min(1),
    oznaka: opcijskoBesedilo,
    barvaId: opcijskiId,
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

export async function urediOkvir(
    okvirId: number,
    formData: FormData,
) {
    const supabase = await createClient();

    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    if (napakaZetona || !podatkiZetona?.claims?.sub) {
        redirect("/prijava");
    }

    const rezultat = urediOkvirSchema.safeParse({
        okvirId,
        vzorec: formData.get("vzorec"),
        oznaka: formData.get("oznaka"),
        barvaId: formData.get("barvaId"),
        dobaviteljId: formData.get("dobaviteljId"),
        sirina: formData.get("sirina"),
        prodajnaCena: formData.get("prodajnaCena"),
        nabavnaCena: formData.get("nabavnaCena"),
        naProdaj: formData.get("naProdaj") === "on",
    });

    if (!rezultat.success) {
        console.error(
            "Neveljavni podatki okvirja:",
            rezultat.error.flatten(),
        );

        redirect(
            `/materiali/okvirji/${okvirId}/uredi?napaka=neveljavni-podatki`,
        );
    }

    const { data: obstojeciOkvir } = await supabase
        .from("okvir")
        .select("id")
        .eq("id", rezultat.data.okvirId)
        .maybeSingle();

    if (!obstojeciOkvir) {
        redirect("/materiali/okvirji");
    }

    const { error } = await supabase
        .from("okvir")
        .update({
            vzorec: rezultat.data.vzorec,
            oznaka: rezultat.data.oznaka,
            barva_id: rezultat.data.barvaId,
            dobavitelj_id: rezultat.data.dobaviteljId,
            sirina: rezultat.data.sirina,
            prodajna_cena: rezultat.data.prodajnaCena,
            nabavna_cena: rezultat.data.nabavnaCena,
            na_prodaj: rezultat.data.naProdaj,
        })
        .eq("id", obstojeciOkvir.id);

    if (error) {
        console.error("Napaka pri urejanju okvirja:", error);

        redirect(
            `/materiali/okvirji/${okvirId}/uredi?napaka=shranjevanje`,
        );
    }

    revalidatePath("/materiali");
    revalidatePath("/materiali/okvirji");
    revalidatePath(`/materiali/okvirji/${okvirId}/uredi`);

    redirect("/materiali/okvirji?uspeh=okvir-posodobljen");
}