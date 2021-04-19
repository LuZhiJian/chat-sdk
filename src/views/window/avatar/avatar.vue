<template>
	<div class="avatar-wrapper drag">
    <div class="avatar-head">
      <MinWinButton />
    </div>
    <div class="avatar-body" :style="{backgroundImage: 'url(' + imgUrl + ')'}"></div>
	</div>
</template>
<script>
import avatar from './avatar.es6'
export default avatar
</script>
<style src="./avatar.scss" lang="scss"></style>
