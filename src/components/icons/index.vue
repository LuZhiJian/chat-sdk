<template>
  <svg class="svg-icon" aria-hidden="true" :style="style" @click="handleClick">
    <use :xlink:href="`#${name}`"></use>
  </svg>
</template>

<script>
export default {
  name: 'icon-svg',
  props: {
    name: {
      type: String,
      required: true,
    },
    width: {
      type: String,
    },
    height: {
      type: String,
    },
    color: {
      type: String,
    },
    className: {
      type: String,
    },
  },
  computed: {
    iconClass() {
      return this.className ? `svg-icon ${this.className}` : 'svg-icon'
    },
    style() {
      return {
        width: this.width,
        height: this.height,
        fill: this.color,
      };
    },
  },
  methods: {
    handleClick() {
      this.$emit("click");
    },
  },
};
</script>

<style>
.svg-icon {
  width: 16px;
  height: 16px;
  overflow: hidden;
  color: inherit;
}
</style>
