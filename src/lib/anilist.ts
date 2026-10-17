const ANILIST_URL = "https://graphql.anilist.co";

export type AnilistTitle = {
  english: string | null;
  romaji: string | null;
  native?: string | null;
  userPreferred?: string | null;
};

export type AnilistCover = {
  extraLarge?: string | null;
  large?: string | null;
  medium?: string | null;
  color?: string | null;
};

export type AnilistMediaCard = {
  id: number;
  title: AnilistTitle;
  coverImage: AnilistCover;
  bannerImage?: string | null;
  format?: string | null;
  season?: string | null;
  seasonYear?: number | null;
  episodes?: number | null;
  status?: string | null;
  averageScore?: number | null;
  genres?: string[] | null;
  trailer?: {
    id?: string | null;
    site?: string | null;
    thumbnail?: string | null;
  } | null;
  nextAiringEpisode?: {
    airingAt: number;
    episode: number;
  } | null;
};

export type AnilistMediaInfo = AnilistMediaCard & {
  description?: string | null;
  duration?: number | null;
  popularity?: number | null;
  startDate?: { year?: number | null; month?: number | null; day?: number | null } | null;
  endDate?: { year?: number | null; month?: number | null; day?: number | null } | null;
  studios?: {
    nodes?: Array<{ name: string; isAnimationStudio?: boolean }>;
  } | null;
  relations?: {
    edges?: Array<{
      relationType?: string | null;
      node?: {
        id: number;
        type?: string | null;
        format?: string | null;
        status?: string | null;
        averageScore?: number | null;
        episodes?: number | null;
        coverImage?: AnilistCover | null;
        title?: AnilistTitle | null;
      } | null;
    }>;
  } | null;
};

type PageResult<T> = {
  Page: {
    pageInfo: {
      total: number;
      currentPage: number;
      lastPage: number;
      hasNextPage: boolean;
      perPage: number;
    };
    media: T[];
  };
};

const MEDIA_CARD_FIELDS = `
  id
  title { english romaji native userPreferred }
  coverImage { extraLarge large medium color }
  bannerImage
  format
  season
  seasonYear
  episodes
  status
  averageScore
  genres
  trailer { id site thumbnail }
  nextAiringEpisode { airingAt episode }
`;

async function anilistRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
  signal?: AbortSignal
): Promise<T> {
  const response = await fetch(ANILIST_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`AniList error: ${response.status}`);
  }

  const json = await response.json();
  if (json.errors?.length) {
    throw new Error(json.errors[0]?.message || "AniList GraphQL error");
  }

  return json.data as T;
}

export async function fetchTrending(
  page = 1,
  perPage = 24,
  signal?: AbortSignal
) {
  const data = await anilistRequest<PageResult<AnilistMediaCard>>(
    `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage perPage }
        media(type: ANIME, sort: TRENDING_DESC) {
          ${MEDIA_CARD_FIELDS}
        }
      }
    }
    `,
    { page, perPage },
    signal
  );

  return {
    results: data.Page.media,
    pageInfo: data.Page.pageInfo,
  };
}

export async function fetchPopular(
  page = 1,
  perPage = 24,
  signal?: AbortSignal
) {
  const data = await anilistRequest<PageResult<AnilistMediaCard>>(
    `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage perPage }
        media(type: ANIME, sort: POPULARITY_DESC) {
          ${MEDIA_CARD_FIELDS}
        }
      }
    }
    `,
    { page, perPage },
    signal
  );

  return {
    results: data.Page.media,
    pageInfo: data.Page.pageInfo,
  };
}

export async function fetchSearch(
  query: string,
  perPage = 10,
  signal?: AbortSignal
) {
  const data = await anilistRequest<PageResult<AnilistMediaCard>>(
    `
    query ($page: Int, $perPage: Int, $search: String) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage perPage }
        media(type: ANIME, search: $search, sort: SEARCH_MATCH) {
          ${MEDIA_CARD_FIELDS}
        }
      }
    }
    `,
    { page: 1, perPage, search: query },
    signal
  );

  return {
    results: data.Page.media,
    pageInfo: data.Page.pageInfo,
  };
}

export async function fetchAnimeInfo(id: number | string, signal?: AbortSignal) {
  const data = await anilistRequest<{ Media: AnilistMediaInfo | null }>(
    `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        ${MEDIA_CARD_FIELDS}
        description(asHtml: true)
        duration
        popularity
        startDate { year month day }
        endDate { year month day }
        studios { nodes { name isAnimationStudio } }
        relations {
          edges {
            relationType
            node {
              id
              type
              format
              status
              averageScore
              episodes
              coverImage { large color }
              title { english romaji }
            }
          }
        }
      }
    }
    `,
    { id: Number(id) },
    signal
  );

  if (!data.Media) {
    throw new Error("Anime not found");
  }

  return data.Media;
}

export function getMediaTitle(title?: AnilistTitle | string | null) {
  if (!title) return "Unknown Title";
  if (typeof title === "string") return title;
  return (
    title.english ||
    title.romaji ||
    title.userPreferred ||
    title.native ||
    "Unknown Title"
  );
}

export function getCoverUrl(cover?: AnilistCover | string | null) {
  if (!cover) return "";
  if (typeof cover === "string") return cover;
  return cover.extraLarge || cover.large || cover.medium || "";
}

/** Normalize AniList media into the shape used by list UIs */
export function toListAnime(anime: AnilistMediaCard) {
  return {
    id: String(anime.id),
    coverImage: getCoverUrl(anime.coverImage),
    title: getMediaTitle(anime.title),
    bannerImage: anime.bannerImage || undefined,
    status: anime.status || "Unknown",
    season: anime.season || undefined,
    genres: anime.genres?.join(", ") || "",
    meanScore: anime.averageScore ?? 0,
    episodes: anime.episodes ?? null,
    trailer: anime.trailer?.id
      ? {
          id: anime.trailer.id,
          thumbnail: anime.trailer.thumbnail || "",
        }
      : undefined,
    nextAiringEpisode: anime.nextAiringEpisode || undefined,
  };
}
