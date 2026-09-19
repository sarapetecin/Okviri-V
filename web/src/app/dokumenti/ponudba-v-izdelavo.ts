"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const schema = z.object({
    dokumentId: z.number().int().positive(),
});

export async function ponudbaVIzdelavo(
    dokumentId: number,
) {
    const supabase = await createClient();

    const {
        data: podatkiZetona,
        error: napakaZetona,
    } = await supabase.auth.getClaims();

    const authUserId =
        podatkiZetona?.claims?.sub;

    if (napakaZetona || !authUserId) {
        redirect("/prijava");
    }

    const rezultat = schema.safeParse({
        dokumentId,
    });

    if (!rezultat.success) {
        redirect(
            "/dokumenti?vrsta=ponudba&napaka=neveljavni-podatki",
        );
    }

    const {
        data: uporabnik,
        error: napakaUporabnika,
    } = await supabase
        .from("uporabnik")
        .select(
            "uporabniske_pravice, aktiven, mora_spremeniti_geslo",
        )
        .eq("auth_user_id", authUserId)
        .maybeSingle();

    const jeInterniUporabnik =
        uporabnik?.uporabniske_pravice ===
        "administrator" ||
        uporabnik?.uporabniske_pravice ===
        "zaposleni";

    if (
        napakaUporabnika ||
        !uporabnik ||
        !uporabnik.aktiven ||
        uporabnik.mora_spremeniti_geslo ||
        !jeInterniUporabnik
    ) {
        redirect(
            "/dokumenti?vrsta=ponudba&napaka=ni-dovoljenja",
        );
    }

    const trenutek = new Date().toISOString();

    const { data: dokument, error } =
        await supabase
            .from("narocilo")
            .update({
                vrsta: "narocilo",
                status: "v_izdelavi",
                ponudba_potrjena_at: trenutek,
                posodobljeno_at: trenutek,
            })
            .eq("id", rezultat.data.dokumentId)
            .eq("vrsta", "ponudba")
            .select("id")
            .maybeSingle();

    if (error || !dokument) {
        console.error(
            "Napaka pri pretvorbi ponudbe:",
            error,
        );

        redirect(
            "/dokumenti?vrsta=ponudba&napaka=sprememba-statusa",
        );
    }

    revalidatePath("/");
    revalidatePath("/dokumenti");
    revalidatePath(
        `/dokumenti/${dokument.id}`,
    );

    return;
}