"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

const ACCENT = "#2f6bff";
const BROWN = "#5e5642";

const FIELD =
    "mt-1.5 block w-full rounded-full border border-black/10 bg-white px-5 py-3 text-[16px] font-medium normal-case tracking-normal text-[#0d0d0d] outline-none transition placeholder:text-black/30 focus:border-[#2f6bff] focus:ring-4 focus:ring-[#2f6bff]/15 sm:text-[14px]";

function Eye({ off }: { off: boolean }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
            <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z" />
            <circle cx="12" cy="12" r="3" />
            {off && <path d="M4 4l16 16" />}
        </svg>
    );
}

export function EmailField() {
    return (
        <label className="block text-[12px] font-extrabold uppercase tracking-[0.1em]" style={{ color: BROWN }}>
            Email
            <input name="email" type="email" required autoComplete="email" inputMode="email" placeholder="nama@email.com" className={FIELD} />
        </label>
    );
}

export function PasswordField() {
    const [show, setShow] = useState(false);
    return (
        <label className="block text-[12px] font-extrabold uppercase tracking-[0.1em]" style={{ color: BROWN }}>
            Kata sandi
            <span className="relative block">
                <input
                    name="password"
                    type={show ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="Masukkan kata sandi"
                    className={`${FIELD} pr-12`}
                />
                <button
                    type="button"
                    onClick={() => setShow((v) => !v)}
                    aria-label={show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                    aria-pressed={show}
                    className="absolute right-2 top-1/2 mt-[3px] grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-black/50 transition-colors hover:bg-black/[0.06] hover:text-black"
                >
                    <Eye off={show} />
                </button>
            </span>
        </label>
    );
}

export function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="lg-shine inline-flex w-full items-center justify-center gap-2.5 rounded-full px-7 py-3.5 text-[13px] font-bold text-white shadow-[0_12px_26px_-8px_rgba(47,107,255,.7)] transition duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f6bff] disabled:cursor-wait disabled:opacity-80 disabled:hover:translate-y-0"
            style={{ background: ACCENT }}
        >
            {pending && <span aria-hidden className="lg-spin h-4 w-4 rounded-full border-2 border-white/40 border-t-white" />}
            {pending ? "Memproses…" : "Masuk"}
        </button>
    );
}