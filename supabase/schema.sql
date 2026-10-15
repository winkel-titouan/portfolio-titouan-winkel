-- Schéma de référence de la base Supabase du portfolio.
-- Les images sont dans le bucket Storage public "projets", rangées par projet :
--   {dossier}/visuels/...       visuels finaux (ordre alphabétique, le premier sert de couverture)
--   {dossier}/inspirations/...  images du moodboard
--   {dossier}/logo/...          logo (le premier fichier du dossier)
-- {dossier} est la colonne dossier du projet (ou son id si elle est vide).
-- Le site lit ces dossiers directement ; les colonnes visuels, inspirations et logo ne servent
-- que si le dossier correspondant est vide (elles contiennent alors des noms de fichiers).

create table if not exists public.projets (
    id text primary key default substr(md5(random()::text), 1, 15),  -- utilisé dans l'URL /projets/{id}
    nom text not null,
    dossier text unique,                                -- dossier du projet dans le bucket, ex. cookitup
    couleur text,                                       -- couleur hexadécimale du projet, ex. #6BD5D5
    description text,                                   -- résumé court (cartes, balise meta)
    competences text[] not null default '{}',           -- ids des outils, voir src/data/skills.ts
    visuels text[] not null default '{}',               -- visuels finaux ; le premier sert de couverture
    lien_site text,                                     -- lien vers le site ou l'application en ligne
    a_la_une boolean not null default false,            -- affiché dans le carrousel de l'accueil
    inspirations text[] not null default '{}',          -- images de la section inspirations
    logo text,                                          -- logo affiché en tête de la page projet
    created_at timestamptz not null default now(),      -- sert aussi à l'ordre et à l'année affichée
    updated_at timestamptz not null default now()
);

alter table public.projets add column if not exists dossier text unique;

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

-- Le site liste les dossiers du bucket : la lecture des fichiers du bucket "projets" doit être publique
drop policy if exists "Lecture publique du bucket projets" on storage.objects;
create policy "Lecture publique du bucket projets"
    on storage.objects for select
    to anon, authenticated
    using (bucket_id = 'projets');
