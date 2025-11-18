import PocketBase from 'pocketbase';

export const pb = new PocketBase('https://portfolio.titouan-winkel.fr');

export interface Projet {
    id: string;
    nom_projet: string;
    description: string;
    couleur: string;
    prod_finale: string[];
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
