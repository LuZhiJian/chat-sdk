<template>
	<div :class="'online-status-wrapper ' + state"></div>
</template>
<script>
  export default {
    name: 'onlineStatus',
    components: {
    },
    props: ['status'],
    data () {
      return {
        state: 'online'
      }
    },
    mounted() {
    },
    methods: {
      onNetChange(val) {
        this.state = +val === 1 ? 'online' : 'offline'
      }
    },
    watch: {
      status: {
        handler: 'onNetChange',
        immediate: true,
        deep: true
      },
    }
  }
</script>
<style lang="scss">
.online-status-wrapper {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #fff;
  position: absolute;
  right: 1px;
  bottom: 1px;

  &.offline {
    &:before {
      background-color: $color-error;
    }
  }

  &:before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: $color-success;
    @include abs-center;
  }
}
</style>
