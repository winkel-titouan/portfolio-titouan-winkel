import { createClient } from '@supabase/supabase-js';

// Valeurs publiques (la clé publishable ne donne que la lecture autorisée par les règles RLS)
export const SUPABASE_URL = 'https://xathrozynitnafvgpplc.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_CLKvnWSN8cn9YCJ8qkJf1A_nJ2Kzkrh';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false },
});

/** Une ligne de la table projets (voir supabase/schema.sql). Les champs « images » sont des chemins de fichiers du bucket, remplis par withStorageFiles. */
export interface Projet {
    id: string;
    nom: string;
    couleur: string | null;
    description: string | null;
    competences?: string[];
    visuels: string[];
    lien_site?: string | null;
    a_la_une?: boolean;
    inspirations?: string[];
    logo?: string | null;
    created_at?: string;
    updated_at?: string;
}

/** URL publique d'un fichier du bucket Storage (rangé en {id du projet}/{chemin du fichier}). */
export function getFileUrl(recordId: string, filename: string, bucket = 'projets') {
    const path = filename.split('/').map(encodeURIComponent).join('/');
    return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${recordId}/${path}`;
}

/** Fichiers d'un sous-dossier du projet dans le bucket, triés par nom (chemins relatifs au dossier du projet). */
async function listFolder(recordId: string, folder: string, bucket = 'projets') {
    const { data, error } = await supabase.storage
        .from(bucket)
        .list(`${recordId}/${folder}`, { limit: 1000, sortBy: { column: 'name', order: 'asc' } });
    if (error) {
        console.error(`Lecture du dossier ${recordId}/${folder} impossible :`, error);
        return [];
    }
    // Les sous-dossiers (id null) et le fichier fantôme d'un dossier vide sont ignorés
    return data.filter((f) => f.id && f.name !== '.emptyFolderPlaceholder').map((f) => `${folder}/${f.name}`);
}

/**
 * Remplit les images du projet à partir du Storage : dossiers visuels/, inspirations/ et logo/ du projet.
 * Un dossier vide ou absent garde les noms saisis dans la table.
 */
export async function withStorageFiles<T extends Projet>(projet: T): Promise<T> {
    const [visuels, inspirations, logos] = await Promise.all(
        ['visuels', 'inspirations', 'logo'].map((folder) => listFolder(projet.id, folder)),
    );
    return {
        ...projet,
        visuels: visuels.length > 0 ? visuels : projet.visuels ?? [],
        inspirations: inspirations.length > 0 ? inspirations : projet.inspirations ?? [],
        logo: logos[0] ?? projet.logo ?? null,
    };
}

/** Première image de production finale, ou undefined si le projet n'en a pas. */
export function getCoverUrl(projet: Pick<Projet, 'id' | 'visuels'>) {
    const first = projet.visuels?.[0];
    return first ? getFileUrl(projet.id, first) : undefined;
}
