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

    const authUserId = podatkiZetona?.claims?.sub;

    if (napakaZetona || !authUserId) {
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

    const { data: uporabnik, error: napakaUporabnika } =
        await supabase
            .from("uporabnik")
            .select(
                "id, uporabniske_pravice, aktiven, mora_spremeniti_geslo",
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

    const { data: dokument, error: napakaDokumenta } =
        await supabase
            .from("narocilo")
            .select(
                "id, vrsta, status, izdal_uporabnik_id",
            )
            .eq("id", rezultat.data.dokumentId)
            .maybeSingle();

    if (napakaDokumenta || !dokument) {
        redirect("/dokumenti");
    }

    const jePartner =
        uporabnik.uporabniske_pravice === "partner";

    if (jePartner) {
        const jeLastnaPonudba =
            dokument.vrsta === "ponudba" &&
            dokument.izdal_uporabnik_id === uporabnik.id;

        const partnerLahkoPoslje =
            jeLastnaPonudba &&
            (
                dokument.status === "osnutek" ||
                dokument.status === "zavrnjeno"
            ) &&
            rezultat.data.noviStatus === "poslano_v_pregled";

        const partnerLahkoUmakne =
            jeLastnaPonudba &&
            dokument.status === "poslano_v_pregled" &&
            rezultat.data.noviStatus === "osnutek";

        if (!partnerLahkoPoslje && !partnerLahkoUmakne) {
            redirect(
                `/dokumenti/${dokumentId}?napaka=ni-dovoljenja`,
            );
        }
    } else {
        const jeInterniUporabnik =
            uporabnik.uporabniske_pravice === "administrator" ||
            uporabnik.uporabniske_pravice === "zaposleni";

        if (!jeInterniUporabnik) {
            redirect("/");
        }
    }

    const { error } =
        jePartner &&
            rezultat.data.noviStatus === "osnutek"
            ? await supabase.rpc(
                "partner_umakni_ponudbo_iz_pregleda",
                {
                    p_narocilo_id: dokument.id,
                },
            )
            : await supabase.rpc(
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

const spremeniPlacanoSchema = z.object({
    dokumentId: z.number().int().positive(),
});

export async function spremeniPlacano(
    dokumentId: number,
    formData: FormData,
) {
    const supabase = await createClient();

    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    const authUserId = podatkiZetona?.claims?.sub;

    if (napakaZetona || !authUserId) {
        redirect("/prijava");
    }

    const rezultat = spremeniPlacanoSchema.safeParse({
        dokumentId,
    });

    if (!rezultat.success) {
        redirect(
            `/dokumenti/${dokumentId}?napaka=neveljavni-podatki`,
        );
    }

    const { data: uporabnik, error: napakaUporabnika } =
        await supabase
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
        uporabnik.uporabniske_pravice === "administrator" ||
        uporabnik.uporabniske_pravice === "zaposleni";

    if (!jeInterniUporabnik) {
        redirect(
            `/dokumenti/${dokumentId}?napaka=ni-dovoljenja`,
        );
    }

    const placano = formData.get("placano") === "on";

    const { error } = await supabase
        .from("narocilo")
        .update({ placano })
        .eq("id", rezultat.data.dokumentId)

    if (error) {
        console.error(
            "Napaka pri spremembi plačila:",
            error,
        );

        redirect(
            `/dokumenti/${dokumentId}?napaka=sprememba-placila`,
        );
    }

    revalidatePath("/dokumenti");
    revalidatePath(`/dokumenti/${dokumentId}`);
}
const spremeniPopustSchema = z.object({
    dokumentId: z.number().int().positive(),
    popust: z.number().min(0).max(100),
});

export async function spremeniPopust(
    dokumentId: number,
    formData: FormData,
) {
    const supabase = await createClient();

    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    const authUserId = podatkiZetona?.claims?.sub;

    if (napakaZetona || !authUserId) {
        redirect("/prijava");
    }

    const rezultat = spremeniPopustSchema.safeParse({
        dokumentId,
        popust: Number(formData.get("popust")),
    });

    if (!rezultat.success) {
        redirect(
            `/dokumenti/${dokumentId}?napaka=neveljaven-popust`,
        );
    }

    const { data: uporabnik, error: napakaUporabnika } =
        await supabase
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
        uporabnik.uporabniske_pravice === "administrator" ||
        uporabnik.uporabniske_pravice === "zaposleni";

    if (!jeInterniUporabnik) {
        redirect(
            `/dokumenti/${dokumentId}?napaka=ni-dovoljenja`,
        );
    }

    const { error: napakaPopusta } = await supabase
        .from("narocilo")
        .update({
            popust: rezultat.data.popust,
        })
        .eq("id", rezultat.data.dokumentId)

    if (napakaPopusta) {
        console.error(
            "Napaka pri shranjevanju popusta:",
            napakaPopusta,
        );

        redirect(
            `/dokumenti/${dokumentId}?napaka=sprememba-popusta`,
        );
    }

    const { error: napakaIzracuna } = await supabase.rpc(
        "osvezi_skupni_znesek_dokumenta",
        {
            p_narocilo_id: rezultat.data.dokumentId,
        },
    );

    if (napakaIzracuna) {
        console.error(
            "Napaka pri preračunu skupnega zneska:",
            napakaIzracuna,
        );

        redirect(
            `/dokumenti/${dokumentId}?napaka=izracun-zneska`,
        );
    }

    revalidatePath("/dokumenti");
    revalidatePath(`/dokumenti/${dokumentId}`);
}
async function preveriPravicoZaStranko(
    dokumentId: number,
) {
    const supabase = await createClient();

    const { data: podatkiZetona, error: napakaZetona } =
        await supabase.auth.getClaims();

    const authUserId = podatkiZetona?.claims?.sub;

    if (napakaZetona || !authUserId) {
        redirect("/prijava");
    }

    const { data: uporabnik, error: napakaUporabnika } =
        await supabase
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
        uporabnik.uporabniske_pravice === "administrator" ||
        uporabnik.uporabniske_pravice === "zaposleni";

    if (!jeInterniUporabnik) {
        redirect(
            `/dokumenti/${dokumentId}?napaka=ni-dovoljenja`,
        );
    }

    return supabase;
}

async function nastaviStrankoNaDokument(
    dokumentId: number,
    stranka: {
        id: number;
        naziv: string;
        telefonska_stevilka: string | null;
        email: string | null;
        hisni_naslov: string | null;
        naziv_podjetja: string | null;
        davcna_stevilka: string | null;
        davcni_zavezanec: boolean;
    },
) {
    const supabase =
        await preveriPravicoZaStranko(dokumentId);

    const { error } = await supabase
        .from("narocilo")
        .update({
            stranka_id: stranka.id,
            stranka_naziv: stranka.naziv,
            stranka_telefonska_stevilka:
                stranka.telefonska_stevilka,
            stranka_email: stranka.email,
            stranka_hisni_naslov: stranka.hisni_naslov,
            stranka_naziv_podjetja:
                stranka.naziv_podjetja,
            stranka_davcna_stevilka:
                stranka.davcna_stevilka,
            stranka_davcni_zavezanec:
                stranka.davcni_zavezanec,
        })
        .eq("id", dokumentId)

    if (error) {
        console.error(
            "Napaka pri nastavitvi stranke:",
            error,
        );

        redirect(
            `/dokumenti/${dokumentId}?napaka=sprememba-stranke`,
        );
    }
}

const izbiraStrankeSchema = z.object({
    dokumentId: z.number().int().positive(),
    strankaIzbira: z.string().trim().min(1),
});

export async function spremeniStranko(
    dokumentId: number,
    formData: FormData,
) {
    const rezultat = izbiraStrankeSchema.safeParse({
        dokumentId,
        strankaIzbira: formData.get("strankaIzbira"),
    });

    if (!rezultat.success) {
        redirect(
            `/dokumenti/${dokumentId}?napaka=neveljavna-stranka`,
        );
    }

    const najdenId =
        rezultat.data.strankaIzbira.match(/^(\d+)\s*\|/);

    const strankaId = najdenId
        ? Number(najdenId[1])
        : Number.NaN;

    if (!Number.isInteger(strankaId) || strankaId <= 0) {
        redirect(
            `/dokumenti/${dokumentId}?napaka=izberi-stranko-iz-seznama`,
        );
    }

    const supabase =
        await preveriPravicoZaStranko(dokumentId);

    const { data: stranka, error } = await supabase
        .from("stranka")
        .select(
            "id, naziv, naziv_podjetja, telefonska_stevilka, email, hisni_naslov, davcna_stevilka, davcni_zavezanec",
        )
        .eq("id", strankaId)
        .maybeSingle();

    if (error || !stranka) {
        redirect(
            `/dokumenti/${dokumentId}?napaka=stranka-ne-obstaja`,
        );
    }

    await nastaviStrankoNaDokument(
        dokumentId,
        stranka,
    );

    revalidatePath("/dokumenti");
    revalidatePath(`/dokumenti/${dokumentId}`);
}

const novaStrankaNarocilaSchema = z
    .object({
        dokumentId: z.number().int().positive(),

        naziv: z
            .string()
            .trim()
            .min(1)
            .max(200),

        telefonskaStevilka: z.string().trim(),

        email: z.union([
            z.literal(""),
            z.string().trim().email(),
        ]),

        hisniNaslov: z.string().trim(),

        davcniZavezanec: z.boolean(),

        nazivPodjetja: z.string().trim().max(200),

        davcnaStevilka: z.string().trim(),
    })
    .superRefine((podatki, kontekst) => {
        if (
            podatki.davcniZavezanec &&
            !podatki.nazivPodjetja
        ) {
            kontekst.addIssue({
                code: "custom",
                path: ["nazivPodjetja"],
                message: "Naziv podjetja je obvezen.",
            });
        }

        if (
            podatki.davcniZavezanec &&
            !podatki.davcnaStevilka
        ) {
            kontekst.addIssue({
                code: "custom",
                path: ["davcnaStevilka"],
                message: "Davčna številka je obvezna.",
            });
        }
    });

export async function ustvariInNastaviStranko(
    dokumentId: number,
    formData: FormData,
) {
    const rezultat =
        novaStrankaNarocilaSchema.safeParse({
            dokumentId,
            naziv: formData.get("naziv"),
            telefonskaStevilka:
                formData.get("telefonskaStevilka") ?? "",
            email: formData.get("email") ?? "",
            hisniNaslov:
                formData.get("hisniNaslov") ?? "",
            davcniZavezanec:
                formData.get("davcniZavezanec") === "on",
            nazivPodjetja:
                formData.get("nazivPodjetja") ?? "",
            davcnaStevilka:
                formData.get("davcnaStevilka") ?? "",
        });

    if (!rezultat.success) {
        redirect(
            `/dokumenti/${dokumentId}?napaka=neveljavni-podatki-stranke`,
        );
    }

    const supabase =
        await preveriPravicoZaStranko(dokumentId);

    const { data: novaStranka, error } = await supabase
        .from("stranka")
        .insert({
            naziv: rezultat.data.naziv,
            telefonska_stevilka:
                rezultat.data.telefonskaStevilka || null,
            email: rezultat.data.email || null,
            hisni_naslov:
                rezultat.data.hisniNaslov || null,
            naziv_podjetja:
                rezultat.data.davcniZavezanec
                    ? rezultat.data.nazivPodjetja
                    : null,
            davcna_stevilka:
                rezultat.data.davcniZavezanec
                    ? rezultat.data.davcnaStevilka
                    : null,
            davcni_zavezanec:
                rezultat.data.davcniZavezanec,
        })
        .select(
            "id, naziv, naziv_podjetja, telefonska_stevilka, email, hisni_naslov, davcna_stevilka, davcni_zavezanec",
        )
        .single();

    if (error || !novaStranka) {
        console.error(
            "Napaka pri ustvarjanju stranke:",
            error,
        );

        redirect(
            `/dokumenti/${dokumentId}?napaka=ustvarjanje-stranke`,
        );
    }

    await nastaviStrankoNaDokument(
        dokumentId,
        novaStranka,
    );

    revalidatePath("/stranke");
    revalidatePath("/dokumenti");
    revalidatePath(`/dokumenti/${dokumentId}`);
}
const spremeniSalonSchema = z.object({
    dokumentId: z.number().int().positive(),
    salonPrevzema: z.enum([
        "ljubljana",
        "bevke",
    ]),
});

export async function spremeniSalonPrevzema(
    dokumentId: number,
    formData: FormData,
) {
    const rezultat = spremeniSalonSchema.safeParse({
        dokumentId,
        salonPrevzema:
            formData.get("salonPrevzema"),
    });

    if (!rezultat.success) {
        redirect(
            `/dokumenti/${dokumentId}?napaka=neveljaven-salon`,
        );
    }

    const supabase =
        await preveriPravicoZaStranko(dokumentId);

    const { error } = await supabase
        .from("narocilo")
        .update({
            salon_prevzema:
                rezultat.data.salonPrevzema,
        })
        .eq("id", rezultat.data.dokumentId)

    if (error) {
        console.error(
            "Napaka pri spremembi salona prevzema:",
            error,
        );

        redirect(
            `/dokumenti/${dokumentId}?napaka=sprememba-salona`,
        );
    }

    revalidatePath("/dokumenti");
    revalidatePath(`/dokumenti/${dokumentId}`);
}

const spremeniRokIzdelaveSchema = z.object({
    dokumentId: z.number().int().positive(),

    rokIzdelave: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/),

    potrdiPreseganje: z.boolean(),
});

export async function spremeniRokIzdelave(
    dokumentId: number,
    formData: FormData,
) {
    const rezultat =
        spremeniRokIzdelaveSchema.safeParse({
            dokumentId,
            rokIzdelave:
                formData.get("rokIzdelave"),

            potrdiPreseganje:
                formData.get("potrdiPreseganje") ===
                "da",
        });

    if (!rezultat.success) {
        redirect(
            `/dokumenti/${dokumentId}?napaka=neveljaven-rok`,
        );
    }

    const supabase =
        await preveriPravicoZaStranko(dokumentId);

    const { data: trenutnePostavke } =
        await supabase
            .from("narocilo_postavka")
            .select("kolicina")
            .eq("narocilo_id", dokumentId);

    const steviloSlikNarocila =
        trenutnePostavke?.reduce(
            (vsota, postavka) =>
                vsota + postavka.kolicina,
            0,
        ) ?? 0;

    const { data: drugaNarocila } =
        await supabase
            .from("narocilo")
            .select(`
        id,
        narocilo_postavka (
          kolicina
        )
      `)
            .eq(
                "rok_izdelave",
                rezultat.data.rokIzdelave,
            )
            .neq("status", "preklicano")
            .neq("id", dokumentId);

    const trenutnaZasedenost =
        drugaNarocila?.reduce(
            (vsotaNarocil, narocilo) =>
                vsotaNarocil +
                narocilo.narocilo_postavka.reduce(
                    (vsotaPostavk, postavka) =>
                        vsotaPostavk +
                        postavka.kolicina,
                    0,
                ),
            0,
        ) ?? 0;

    const skupnoPoShranitvi =
        trenutnaZasedenost +
        steviloSlikNarocila;

    if (
        skupnoPoShranitvi > 80 &&
        !rezultat.data.potrdiPreseganje
    ) {
        redirect(
            `/dokumenti/${dokumentId}?napaka=rok-presega-zmogljivost`,
        );
    }

    const { error } = await supabase
        .from("narocilo")
        .update({
            rok_izdelave:
                rezultat.data.rokIzdelave,
        })
        .eq("id", dokumentId)

    if (error) {
        console.error(
            "Napaka pri spremembi roka:",
            error,
        );

        redirect(
            `/dokumenti/${dokumentId}?napaka=sprememba-roka`,
        );
    }

    revalidatePath("/dokumenti");
    revalidatePath(`/dokumenti/${dokumentId}`);
    revalidatePath(
        `/dokumenti/${dokumentId}/natisni`,
    );
}