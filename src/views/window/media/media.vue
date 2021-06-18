<template>
	<div class="media-wrapper drag">
    <div class="avatar-head drag">
      <MinWinButton />
    </div>
    <div v-if="data.msgType === 2" class="img-container no-drag" ref="dragImage">
      <img :src="initImg(data.url)" ref="bigImage" />
    </div>
    <div class="video-container no-drag" v-else-if="data.msgType === 4" ref="videoP">
      <video autoplay :src="initMedia(data.url)" id="video" ref="video" controls></video>
    </div>
	</div>
</template>
<script>
import media from './media.es6'
export default media
</script>
<style src="./media.scss" lang="scss"></style>
