"use client";

import type {
    KeyboardEvent,
    ReactNode,
} from "react";

type FormularZEnterNavigacijoProps = {
    action: (
        formData: FormData,
    ) => void | Promise<void>;
    children: ReactNode;
    className?: string;
};

export function FormularZEnterNavigacijo({
    action,
    children,
    className,
}: FormularZEnterNavigacijoProps) {
    function obPritiskuTipke(
        dogodek: KeyboardEvent<HTMLFormElement>,
    ) {
        if (
            dogodek.key !== "Enter" ||
            dogodek.shiftKey
        ) {
            return;
        }

        const trenutnoPolje = dogodek.target;

        if (
            !(trenutnoPolje instanceof HTMLElement)
        ) {
            return;
        }

        /*
         * V textarea Enter ohrani običajno obnašanje
         * in naredi novo vrstico.
         */
        if (
            trenutnoPolje instanceof
            HTMLTextAreaElement
        ) {
            return;
        }

        /*
         * Enter na gumbu lahko še vedno sproži gumb.
         */
        if (
            trenutnoPolje instanceof
            HTMLButtonElement
        ) {
            return;
        }

        dogodek.preventDefault();

        const obrazec = dogodek.currentTarget;

        const polja = Array.from(
            obrazec.querySelectorAll<HTMLElement>(
                [
                    'input:not([type="hidden"])',
                    'input:not([type="submit"])',
                    "select",
                    "textarea",
                ].join(","),
            ),
        ).filter((polje) => {
            if (
                polje instanceof HTMLInputElement
            ) {
                return (
                    !polje.disabled &&
                    polje.type !== "hidden" &&
                    polje.type !== "submit" &&
                    polje.type !== "button" &&
                    polje.type !== "checkbox" &&
                    polje.type !== "radio"
                );
            }

            if (
                polje instanceof HTMLSelectElement ||
                polje instanceof HTMLTextAreaElement
            ) {
                return !polje.disabled;
            }

            return false;
        });

        const trenutniIndeks =
            polja.indexOf(trenutnoPolje);

        const naslednjePolje =
            polja[trenutniIndeks + 1];

        if (naslednjePolje) {
            naslednjePolje.focus();

            if (
                naslednjePolje instanceof
                HTMLInputElement
            ) {
                naslednjePolje.select();
            }
        }
    }

    return (
        <form
            action={action}
            className={className}
            onKeyDown={obPritiskuTipke}
        >
            {children}
        </form>
    );
}