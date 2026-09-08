"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const spremembaGeslaSchema = z
    .object({
        novoGeslo: z
            .string()
            .min(12, "Geslo mora imeti najmanj 12 znakov.")
            .max(200),

        ponoviGeslo: z.string(),
    })
    .refine(
        (podatki) =>
            podatki.novoGeslo === podatki.ponoviGeslo,
        {
            message: "Gesli se ne ujemata.",
            path: ["ponoviGeslo"],
        },
    );

export async function spremeniPrvoGeslo(
    formData: FormData,
) {
    const supabase = await createClient();

    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    if (napakaZetona || !podatkiZetona?.claims?.sub) {
        redirect("/prijava");
    }

    const rezultat = spremembaGeslaSchema.safeParse({
        novoGeslo: formData.get("novoGeslo"),
        ponoviGeslo: formData.get("ponoviGeslo"),
    });

    if (!rezultat.success) {
        redirect(
            "/spremeni-geslo?napaka=neveljavni-podatki",
        );
    }

    const { error: napakaGesla } =
        await supabase.auth.updateUser({
            password: rezultat.data.novoGeslo,
        });

    if (napakaGesla) {
        console.error(
            "Napaka pri spremembi gesla:",
            napakaGesla,
        );

        redirect(
            "/spremeni-geslo?napaka=sprememba-gesla",
        );
    }

    const { error: napakaZakljucka } = await supabase.rpc(
        "zakljuci_prvo_spremembo_gesla",
    );

    if (napakaZakljucka) {
        console.error(
            "Napaka pri zaključku spremembe gesla:",
            napakaZakljucka,
        );

        redirect(
            "/spremeni-geslo?napaka=zakljucek",
        );
    }

    redirect("/");
}