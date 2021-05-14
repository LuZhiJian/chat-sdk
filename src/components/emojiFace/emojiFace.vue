<template>
	<div class="emoji-face-wrapper">
    <div class="emoji-face-content">
      <i class="face-select" v-for="(item, key) in emoji" @click.stop="selectHandle(key)">
        <img :src="item">
      </i>
    </div>
	</div>
</template>
<script>
import emojiFace from './emojiFace.es6'
export default emojiFace
</script>
<style src="./emojiFace.scss" lang="scss"></style>
