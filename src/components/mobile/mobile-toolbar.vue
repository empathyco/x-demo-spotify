<template>
  <div class="x-list x-list--horizontal x-list--align-center x-list__item--expand">
    <span v-if="$x.totalResults" class="x-list__item--expand x-font-size--05">
      {{ $t('totalResults.message', { totalResults: $x.totalResults }) }}
    </span>

    <ColumnPicker v-if="$x.totalResults" />
  </div>
</template>

<script lang="ts">
  import { Component, Vue } from 'vue-property-decorator';
  import ColumnPicker from '../column-picker.vue';

  @Component({
    components: {
      ColumnPicker
    }
  })
  export default class MobileToolbar extends Vue {}
</script>
