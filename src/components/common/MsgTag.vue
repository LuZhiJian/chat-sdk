<template>
  <span :class="'tag ' + (+disturb ? 'disturb':'')" v-if="msgTag && +msgTag > 0">{{ msgTag }}</span>
</template>
<script>
export default {
  name: 'ChatTime',
  props: {
    tag: {
      type: Number
    },
    disturb: {
      type: Number
    }
  },
  computed: {
    msgTag() {
      return +this.tag
    }
  }
}
</script>
<style lang="scss">
  .tag {
    min-width: 8px;
    min-height: 8px;
    padding: 0px 3px;
    border-radius: 4px;
    position: absolute;
    top: 20px;
    left: 46px;
    line-height: normal;
    font-size: 10px;
    background-color: $color-error;
    color: #fff;

    &.disturb {
      font-size: 0;
    }
  }
</style>
