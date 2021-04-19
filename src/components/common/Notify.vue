<template>
  <div :class="'notify-wrapper ' + notify.type" v-if="notify.msg">
    <div class="notify-txt"><svgIcon size="24" :name="notify.type" />{{notify.msg}}</div>
  </div>
</template>

<script>
export default {
  computed: {
    notify() {
      return this.$store.state.notifyData;
    },
  },
};
</script>

<style lang="scss" scoped>
.notify-wrapper {
  position: fixed;
  top: 40px;
  left: 50%;
  -webkit-transform: translateX(-50%);
  transform: translateX(-50%);
  border-radius: 6px;
  background-color: rgba(0, 0, 0, 0.75);

  &.error {
    background-color: $color-error;
  }

  &.warning {
    background-color: $color-warning;
  }

  &.success {
    background-color: $color-success;
  }

  .notify-txt {
    height: 40px;
    line-height: 40px;
    padding: 0 30px;
    font-size: 14px;
    color: #fff;

    svg {
      fill: #fff;
      vertical-align: -7px;
      margin-right: 8px;
    }
  }
}
</style>

