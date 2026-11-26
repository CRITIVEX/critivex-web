BEGIN;
CREATE OR REPLACE FUNCTION public.browse_games(
  search_term text DEFAULT '', sort_mode text DEFAULT 'az',
  platform_filter text DEFAULT '', genre_filter text DEFAULT '',
  page_offset integer DEFAULT 0, page_size integer DEFAULT 49
)
RETURNS TABLE(slug text,title text,release_date date,description text,developer text,publisher text,genres text[],platforms text[],cover_image_id text)
LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path = ''
AS $$
DECLARE ordering text;
BEGIN
  ordering := CASE sort_mode WHEN 'new' THEN 'g.release_date DESC NULLS LAST, g.slug ASC' WHEN 'old' THEN 'g.release_date ASC NULLS LAST, g.slug ASC' ELSE 'g.title ASC NULLS LAST, g.id ASC' END;
  RETURN QUERY EXECUTE
    'SELECT g.slug,g.title,g.release_date,g.description,g.developer,g.publisher,g.genres,g.platforms,g.cover_image_id FROM public.games g WHERE true'
    || CASE WHEN coalesce(search_term,'') <> '' THEN ' AND g.title ILIKE $1' ELSE '' END
    || CASE WHEN coalesce(platform_filter,'') <> '' THEN ' AND g.platforms @> ARRAY[$2]::text[]' ELSE '' END
    || CASE WHEN coalesce(genre_filter,'') <> '' THEN ' AND g.genres @> ARRAY[$3]::text[]' ELSE '' END
    || CASE WHEN sort_mode IN ('new','old') THEN ' AND g.release_date IS NOT NULL' ELSE '' END
    || ' ORDER BY ' || ordering || ' LIMIT $4 OFFSET $5'
    USING '%' || left(coalesce(search_term,''),100) || '%',platform_filter,genre_filter,least(100,greatest(1,coalesce(page_size,49))),greatest(0,coalesce(page_offset,0));
END;
$$;
REVOKE ALL ON FUNCTION public.browse_games(text,text,text,text,integer,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.browse_games(text,text,text,text,integer,integer) TO anon, authenticated;
NOTIFY pgrst, 'reload schema';
COMMIT;
