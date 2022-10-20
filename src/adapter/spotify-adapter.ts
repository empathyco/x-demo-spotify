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
import { getToken } from './authentication';
import SearchForItemParameterObject = SpotifyApi.SearchForItemParameterObject;
import TrackSearchResponse = SpotifyApi.TrackSearchResponse;
import ArtistSearchResponse = SpotifyApi.ArtistSearchResponse;
import AlbumSearchResponse = SpotifyApi.AlbumSearchResponse;
import PagingObject = SpotifyApi.PagingObject;
import TrackObjectFull = SpotifyApi.TrackObjectFull;
import ArtistObjectFull = SpotifyApi.ArtistObjectFull;
import AlbumObjectSimplified = SpotifyApi.AlbumObjectSimplified;
import RecommendationsObject = SpotifyApi.RecommendationsObject;
import RecommendationTrackObject = SpotifyApi.RecommendationTrackObject;

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

type SpotifyResult = TrackObjectFull | ArtistObjectFull | AlbumObjectSimplified | RecommendationTrackObject
type ResponseObject = PagingObject<SpotifyResult>;

const resultSchema: Schema<SpotifyResult, Result> = {
  modelName: () => 'Result',
  id: 'id',
  name: 'name',
  url: 'external_urls.spotify',
  images: responseObject =>
    ('images' in responseObject ? responseObject.images : responseObject.album.images).map(
      ({ url }: any) => url
    )
};

const objectResponseMapper = schemaMapperFactory<ResponseObject, SearchResponse>({
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
  if ('tracks' in response) {
    return objectResponseMapper(response.tracks, context);
  }
  if ('artists' in response) {
    return objectResponseMapper(response.artists, context);
  }
  if ('albums' in response) {
    return objectResponseMapper(response.albums, context);
  }

  return { totalResults: 0, results: [], queryTagging: {} as TaggingRequest };
};

const requestProperties: RequestInit = {
  headers: { Authorization: `Bearer ${getToken()}` }
};

const searchEndpointAdapter = endpointAdapterFactory<SearchRequest, SearchResponse>({
  endpoint: 'https://api.spotify.com/v1/search',
  defaultRequestOptions: { properties: requestProperties },
  requestMapper,
  responseMapper
});

const recommendationsEndpointAdapter = endpointAdapterFactory<
  RecommendationsRequest,
  RecommendationsResponse
>({
  endpoint: 'https://api.spotify.com/v1/recommendations',
  defaultRequestOptions: { properties: requestProperties },
  requestMapper: () => ({ seed_genres: 'rock' }),
  responseMapper: schemaMapperFactory<RecommendationsObject, RecommendationsResponse>({
    results: {
      $path: 'tracks',
      $subSchema: resultSchema as any
    }
  })
});

export const adapter: XComponentsAdapter = {
  ...platformAdapter,
  search: searchEndpointAdapter,
  recommendations: recommendationsEndpointAdapter
};
