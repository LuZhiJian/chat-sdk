<template>
	<div class="editor-wrapper">
    <div class="tools-line">
      <a href="javascript:;" class="tool-item" @mousedown="saveSelection">
        <div class="contorl-box" @click.stop="faceClickHandle">
          <svgIcon name="emoji" size="24" />
        </div>
        <!-- <emoji-face class="emoji-block" @select="selectEmoji"></emoji-face> -->
      </a>
      <a href="javascript:;" class="tool-item">
        <svgIcon name="file" size="24" />
        <!-- <upload-file ref="uploader">
          <icon name="file" width="24" height="24"></icon>
        </upload-file> -->
      </a>
      <a href="javascript:;" class="tool-item">
        <svgIcon name="cut" size="24" />
        <!-- <cut></cut> -->
      </a>
      <button class="send-btn"><svgIcon name="send" size="14" /></button>
    </div>
    <div class="editor-textarea">
      <div id="text-area" class="text-area" ref="textarea" contenteditable="true" @keydown.13.exact="enterFun" @keydown.ctrl.13.exact="ctrlAndEnter" @keydown.meta.13.exact="ctrlAndEnter" @input.sync="inputHandle" v-html="curContent"></div>
    </div>
	</div>
</template>
<script>
import editor from './editor.es6'
export default editor
</script>
<style src="./editor.scss" lang="scss"></style>
