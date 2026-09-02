"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const odstraniOkvirSchema = z.object({
    dokumentId: z.number().int().positive(),
    postavkaId: z.number().int().positive(),
    postavkaOkvirId: z.number().int().positive(),
});

export async function odstraniOkvir(
    dokumentId: number,
    postavkaId: number,
    postavkaOkvirId: number,
    formData: FormData,
) {
    void formData;

    const supabase = await createClient();

    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    if (napakaZetona || !podatkiZetona?.claims?.sub) {
        redirect("/prijava");
    }

    const rezultat = odstraniOkvirSchema.safeParse({
        dokumentId,
        postavkaId,
        postavkaOkvirId,
    });

    if (!rezultat.success) {
        redirect(`/dokumenti/${dokumentId}?napaka=neveljavni-podatki`);
    }

    const { data: postavka } = await supabase
        .from("narocilo_postavka")
        .select("id")
        .eq("id", rezultat.data.postavkaId)
        .eq("narocilo_id", rezultat.data.dokumentId)
        .maybeSingle();

    if (!postavka) {
        redirect(`/dokumenti/${dokumentId}?napaka=postavka-ne-obstaja`);
    }

    const { data: povezavaOkvirja } = await supabase
        .from("postavka_okvir")
        .select("id")
        .eq("id", rezultat.data.postavkaOkvirId)
        .eq("postavka_id", postavka.id)
        .maybeSingle();

    if (!povezavaOkvirja) {
        redirect(`/dokumenti/${dokumentId}?napaka=okvir-ne-obstaja`);
    }

    const { error } = await supabase.rpc("odstrani_okvir_postavke", {
        p_postavka_okvir_id: povezavaOkvirja.id,
    });

    if (error) {
        console.error("Napaka pri odstranjevanju okvirja:", error);
        redirect(`/dokumenti/${dokumentId}?napaka=odstranjevanje-okvirja`);
    }

    revalidatePath(`/dokumenti/${dokumentId}`);
    redirect(`/dokumenti/${dokumentId}`);
}
const odstraniStekloSchema = z.object({
    dokumentId: z.number().int().positive(),
    postavkaId: z.number().int().positive(),
    postavkaStekloId: z.number().int().positive(),
});

export async function odstraniSteklo(
    dokumentId: number,
    postavkaId: number,
    postavkaStekloId: number,
    formData: FormData,
) {
    void formData;

    const supabase = await createClient();

    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    if (napakaZetona || !podatkiZetona?.claims?.sub) {
        redirect("/prijava");
    }

    const rezultat = odstraniStekloSchema.safeParse({
        dokumentId,
        postavkaId,
        postavkaStekloId,
    });

    if (!rezultat.success) {
        redirect(`/dokumenti/${dokumentId}?napaka=neveljavni-podatki`);
    }

    const { data: postavka } = await supabase
        .from("narocilo_postavka")
        .select("id")
        .eq("id", rezultat.data.postavkaId)
        .eq("narocilo_id", rezultat.data.dokumentId)
        .maybeSingle();

    if (!postavka) {
        redirect(`/dokumenti/${dokumentId}?napaka=postavka-ne-obstaja`);
    }

    const { data: povezavaStekla } = await supabase
        .from("postavka_steklo")
        .select("id")
        .eq("id", rezultat.data.postavkaStekloId)
        .eq("postavka_id", postavka.id)
        .maybeSingle();

    if (!povezavaStekla) {
        redirect(`/dokumenti/${dokumentId}?napaka=steklo-ne-obstaja`);
    }

    const { error } = await supabase.rpc("odstrani_steklo_postavke", {
        p_postavka_steklo_id: povezavaStekla.id,
    });

    if (error) {
        console.error("Napaka pri odstranjevanju stekla:", error);
        redirect(`/dokumenti/${dokumentId}?napaka=odstranjevanje-stekla`);
    }

    revalidatePath(`/dokumenti/${dokumentId}`);
    redirect(`/dokumenti/${dokumentId}`);
}
const odstraniPaspartuSchema = z.object({
    dokumentId: z.number().int().positive(),
    postavkaId: z.number().int().positive(),
    postavkaPaspartuId: z.number().int().positive(),
});

export async function odstraniPaspartu(
    dokumentId: number,
    postavkaId: number,
    postavkaPaspartuId: number,
    formData: FormData,
) {
    void formData;

    const supabase = await createClient();

    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    if (napakaZetona || !podatkiZetona?.claims?.sub) {
        redirect("/prijava");
    }

    const rezultat = odstraniPaspartuSchema.safeParse({
        dokumentId,
        postavkaId,
        postavkaPaspartuId,
    });

    if (!rezultat.success) {
        redirect(`/dokumenti/${dokumentId}?napaka=neveljavni-podatki`);
    }

    const { data: postavka } = await supabase
        .from("narocilo_postavka")
        .select("id")
        .eq("id", rezultat.data.postavkaId)
        .eq("narocilo_id", rezultat.data.dokumentId)
        .maybeSingle();

    if (!postavka) {
        redirect(`/dokumenti/${dokumentId}?napaka=postavka-ne-obstaja`);
    }

    const { data: povezavaPaspartuja } = await supabase
        .from("postavka_paspartu")
        .select("id")
        .eq("id", rezultat.data.postavkaPaspartuId)
        .eq("postavka_id", postavka.id)
        .maybeSingle();

    if (!povezavaPaspartuja) {
        redirect(`/dokumenti/${dokumentId}?napaka=paspartu-ne-obstaja`);
    }

    const { error } = await supabase.rpc("odstrani_paspartu_postavke", {
        p_postavka_paspartu_id: povezavaPaspartuja.id,
    });

    if (error) {
        console.error("Napaka pri odstranjevanju paspartuja:", error);

        redirect(
            `/dokumenti/${dokumentId}?napaka=odstranjevanje-paspartuja`,
        );
    }

    revalidatePath(`/dokumenti/${dokumentId}`);
    redirect(`/dokumenti/${dokumentId}`);
}
const odstraniPodokvirSchema = z.object({
    dokumentId: z.number().int().positive(),
    postavkaId: z.number().int().positive(),
    postavkaPodokvirId: z.number().int().positive(),
});

const dodajPodokvirSchema = z.object({
    dokumentId: z.number().int().positive(),
    postavkaId: z.number().int().positive(),
});

export async function dodajPodokvir(
    dokumentId: number,
    postavkaId: number,
    formData: FormData,
) {
    void formData;

    const supabase = await createClient();

    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    if (napakaZetona || !podatkiZetona?.claims?.sub) {
        redirect("/prijava");
    }

    const rezultat = dodajPodokvirSchema.safeParse({
        dokumentId,
        postavkaId,
    });

    if (!rezultat.success) {
        redirect(
            `/dokumenti/${dokumentId}?napaka=neveljavni-podatki`,
        );
    }

    const { data: postavka } = await supabase
        .from("narocilo_postavka")
        .select("id")
        .eq("id", rezultat.data.postavkaId)
        .eq("narocilo_id", rezultat.data.dokumentId)
        .maybeSingle();

    if (!postavka) {
        redirect(
            `/dokumenti/${dokumentId}?napaka=postavka-ne-obstaja`,
        );
    }

    const { error } = await supabase.rpc(
        "dodaj_podokvir_postavki",
        {
            p_postavka_id: postavka.id,
        },
    );

    if (error) {
        console.error("Napaka pri dodajanju podokvirja:", error);

        const napaka = error.message.includes(
            "že ima dodan podokvir",
        )
            ? "podokvir-ze-obstaja"
            : error.message.includes("ni primernega podokvirja")
                ? "podokvir-ni-na-voljo"
                : "dodajanje-podokvirja";

        redirect(`/dokumenti/${dokumentId}?napaka=${napaka}`);
    }

    revalidatePath(`/dokumenti/${dokumentId}`);
    redirect(`/dokumenti/${dokumentId}`);
}

export async function odstraniPodokvir(
    dokumentId: number,
    postavkaId: number,
    postavkaPodokvirId: number,
    formData: FormData,
) {
    void formData;

    const supabase = await createClient();

    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    if (napakaZetona || !podatkiZetona?.claims?.sub) {
        redirect("/prijava");
    }

    const rezultat = odstraniPodokvirSchema.safeParse({
        dokumentId,
        postavkaId,
        postavkaPodokvirId,
    });

    if (!rezultat.success) {
        redirect(`/dokumenti/${dokumentId}?napaka=neveljavni-podatki`);
    }

    const { data: postavka } = await supabase
        .from("narocilo_postavka")
        .select("id")
        .eq("id", rezultat.data.postavkaId)
        .eq("narocilo_id", rezultat.data.dokumentId)
        .maybeSingle();

    if (!postavka) {
        redirect(`/dokumenti/${dokumentId}?napaka=postavka-ne-obstaja`);
    }

    const { data: povezava } = await supabase
        .from("postavka_podokvir")
        .select("id")
        .eq("id", rezultat.data.postavkaPodokvirId)
        .eq("postavka_id", postavka.id)
        .maybeSingle();

    if (!povezava) {
        redirect(`/dokumenti/${dokumentId}?napaka=podokvir-ne-obstaja`);
    }

    const { error } = await supabase.rpc(
        "odstrani_podokvir_postavke",
        {
            p_postavka_podokvir_id: povezava.id,
        },
    );

    if (error) {
        console.error("Napaka pri odstranjevanju podokvirja:", error);

        redirect(
            `/dokumenti/${dokumentId}?napaka=odstranjevanje-podokvirja`,
        );
    }

    revalidatePath(`/dokumenti/${dokumentId}`);
    redirect(`/dokumenti/${dokumentId}`);
}
const odstraniDodatnoDeloSchema = z.object({
    dokumentId: z.number().int().positive(),
    postavkaId: z.number().int().positive(),
    postavkaDodatnoDeloId: z.number().int().positive(),
});

export async function odstraniDodatnoDelo(
    dokumentId: number,
    postavkaId: number,
    postavkaDodatnoDeloId: number,
    formData: FormData,
) {
    void formData;

    const supabase = await createClient();

    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    if (napakaZetona || !podatkiZetona?.claims?.sub) {
        redirect("/prijava");
    }

    const rezultat = odstraniDodatnoDeloSchema.safeParse({
        dokumentId,
        postavkaId,
        postavkaDodatnoDeloId,
    });

    if (!rezultat.success) {
        redirect(
            `/dokumenti/${dokumentId}?napaka=neveljavni-podatki`,
        );
    }

    const { data: postavka } = await supabase
        .from("narocilo_postavka")
        .select("id")
        .eq("id", rezultat.data.postavkaId)
        .eq("narocilo_id", rezultat.data.dokumentId)
        .maybeSingle();

    if (!postavka) {
        redirect(
            `/dokumenti/${dokumentId}?napaka=postavka-ne-obstaja`,
        );
    }

    const { data: povezava } = await supabase
        .from("postavka_dodatno_delo")
        .select("id")
        .eq("id", rezultat.data.postavkaDodatnoDeloId)
        .eq("postavka_id", postavka.id)
        .maybeSingle();

    if (!povezava) {
        redirect(
            `/dokumenti/${dokumentId}?napaka=dodatno-delo-ne-obstaja`,
        );
    }

    const { error } = await supabase.rpc(
        "odstrani_dodatno_delo_postavke",
        {
            p_postavka_dodatno_delo_id: povezava.id,
        },
    );

    if (error) {
        console.error(
            "Napaka pri odstranjevanju dodatnega dela:",
            error,
        );

        redirect(
            `/dokumenti/${dokumentId}?napaka=odstranjevanje-dodatnega-dela`,
        );
    }

    revalidatePath(`/dokumenti/${dokumentId}`);
    redirect(`/dokumenti/${dokumentId}`);
}
const spremeniStatusSchema = z.object({
    dokumentId: z.number().int().positive(),
    noviStatus: z.enum([
        "osnutek",
        "poslano_v_pregled",
        "zavrnjeno",
        "potrjeno",
        "v_izdelavi",
        "dokoncano",
        "rocno_zaprto",
        "preklicano",
    ]),
});

export async function spremeniStatusDokumenta(
    dokumentId: number,
    formData: FormData,
) {
    const supabase = await createClient();

    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    if (napakaZetona || !podatkiZetona?.claims?.sub) {
        redirect("/prijava");
    }

    const rezultat = spremeniStatusSchema.safeParse({
        dokumentId,
        noviStatus: formData.get("noviStatus"),
    });

    if (!rezultat.success) {
        redirect(
            `/dokumenti/${dokumentId}?napaka=neveljaven-status`,
        );
    }

    const { data: dokument } = await supabase
        .from("narocilo")
        .select("id")
        .eq("id", rezultat.data.dokumentId)
        .maybeSingle();

    if (!dokument) {
        redirect("/dokumenti");
    }

    const { error } = await supabase.rpc(
        "spremeni_status_dokumenta",
        {
            p_narocilo_id: dokument.id,
            p_novi_status: rezultat.data.noviStatus,
        },
    );

    if (error) {
        console.error("Napaka pri spremembi statusa:", error);

        redirect(
            `/dokumenti/${dokumentId}?napaka=sprememba-statusa`,
        );
    }

    revalidatePath("/dokumenti");
    revalidatePath(`/dokumenti/${dokumentId}`);

    redirect(
        `/dokumenti/${dokumentId}?uspeh=status-spremenjen`,
    );
}