import { endpointAdapterFactory, schemaMapperFactory, Mapper, Schema } from '@empathyco/x-adapter';
import { platformAdapter } from '@empathyco/x-adapter-platform';
import {
  RecommendationsRequest,
  RecommendationsResponse, Result,
  SearchRequest,
  SearchResponse,
  SimpleFacet,
  XComponentsAdapter
} from "@empathyco/x-types";
import { getToken } from './authentication';
import SearchForItemParameterObject = SpotifyApi.SearchForItemParameterObject;
import TrackSearchResponse = SpotifyApi.TrackSearchResponse;
import PagingObject = SpotifyApi.PagingObject;
import TrackObjectFull = SpotifyApi.TrackObjectFull;
import ArtistObjectFull = SpotifyApi.ArtistObjectFull;
import AlbumObjectSimplified = SpotifyApi.AlbumObjectSimplified;
import ArtistSearchResponse = SpotifyApi.ArtistSearchResponse;
import AlbumSearchResponse = SpotifyApi.AlbumSearchResponse;
import RecommendationsObject = SpotifyApi.RecommendationsObject;

const requestMapper = schemaMapperFactory<SearchRequest, SearchForItemParameterObject>({
  q: 'query',
  type: ({ filters }) =>
    filters && Object.values(filters).length
      ? Object.values(filters)
          .flat()
          .map(filter => filter.id)
          .join(',')
      : 'track',
  limit: 'rows',
  offset: 'start'
});

type ObjectResponse = PagingObject<TrackObjectFull | ArtistObjectFull | AlbumObjectSimplified>;

const resultSchema: Schema<TrackObjectFull | ArtistObjectFull | AlbumObjectSimplified, Result> = {
  modelName: () => 'Result',
  id: 'id',
  name: 'name',
  url: 'external_urls.spotify',
  images: item => ('images' in item ? item.images : item.album.images).map(({ url }) => url)
};

const objectResponseMapper = schemaMapperFactory<ObjectResponse, SearchResponse>({
  totalResults: 'total',
  results: {
    $path: 'items',
    $subSchema: resultSchema
  },
  facets: () =>
    [
      {
        modelName: 'SimpleFacet',
        id: 'type',
        label: 'Type',
        filters: [
          {
            modelName: 'SimpleFilter',
            id: 'track',
            label: 'track',
            selected: false,
            facetId: 'type'
          },
          {
            modelName: 'SimpleFilter',
            id: 'album',
            label: 'album',
            selected: false,
            facetId: 'type'
          },
          {
            modelName: 'SimpleFilter',
            id: 'artist',
            label: 'artist',
            selected: false,
            facetId: 'type'
          }
        ]
      }
    ] as SimpleFacet[]
});

const responseMapper: Mapper<
  TrackSearchResponse | ArtistSearchResponse | AlbumSearchResponse,
  SearchResponse
> = (response, context) => {
  if ('tracks' in response) {
    return objectResponseMapper(response.tracks, context);
  }
  if ('albums' in response) {
    return objectResponseMapper(response.albums, context);
  }
  if ('artists' in response) {
    return objectResponseMapper(response.artists, context);
  }
  return { results: [], totalResults: 0 };
};

const searchEndpointAdapter = endpointAdapterFactory<SearchRequest, SearchResponse>({
  endpoint: 'https://api.spotify.com/v1/search',
  defaultRequestOptions: {
    properties: {
      headers: { Authorization: `Bearer ${getToken()}` }
    }
  },
  requestMapper,
  responseMapper
});

const recommendationsEndpointAdapter = endpointAdapterFactory<
  RecommendationsRequest,
  RecommendationsResponse
>({
  endpoint: 'https://api.spotify.com/v1/recommendations',
  defaultRequestOptions: { properties: {
      headers: { Authorization: `Bearer ${getToken()}` }
    } },
  requestMapper: () => ({ seed_genres: 'rock' }),
  responseMapper: schemaMapperFactory<RecommendationsObject, RecommendationsResponse>({
    results: {
      $path: 'tracks',
      $subSchema: {
        modelName: () => 'Result',
        id: 'id',
        name: 'name',
        url: 'external_urls.spotify',
        images: ({ album }) => album.images.map(({ url }) => url)
      }
    }
  })
});

export const adapter: XComponentsAdapter = {
  ...platformAdapter,
  search: searchEndpointAdapter,
  recommendations: recommendationsEndpointAdapter
};
