"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

type KlikabilnaVrsticaProps = {
    href: string;
    oznaka: string;
    children: ReactNode;
};

export function KlikabilnaVrstica({
    href,
    oznaka,
    children,
}: KlikabilnaVrsticaProps) {
    const router = useRouter();

    function odpriDokument() {
        router.push(href);
    }

    return (
        <tr
            role="link"
            tabIndex={0}
            aria-label={oznaka}
            onClick={odpriDokument}
            onKeyDown={(dogodek) => {
                if (
                    dogodek.key === "Enter" ||
                    dogodek.key === " "
                ) {
                    dogodek.preventDefault();
                    odpriDokument();
                }
            }}
            className="cursor-pointer transition hover:bg-blue-50 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
        >
            {children}
        </tr>
    );
}