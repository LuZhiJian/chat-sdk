<template>
  <div :class="'vue-sound-wrapper ' + (isNoListen ? 'nolisten' : '')">
    <div class="vue-sound__player">
      <!-- <icon @click="stop()" name="audio-play" width="20" height="20" color="#fff #008dff" class="icon-stop2"></icon>
       -->
      <!-- <a @click="stop()" title="Stop" class="icon-stop2" >
        <icon name="audio-play" width="20" height="20" color="#fff #008dff" class="icon-stop2"></icon>
      </a> -->
      <a @click="pause()" title="Play" :class="[ paused ? 'icon-play3' : 'icon-pause2' ]">
        <svgIcon :name="paused ? 'play' : 'pause'" size="14" color="#2898FF" />
      </a>
      <div v-on:click="setPosition" class="vue-sound__playback-time-wrapper" @mousedown="changeAudioTime">
        <div ref="progressTg" class="vue-sound__playback-time-indicator"></div>
        <span class="vue-sound__playback-time-current">{{currentTime}}</span>
        <span class="vue-sound__playback-time-separator"></span>
        <span class="vue-sound__playback-time-total">{{duration}}</span>
      </div>
      <div class="vue-sound__extern-wrapper">
        <a @click="download()" class="icon-download"></a>
        <a @click="changeLoop()" :class="[ innerLoop ? 'icon-spinner10' : 'icon-spinner11']"></a>
        <a @click="mute()" :class="[isMuted ? 'icon-volume-mute2': 'icon-volume-high' ]" title="Mute"></a>
        <a v-on:mouseover="toggleVolume()" class="volume-toggle icon-paragraph-justify" title="Volume">
          <input orient="vertical" v-model.lazy="volumeValue" v-on:change="updateVolume()" v-show="hideVolumeSlider" type="range" min="0" max="100" class="volume-slider"/>
        </a>

      </div>
    </div>
    <audio v-bind:id="playerId" :loop="innerLoop" ref="audiofile" :src="file" preload="auto" style="display:none;"></audio>
  </div>
</template>
<script>
import audio from './audio.es6'
export default audio
</script>
<style src="./audio.scss" lang="scss"></style>
