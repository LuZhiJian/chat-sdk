<template>
	<div class="editor-wrapper">
    <div class="tools-line">
      <a href="javascript:;" class="tool-item" @mousedown="saveSelection">
        <div class="contorl-box" @click.stop="faceClickHandle">
          <svgIcon name="emoji" size="24" />
        </div>
        <emoji-face class="emoji-block" @select="selectEmoji" v-show="emoji"></emoji-face>
      </a>
      <a href="javascript:;" class="tool-item">
        <upload-file ref="uploaders" :uid="newUser.uid"  @uploaddata="uploadData" @progress="getProgress" @uploaded="uploadSuccess" @uploaderr="uploadRrror">
          <svgIcon name="file" size="24" />
        </upload-file>
      </a>
      <a href="javascript:;" class="tool-item">
        <svgIcon name="cut" size="24" />
        <!-- <cut></cut> -->
      </a>
      <button class="send-btn" @click.stop="enterFun" :disabled="!trueContent"><svgIcon name="send" size="14" /></button>
    </div>
    <div class="editor-textarea">
      <div id="text-area" class="text-area" ref="textarea" contenteditable="true" @drop.prevent="dragHandle($event)" @keydown.enter.exact="enterFun" @keydown.ctrl.enter.exact="ctrlOrMetaEnter" @paste.prevent="pasteHandle" @keydown.meta.enter.exact="ctrlOrMetaEnter" @input.sync="inputHandle" v-html="curContent"></div>
    </div>
	</div>
</template>
<script>
import editor from './editor.es6'
export default editor
</script>
<style src="./editor.scss" lang="scss"></style>
