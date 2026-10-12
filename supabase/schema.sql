-- Schéma de référence de la base Supabase du portfolio.
-- Les fichiers (images) sont dans le bucket Storage public "projets", rangés en {id du projet}/{nom du fichier} ;
-- les colonnes d'images ne contiennent que les noms de fichiers.

create table if not exists public.projets (
    id text primary key default substr(md5(random()::text), 1, 15),  -- utilisé dans l'URL /projets/{id}
    nom text not null,
    couleur text,                                       -- couleur hexadécimale du projet, ex. #6BD5D5
    description text,                                   -- résumé court (cartes, balise meta)
    introduction text,
    competences text[] not null default '{}',           -- ids des outils, voir src/data/skills.ts
    visuels text[] not null default '{}',               -- visuels finaux ; le premier sert de couverture
    lien_site text,                                     -- lien vers le site ou l'application en ligne
    a_la_une boolean not null default false,            -- affiché dans le carrousel de l'accueil
    inspirations_texte text,
    inspirations_images text[] not null default '{}',
    logo_avant text,
    logo_avant_texte text,
    logo_apres text,                                    -- logo affiché en tête de la page projet
    logo_apres_texte text,
    created_at timestamptz not null default now(),      -- sert aussi à l'ordre et à l'année affichée
    updated_at timestamptz not null default now()
);

-- updated_at se met à jour tout seul à chaque modification
create or replace function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists projets_set_updated_at on public.projets;
create trigger projets_set_updated_at
    before update on public.projets
    for each row execute function public.set_updated_at();

-- Lecture publique, écriture réservée à la clé secrète et au tableau de bord (qui contournent RLS)
alter table public.projets enable row level security;

drop policy if exists "Lecture publique des projets" on public.projets;
create policy "Lecture publique des projets"
    on public.projets for select
    to anon, authenticated
    using (true);
