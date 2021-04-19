<template>
	<div class="list-wrapper">
    <div class="left-inner">
      <div class="search-box drag">
        <div class="input-view no-drag">
          <svgIcon name="search" class="icon-search" size="16" />
          <input type="text" ref="search" v-model.trim="searchValue" placeholder="搜索">
          <div class="clear-btn" v-show="searchValue" @click.stop="clear">
            <svgIcon name="clear" size="16" />
          </div>
        </div>
      </div>
      <div class="user-list">
        <dl>
          <dt>联系人 <span v-if="contactCount">（{{ contactCount }}）</span></dt>
          <dd>
            <ul class="user-tree">
              <li :class="showUser && v.userInfo.uid === showUser.userInfo.uid ? 'active' : ''" v-for="(v, i) in list" :key="i" @click.stop="showing(v)">
                <div class="av-box">
                  <Avatar :userInfo="v" />
                </div>
                <div class="nick-name">{{ v.remarkName || v.userInfo.nickName}}</div>
              </li>
            </ul>
          </dd>
        </dl>
      </div>
    </div>
    <div class="right-inner">
      <div class="drag-wrapper drag"></div>
      <div class="show-user-inner" v-if="showUser">
        <div class="top-inners">
          <div class="info-box">
            <div class="nick-name-box">
              <span class="nick-name">{{ showUser.userInfo.nickName }}</span>
              <svgIcon :name="+showUser.userInfo.sex === 1 ? 'male' : 'female'" size="20" :color="+showUser.userInfo.sex === 1 ? '#488cfc' : '#f94d83'" v-if="typeof showUser.userInfo.sex === ('number' || 'string')" />
            </div>
            <div class="info-signature">{{ showUser.userInfo.signature }}</div>
          </div>
          <div class="big-avatar">
            <div class="avatar-path" :style="{backgroundImage: 'url(' + showUser.userInfo.icon + ')'}" @click="showAvatar(showUser.userInfo)"></div>
          </div>
        </div>
        <div class="info-detail-inners">
          <div class="detail-line">
            <span>备注名</span>
            <div class="keys">{{ showUser.remarkName }}</div>
          </div>
          <div class="detail-line">
            <span>描述</span>
            <div class="keys">{{ showUser.userInfo.signature }}</div>
          </div>
        </div>
        <div class="contorl-box">
          <div class="ct-btn">发消息</div>
        </div>
      </div>
    </div>
	</div>
</template>
<script>
import list from './list.es6'
export default list
</script>
<style src="./list.scss" lang="scss"></style>
