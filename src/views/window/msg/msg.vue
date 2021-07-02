<template>
	<div class="msg-wrapper">
    <div class="top">
      新消息（{{count}}）
    </div>
    <div class="center" @click="windowSH('msgWindow', index, item.uId)" v-for="(item, index) in msgList" :key='index'>
      <div class="avat">
        <img :src="item.icon.length > 0 ? item.icon : avatar" alt="" />
      </div>
      <div class="title">{{item.nickName}}</div>
      <div class="msgNum">{{item.msgNum >99? '99+' : item.msgNum}}</div>
    </div>
    <div class="bottom">
      <span @click="windowSH('msgWindow', false)">忽略全部</span>
    </div>
	</div>
</template>
<script>
import msg from "./msg.es6";
export default msg;
</script>
<style src="./msg.scss" lang="scss"></style>
