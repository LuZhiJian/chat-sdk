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
    size: {
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
        width: this.size,
        height: this.size,
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
