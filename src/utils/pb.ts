import PocketBase from 'pocketbase';

const pb = new PocketBase('https://portfolio.titouan-winkel.fr');

export default pb;

export interface Projet {
    id: string;
    nom_projet: string;
    description: string;
    couleur: string;
    prod_finale: string[];
}
