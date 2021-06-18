<template>
	<div class="card-wrapper">
    <div class="card-content" v-if="cardData">
      <div class="top-inners">
        <div class="info-box">
          <div class="nick-name-box" v-if="cardData.nickName">
            <span :class="'nick-name ' + (cardData.nickName.length > 5 ? `long_${cardData.nickName.length}` : '')">{{ cardData.nickName }}</span>
            <svgIcon :name="sex === 1 ? 'male' : 'female'" :size="cardData.nickName.length > 5 ? '18' : '20'" :color="sex === 1 ? '#488cfc' : '#f94d83'" v-if="typeof cardData.sex === ('number' || 'string')" />
          </div>
          <div class="info-id">openID: {{ cardData.openId }}</div>
        </div>
        <div class="big-avatar">
          <div class="avatar-path" :style="{backgroundImage: 'url(' + cardData.icon + ')'}" @click="showAvatar(cardData)"></div>
        </div>
      </div>
      <div class="info-detail-inners">
        <div class="detail-line" v-if="cardData.remarkName">
          <span>备注名</span>
          <div class="keys">{{ cardData.remarkName }}</div>
        </div>
        <div class="detail-line">
          <span>签名</span>
          <div class="keys">{{ cardData.signature }}</div>
        </div>
      </div>
      <div class="contorl-box" v-if="cardData.uid !== cardData.loginId">
        <div class="ct-btn" @click.stop="chatting(cardData)">发消息</div>
      </div>
    </div>
	</div>
</template>
<script>
import card from './card.es6'
export default card
</script>
<style src="./card.scss" lang="scss"></style>
