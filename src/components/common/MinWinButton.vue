<template>
  <div class="min-window-btn">
    <div class="mac-win-btn" v-if="false">
      <div :class="v.className" @click.stop="fun(v.name)" v-for="(v, i) in macBtns" :key="i">
        <svgIcon :name="v.iconName" :size="v.size" />
      </div>
    </div>
    <div class="win-win-btn" >
      <div :class="v.className" @click.stop="fun(v.name)" v-for="(v, ii) in winBtns" :key="ii">
        <svgIcon :name="v.iconName" :size="v.size" />
      </div>
    </div>
  </div>
</template>
<script>
import { remote } from 'electron'

export default {
  name: 'MinWinButton',
  props: {
  },
  data() {
    return {
      macBtns: [
        {
          name: 'close',
          iconName: 'close',
          className: 'close-btn',
          size: '12'
        },
        {
          name: 'min',
          iconName: 'mac-min',
          className: 'min-btn',
          size: '12'
        },
        {
          name: 'max',
          iconName: 'mac-max',
          className: 'max-btn',
          size: '6'
        },
      ],
      winBtns: [
        {
          name: 'min',
          iconName: 'min',
          className: 'min-btn',
          size: '14'
        },
        {
          name: 'max',
          iconName: 'max',
          className: 'max-btn',
          size: '14'
        },
        {
          name: 'close',
          iconName: 'close',
          className: 'close-btn',
          size: '14'
        }
      ]
    }
  },
  methods: {
    fun(e) {
      switch (e) {
        case 'close':
          remote.getCurrentWindow().hide()
          break;
        case 'min':
          remote.getCurrentWindow().minimize()
          break;
        case 'max':
          if (remote.getCurrentWindow().isMaximized()) {
            remote.getCurrentWindow().unmaximize()
          } else {
            remote.getCurrentWindow().maximize()
          }
          break;
        default:
          remote.getCurrentWindow().unmaximize()
          break;
      }
    }
  },
  computed: {
  }
}
</script>
<style lang="scss">
.mac-win-btn {
  width: 100%;
  height: 24px;
  padding: 5px 10px 0;
  white-space: nowrap;

  [class*="-btn"] {
    width: 14px;
    height: 14px;
    text-align: center;
    line-height: 14px;
    background-color: #999;
    border-radius: 50%;
    display: inline-block;
    vertical-align: top;
    margin-right: 10px;
    position: relative;
    @include transition(.5s);

    svg {
      @include abs-center;
      fill: #fff;
    }

    &.close-btn:hover {
      background-color: $color-error;
      @include transition(.5s);
    }

    &.min-btn:hover {
      background-color: $color-warning;
      @include transition(.5s);
    }

    &.max-btn:hover {
      background-color: $color-success;
      @include transition(.5s);
    }
  }
}

.win-win-btn {
  padding: 0;
  white-space: nowrap;
  text-align: right;

  [class*="-btn"] {
    width: 30px;
    height: 24px;
    text-align: center;
    line-height: 24px;
    display: inline-block;
    vertical-align: top;
    position: relative;
    @include transition(.5s);

    svg {
      @include abs-center;
      fill: #333;
      @include transition(.5s);
    }

    &:hover {
      background-color: #a6defe;
      @include transition(.5s);

      svg {
        fill: #fff;
        @include transition(.5s);
      }
    }

    &.close-btn:hover {
      background-color: $color-error;
      @include transition(.5s);

      svg {
        fill: #fff;
        @include transition(.5s);
      }
    }
  }
}
</style>
