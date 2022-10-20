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

    <BaseResultLink
      class="x-result__description x-list x-list--vertical"
      :class="$x.device === 'mobile' ? 'x-list--gap-01' : 'x-list--gap-02'"
      :result="result"
    >
      <h2 class="x-small x-ellipsis x-uppercase" data-test="result-title">
        {{ result.name }}
      </h2>
    </BaseResultLink>
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

  @Component({
    components: {
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
