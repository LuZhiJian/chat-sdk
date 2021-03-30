<template>
  <div id="mytitle">
    <div :class="'titlebtn no-drag ' + `btn-${v.type}`" v-for="(v, i) in btnList" :key="i" :style="`right: ${v.right}px;`" @click="doing(v.type)">
      <svgIcon :name="v.type" />
    </div>
  </div>
</template>

<script>
  import { ipcRenderer } from 'electron'

  export default {
    name: 'Wintitle',
    components: {
    },
    data() {
      return {
        btnList: [
          {
            type: 'min',
            right: 100
          },
          {
            type: 'max',
            right: 60
          },
          {
            type: 'close',
            right: 20
          }
        ]
      }
    },
    mounted() {
    },
    methods: {
      doing(type) {
        ipcRenderer.send(type);
      },
    }
  }
</script>

<style lang="scss">
#mytitle {
  position: fixed;
  right: 0;
  top: 0;
}
.titlebtn {
  width: 40px;
  height: 24px;
  line-height: 24px;
  display: inline-block;
  text-align: center;

  svg {
    vertical-align: -1px;
    fill: #fff;
  }

  &:hover {
    background-color: rgba(0, 0, 0, 0.2);
  }
  &.btn-close:hover {
    background-color: rgb(231, 66, 66);
  }
}
</style>
