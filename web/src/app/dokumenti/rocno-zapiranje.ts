"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const schema = z.object({
    dokumentIds: z
        .array(z.number().int().positive())
        .min(1)
        .max(200),
});

export async function rocnoZapriDokumente(
    dokumentIds: number[],
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
        dokumentIds: Array.from(
            new Set(dokumentIds),
        ),
    });

    if (!rezultat.success) {
        redirect(
            "/dokumenti?napaka=neveljavni-podatki",
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

    if (
        napakaUporabnika ||
        !uporabnik ||
        !uporabnik.aktiven ||
        uporabnik.mora_spremeniti_geslo
    ) {
        redirect("/");
    }

    const jeInterniUporabnik =
        uporabnik.uporabniske_pravice ===
        "administrator" ||
        uporabnik.uporabniske_pravice ===
        "zaposleni";

    if (!jeInterniUporabnik) {
        redirect(
            "/dokumenti?napaka=ni-dovoljenja",
        );
    }

    const { data: narocila, error } =
        await supabase
            .from("narocilo")
            .select("id")
            .in(
                "id",
                rezultat.data.dokumentIds,
            )
            .eq("vrsta", "narocilo")
            .eq("status", "v_izdelavi");

    if (error) {
        console.error(
            "Napaka pri pridobivanju naročil:",
            error,
        );

        redirect(
            "/dokumenti?napaka=rocno-zapiranje",
        );
    }

    for (const narocilo of narocila ?? []) {
        const { error: napakaZapiranja } =
            await supabase.rpc(
                "spremeni_status_dokumenta",
                {
                    p_narocilo_id: narocilo.id,
                    p_novi_status:
                        "rocno_zaprto",
                },
            );

        if (napakaZapiranja) {
            console.error(
                `Napaka pri ročnem zapiranju naročila ${narocilo.id}:`,
                napakaZapiranja,
            );

            redirect(
                "/dokumenti?napaka=rocno-zapiranje",
            );
        }

        revalidatePath(
            `/dokumenti/${narocilo.id}`,
        );
    }

    revalidatePath("/");
    revalidatePath("/dokumenti");

    redirect(
        "/dokumenti?vrsta=narocilo&uspeh=rocno-zaprto",
    );
}