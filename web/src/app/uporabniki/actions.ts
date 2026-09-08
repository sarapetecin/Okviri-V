"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const spremembaUporabnikaSchema = z.object({
    authUserId: z.string().uuid(),
    uporabniskePravice: z.enum([
        "administrator",
        "zaposleni",
        "partner",
    ]),
    aktiven: z.boolean(),
});

export async function posodobiUporabnika(
    authUserId: string,
    formData: FormData,
) {
    const supabase = await createClient();

    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    if (napakaZetona || !podatkiZetona?.claims?.sub) {
        redirect("/prijava");
    }

    const rezultat = spremembaUporabnikaSchema.safeParse({
        authUserId,
        uporabniskePravice: formData.get(
            "uporabniskePravice",
        ),
        aktiven: formData.get("aktiven") === "on",
    });

    if (!rezultat.success) {
        redirect("/uporabniki?napaka=neveljavni-podatki");
    }

    const { error } = await supabase.rpc(
        "admin_posodobi_uporabnika",
        {
            p_auth_user_id: rezultat.data.authUserId,
            p_uporabniske_pravice:
                rezultat.data.uporabniskePravice,
            p_aktiven: rezultat.data.aktiven,
        },
    );

    if (error) {
        console.error(
            "Napaka pri posodobitvi uporabnika:",
            error,
        );

        const sporocilo = error.message.toLowerCase();

        if (
            sporocilo.includes("svojega administratorskega")
        ) {
            redirect("/uporabniki?napaka=lastni-racun");
        }

        if (
            sporocilo.includes("zadnjega aktivnega administratorja")
        ) {
            redirect("/uporabniki?napaka=zadnji-administrator");
        }

        if (error.code === "42501") {
            redirect("/uporabniki?napaka=ni-dovoljenja");
        }

        redirect("/uporabniki?napaka=shranjevanje");
    }

    revalidatePath("/uporabniki");
    redirect("/uporabniki?uspeh=posodobljeno");
}