BEGIN;
CREATE INDEX IF NOT EXISTS games_cursor_title_slug_idx ON public.games(title,slug);
CREATE INDEX IF NOT EXISTS games_cursor_newest_idx ON public.games(release_date DESC,slug ASC) WHERE release_date IS NOT NULL;
CREATE OR REPLACE FUNCTION public.browse_games_cursor(
 search_term text DEFAULT '', sort_mode text DEFAULT 'az',
 platform_filter text DEFAULT '', genre_filter text DEFAULT '',
 anchor_slug text DEFAULT '', backwards boolean DEFAULT false,
 page_size integer DEFAULT 49
) RETURNS TABLE(slug text,title text,release_date date,description text,developer text,publisher text,genres text[],platforms text[],cover_image_id text)
LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path=''
AS $$
DECLARE ordering text; predicate text := ''; anchor_title text; anchor_date date;
BEGIN
 IF coalesce(anchor_slug,'') <> '' THEN
  SELECT g.title,g.release_date INTO anchor_title,anchor_date FROM public.games g WHERE g.slug=anchor_slug;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invalid catalogue cursor'; END IF;
 END IF;
 IF sort_mode IN ('new','old') THEN
  IF sort_mode='new' THEN
   ordering := CASE WHEN backwards THEN 'g.release_date ASC,g.slug DESC' ELSE 'g.release_date DESC,g.slug ASC' END;
   predicate := CASE WHEN backwards THEN ' AND (g.release_date > $5 OR (g.release_date = $5 AND g.slug < $6))' ELSE ' AND (g.release_date < $5 OR (g.release_date = $5 AND g.slug > $6))' END;
  ELSE
   ordering := CASE WHEN backwards THEN 'g.release_date DESC,g.slug DESC' ELSE 'g.release_date ASC,g.slug ASC' END;
   predicate := CASE WHEN backwards THEN ' AND (g.release_date,g.slug) < ($5,$6)' ELSE ' AND (g.release_date,g.slug) > ($5,$6)' END;
  END IF;
 ELSE
  ordering := CASE WHEN backwards THEN 'g.title DESC,g.slug DESC' ELSE 'g.title ASC,g.slug ASC' END;
  predicate := CASE WHEN backwards THEN ' AND (g.title,g.slug) < ($4,$6)' ELSE ' AND (g.title,g.slug) > ($4,$6)' END;
 END IF;
 RETURN QUERY EXECUTE
 'SELECT g.slug,g.title,g.release_date,g.description,g.developer,g.publisher,g.genres,g.platforms,g.cover_image_id FROM public.games g WHERE true'
 || CASE WHEN coalesce(search_term,'')<>'' THEN ' AND g.title ILIKE $1' ELSE '' END
 || CASE WHEN coalesce(platform_filter,'')<>'' THEN ' AND g.platforms @> ARRAY[$2]::text[]' ELSE '' END
 || CASE WHEN coalesce(genre_filter,'')<>'' THEN ' AND g.genres @> ARRAY[$3]::text[]' ELSE '' END
 || CASE WHEN sort_mode IN ('new','old') THEN ' AND g.release_date IS NOT NULL' ELSE '' END
 || CASE WHEN coalesce(anchor_slug,'')<>'' THEN predicate ELSE '' END
 || ' ORDER BY '||ordering||' LIMIT $7'
 USING '%'||left(coalesce(search_term,''),100)||'%',platform_filter,genre_filter,anchor_title,anchor_date,anchor_slug,least(100,greatest(1,coalesce(page_size,49)));
END;
$$;
REVOKE ALL ON FUNCTION public.browse_games_cursor(text,text,text,text,text,boolean,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.browse_games_cursor(text,text,text,text,text,boolean,integer) TO anon,authenticated;
NOTIFY pgrst,'reload schema';
COMMIT;
