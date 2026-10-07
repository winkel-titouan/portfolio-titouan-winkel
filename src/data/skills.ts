import type { ImageMetadata } from "astro";
import illustrator from "../assets/logos/web/illustrator.webp";
import figma from "../assets/logos/web/figma.webp";
import affinity from "../assets/logos/web/affinity.webp";
import sketchbook from "../assets/logos/web/sketchbook.webp";
import canva from "../assets/logos/web/canva.webp";
import html from "../assets/logos/web/html.webp";
import css from "../assets/logos/web/css.webp";
import js from "../assets/logos/web/js.webp";
import astro from "../assets/logos/web/astrojs.webp";
import tailwind from "../assets/logos/web/tailwindcss.webp";
import daisyui from "../assets/logos/web/daisyui.webp";
import wordpress from "../assets/logos/web/wordpress.webp";
import sql from "../assets/logos/web/sql.webp";
import pocketbase from "../assets/logos/web/pocketbase.webp";
import notion from "../assets/logos/web/notion.webp";
import davinci from "../assets/logos/web/davinci_resolve.webp";
import capcut from "../assets/logos/web/capcut.webp";

export const skillCategories = {
    design: "Design",
    web: "Développement web",
    communication: "Communication",
    audiovisuel: "Audiovisuel",
} as const;

export type SkillCategory = keyof typeof skillCategories;

export interface Skill {
    id: string;
    name: string;
    logo: ImageMetadata;
    categories: SkillCategory[];
    description: string;
}

export const skills: Skill[] = [
    {
        id: "illustrator",
        name: "Illustrator",
        logo: illustrator,
        categories: ["design"],
        description:
            "Adobe Illustrator est un logiciel de création graphique vectorielle professionnel, idéal pour la conception de logos, illustrations et designs complexes.",
    },
    {
        id: "figma",
        name: "Figma",
        logo: figma,
        categories: ["design", "web"],
        description:
            "Figma est un outil de design d'interface collaboratif en ligne, parfait pour créer des maquettes web et mobile avec une approche en équipe.",
    },
    {
        id: "affinity",
        name: "Affinity",
        logo: affinity,
        categories: ["design"],
        description:
            "Affinity Designer est un logiciel de design graphique vectoriel professionnel, offrant des outils puissants pour la création d'illustrations, de logos et de mises en page.",
    },
    {
        id: "sketchbook",
        name: "Sketchbook",
        logo: sketchbook,
        categories: ["design"],
        description:
            "Sketchbook est une application de dessin numérique intuitive offrant des outils professionnels pour l'illustration et le croquis artistique.",
    },
    {
        id: "canva",
        name: "Canva",
        logo: canva,
        categories: ["design", "communication"],
        description:
            "Canva est une plateforme de design graphique accessible qui permet de créer facilement des visuels professionnels pour les réseaux sociaux et la communication.",
    },
    {
        id: "html",
        name: "HTML",
        logo: html,
        categories: ["web"],
        description:
            "HTML (HyperText Markup Language) est le langage de balisage fondamental qui structure le contenu des pages web et définit leur architecture.",
    },
    {
        id: "css",
        name: "CSS",
        logo: css,
        categories: ["web"],
        description:
            "CSS (Cascading Style Sheets) est le langage de style qui donne vie aux pages web en définissant leur apparence visuelle et leur mise en page.",
    },
    {
        id: "javascript",
        name: "JavaScript",
        logo: js,
        categories: ["web"],
        description:
            "JavaScript est le langage de programmation qui rend les pages web interactives et dynamiques, permettant de créer des expériences utilisateur riches.",
    },
    {
        id: "astro",
        name: "Astro",
        logo: astro,
        categories: ["web"],
        description:
            "Astro est un framework web moderne qui permet de créer des sites ultra-rapides en générant du HTML statique et en chargeant le JavaScript uniquement quand nécessaire.",
    },
    {
        id: "tailwind",
        name: "Tailwind CSS",
        logo: tailwind,
        categories: ["web"],
        description:
            "Tailwind CSS est un framework CSS utility-first qui permet de construire rapidement des interfaces modernes en composant des classes utilitaires.",
    },
    {
        id: "daisyui",
        name: "DaisyUI",
        logo: daisyui,
        categories: ["web"],
        description:
            "DaisyUI est une bibliothèque de composants pour Tailwind CSS qui propose des éléments d'interface prêts à l'emploi avec un design moderne et cohérent.",
    },
    {
        id: "wordpress",
        name: "WordPress",
        logo: wordpress,
        categories: ["web", "communication"],
        description:
            "WordPress est un système de gestion de contenu puissant qui permet de créer et gérer facilement des sites web dynamiques sans connaissances techniques approfondies.",
    },
    {
        id: "sql",
        name: "SQL",
        logo: sql,
        categories: ["web"],
        description:
            "SQL (Structured Query Language) est le langage standard pour gérer et interroger les bases de données relationnelles de manière efficace.",
    },
    {
        id: "pocketbase",
        name: "PocketBase",
        logo: pocketbase,
        categories: ["web"],
        description:
            "Pocketbase est une base de données backend légère et open-source qui fournit une API REST automatique et une interface d'administration intégrée.",
    },
    {
        id: "notion",
        name: "Notion",
        logo: notion,
        categories: ["communication"],
        description:
            "Notion est un espace de travail tout-en-un qui combine prise de notes, gestion de projets et bases de données pour organiser efficacement toutes vos informations.",
    },
    {
        id: "davinci",
        name: "DaVinci Resolve",
        logo: davinci,
        categories: ["audiovisuel"],
        description:
            "DaVinci Resolve est un logiciel de montage vidéo professionnel qui combine édition, étalonnage colorimétrique et effets visuels dans une seule application.",
    },
    {
        id: "capcut",
        name: "CapCut",
        logo: capcut,
        categories: ["audiovisuel", "communication"],
        description:
            "CapCut est une application de montage vidéo intuitive et accessible, parfaite pour créer du contenu créatif pour les réseaux sociaux rapidement.",
    },
];
