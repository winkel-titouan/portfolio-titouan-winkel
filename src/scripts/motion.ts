import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

declare global {
    interface Window {
        __motionReady?: boolean;
        lenis?: Lenis;
    }
}

gsap.registerPlugin(ScrollTrigger);

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!reducedMotion) {
    // Défilement fluide synchronisé avec ScrollTrigger
    const lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1 });
    window.lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // Le menu mobile bloque le défilement
    window.addEventListener("mobileMenuToggle", (e) => {
        const { isOpen } = (e as CustomEvent<{ isOpen: boolean }>).detail;
        if (isOpen) lenis.stop();
        else lenis.start();
    });

    // Éléments isolés : apparition en fondu vers le haut
    gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        const isGroup = el.hasAttribute("data-reveal-stagger");
        const targets = isGroup ? Array.from(el.children) : el;
        gsap.set(el, { opacity: 1 });
        gsap.from(targets, {
            y: Number(el.dataset.revealY ?? 40),
            opacity: 0,
            duration: 0.9,
            ease: "power3.out",
            delay: Number(el.dataset.revealDelay ?? 0),
            stagger: isGroup ? 0.08 : 0,
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
    });

    // Titres de section : le crochet se dessine puis le texte glisse
    gsap.utils.toArray<HTMLElement>("[data-section-title]").forEach((title) => {
        const bracket = title.querySelector("[data-bracket]");
        const text = title.querySelector("[data-text]");
        gsap.timeline({
            scrollTrigger: { trigger: title, start: "top 88%", once: true },
        })
            .from(bracket, { scale: 0, transformOrigin: "0% 0%", duration: 0.5, ease: "back.out(2)" })
            .from(text, { yPercent: 110, duration: 0.7, ease: "power4.out" }, "-=0.25");
    });

    // Les images chargées après coup modifient la hauteur de la page
    window.addEventListener("load", () => ScrollTrigger.refresh());
}

window.__motionReady = true;
