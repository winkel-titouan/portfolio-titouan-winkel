import PocketBase from 'pocketbase';

export const PB_URL = 'https://portfolio.titouan-winkel.fr';

export const pb = new PocketBase(PB_URL);
// En SSR, plusieurs requêtes identiques simultanées s'annuleraient entre elles
pb.autoCancellation(false);

export interface Projet {
    id: string;
    nom_projet: string;
    description: string;
    couleur: string;
    prod_finale: string[];
    created?: string;
    competences?: string[];
    introduction?: string;
    inspiration_texte?: string;
    inspirations?: string[];
    logo_old?: string;
    logo_new?: string;
    logo_old_txt?: string;
    logo_new_txt?: string;
    lien_site?: string;
    lien_appli?: string;
}

export function getFileUrl(recordId: string, filename: string, collection = 'projets') {
    return `${PB_URL}/api/files/${collection}/${recordId}/${filename}`;
}

/** Première image de production finale, ou undefined si le projet n'en a pas. */
export function getCoverUrl(projet: Pick<Projet, 'id' | 'prod_finale'>) {
    const first = projet.prod_finale?.[0];
    return first ? getFileUrl(projet.id, first) : undefined;
}
