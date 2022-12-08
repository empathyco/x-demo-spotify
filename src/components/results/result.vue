<template>
  <MainScrollItem :item="result" tag="article" class="x-result">
    <BaseResultLink class="x-result__picture" :result="result">
      <BaseResultImage :result="result" :animation="imageAnimation" class="x-picture--fixed-ratio">
        <template #placeholder>
          <BasePlaceholderImage />
        </template>
        <template #fallback>
          <BaseFallbackImage />
        </template>
      </BaseResultImage>
    </BaseResultLink>

    <div class="x-result__description x-list x-list--vertical x-list--gap-03 x-pt-4">
      <BaseResultLink :result="result">
        <h2 class="x-title3 x-capitalize" data-test="result-title">
          {{ result.name }}
        </h2>
      </BaseResultLink>

      <a
        v-if="result.album"
        :href="result.album.uri"
        class="x-no-underline hover:x-underline x-text-neutral-90"
      >
        <h3 class="x-small" data-test="result-title">
          {{ result.album && result.album.name }}
        </h3>
      </a>

      <div class="x-list x-list--wrap">
        <a
          v-for="artist in result.artists"
          :key="artist.uri"
          :href="artist.uri"
          class="x-artist-name x-no-underline hover:x-underline x-text-neutral-90"
        >
          <h3 class="x-text" data-test="result-title">{{ artist.name }}</h3>
        </a>
      </div>

      <BaseResultLink
        class="x-result__description x-list x-list--vertical x-padding--top-02 x-margin--top-auto"
        :class="$x.device === 'mobile' ? 'x-list--gap-01' : 'x-list--gap-02'"
        :result="result"
      >
        <a
          v-if="result.uri"
          :href="result.uri"
          class="x-button x-button--pill"
          style="text-decoration: none; background-color: #1ed760; border-color: #1ed760"
        >
          <SpotifyIcon class="white" height="20" />
          Open in Spotify
        </a>
      </BaseResultLink>
    </div>
  </MainScrollItem>
</template>

<script lang="ts">
  import { Result } from '@empathyco/x-types';
  import {
    BaseAddToCart,
    BaseResultLink,
    BaseResultImage,
    BaseResultCurrentPrice,
    BaseResultPreviousPrice,
    BasePlaceholderImage,
    BaseFallbackImage,
    CartIcon,
    CrossFade
  } from '@empathyco/x-components';
  import { MainScrollItem } from '@empathyco/x-components/scroll';
  import { Component, Prop, Vue } from 'vue-property-decorator';
  import SpotifyIcon from '../spotify-icon.vue';

  @Component({
    components: {
      SpotifyIcon,
      BaseAddToCart,
      BaseFallbackImage,
      BasePlaceholderImage,
      BaseResultCurrentPrice,
      BaseResultPreviousPrice,
      BaseResultImage,
      BaseResultLink,
      CartIcon,
      MainScrollItem
    }
  })
  export default class ResultComponent extends Vue {
    @Prop()
    public result!: Result;

    @Prop({ default: true })
    public showDescription!: boolean;

    @Prop({ default: true })
    public showAddToCart!: boolean;

    protected imageAnimation = CrossFade;
  }
</script>

<style scoped lang="scss">
  .x-artist-name:not(:last-child) {
    display: inline;
    &:after {
      content: ',\00a0';
      color: black;
    }

    > * {
      display: inline;
    }
  }
</style>
