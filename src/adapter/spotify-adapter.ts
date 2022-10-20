/// <reference path="../../node_modules/@types/spotify-api/index.d.ts" />
import { endpointAdapterFactory, Mapper, schemaMapperFactory } from '@empathyco/x-adapter';
import { platformAdapter } from '@empathyco/x-adapter-platform';
import { Schema } from '@empathyco/x-adapter/dist/types/schemas/types';
import {
  RecommendationsRequest,
  RecommendationsResponse,
  Result,
  SearchRequest,
  SearchResponse,
  SimpleFacet,
  TaggingRequest,
  XComponentsAdapter
} from '@empathyco/x-types';
import SearchForItemParameterObject = SpotifyApi.SearchForItemParameterObject;
import TrackSearchResponse = SpotifyApi.TrackSearchResponse;
import ArtistSearchResponse = SpotifyApi.ArtistSearchResponse;
import AlbumSearchResponse = SpotifyApi.AlbumSearchResponse;
import PagingObject = SpotifyApi.PagingObject;
import TrackObjectFull = SpotifyApi.TrackObjectFull;
import ArtistObjectFull = SpotifyApi.ArtistObjectFull;
import AlbumObjectSimplified = SpotifyApi.AlbumObjectSimplified;
import RecommendationsObject = SpotifyApi.RecommendationsObject;

const requestMapper = schemaMapperFactory<SearchRequest, SearchForItemParameterObject>({
  q: 'query',
  type: ({ filters }) =>
    filters !== undefined && Object.values(filters).length
      ? Object.values(filters)
          .flat()
          .flatMap(filter => filter.id)
          .join(',')
      : 'track',
  limit: 'rows',
  offset: 'start'
});

type ResponseObject = PagingObject<TrackObjectFull | ArtistObjectFull | AlbumObjectSimplified>;

const resultSchema: Schema<any /*ResponseObject['items'][number]*/, Result> = {
  modelName: () => 'Result',
  id: 'id',
  name: 'name',
  tagging: () => ({} as any),
  url: 'external_urls.spotify',
  images: responseObject =>
    ('images' in responseObject ? responseObject.images : responseObject.album.images).map(
      ({ url }: any) => url
    )
};

const objectResponseMapper = schemaMapperFactory<ResponseObject, SearchResponse>({
  totalResults: 'total',
  queryTagging: () => ({} as any),
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
            selected: true,
            facetId: 'type'
          },
          {
            modelName: 'SimpleFilter',
            id: 'artist',
            label: 'artist',
            selected: false,
            facetId: 'type'
          },
          {
            modelName: 'SimpleFilter',
            label: 'album',
            id: 'album',
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
  if ('tracks' in response) return objectResponseMapper(response.tracks, context);
  if ('artists' in response) return objectResponseMapper(response.artists, context);
  if ('albums' in response) return objectResponseMapper(response.albums, context);

  return { totalResults: 0, results: [], queryTagging: {} as TaggingRequest };
};

const endpointOptions = {
  properties: {
    headers: {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      Authorization: `Bearer ${process.env.VUE_APP_TOKEN}`
    }
  }
};

const searchEndpointAdapter = endpointAdapterFactory<SearchRequest, SearchResponse>({
  endpoint: 'https://api.spotify.com/v1/search',
  defaultRequestOptions: endpointOptions,
  requestMapper,
  responseMapper
});

const recommendationsEndpointAdapter = endpointAdapterFactory<
  RecommendationsRequest,
  RecommendationsResponse
>({
  endpoint: 'https://api.spotify.com/v1/recommendations',
  defaultRequestOptions: endpointOptions,
  requestMapper: () => ({ seed_genres: 'rock' }),
  responseMapper: schemaMapperFactory<RecommendationsObject, RecommendationsResponse>({
    results: {
      $path: 'tracks',
      $subSchema: resultSchema
    }
  })
});

export const adapter: XComponentsAdapter = {
  ...platformAdapter,
  search: searchEndpointAdapter,
  recommendations: recommendationsEndpointAdapter
};
