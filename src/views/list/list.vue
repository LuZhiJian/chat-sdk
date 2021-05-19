<template>
	<div class="list-wrapper">
    <div class="left-inner">
      <div class="search-box drag">
        <div class="input-view no-drag">
          <svgIcon name="search" class="icon-search" size="16" />
          <input type="text" ref="search" v-model.trim="searchValue" placeholder="搜索" @input="searchChatList" @keydown.esc="clear">
          <div class="clear-btn" v-show="searchValue" @click.stop="clear">
            <svgIcon name="clear" size="16" />
          </div>
        </div>
      </div>
      <div class="user-list">
        <dl v-if="searchValue && searchValue.length">
          <dt>搜索结果 <span>（{{ searchList.length }}）</span></dt>
          <dd>
            <ul class="user-tree" v-if="searchList.length">
              <li :class="showUser && showUser.userInfo && v.uid === showUser.userInfo.uid ? 'active' : ''" v-for="(v, i) in searchList" :key="i" @click.stop="showing(v)">
                <div class="av-box">
                  <Avatar :userInfo="v" />
                </div>
                <div class="nick-name" v-html="v.userInfo.showName"></div>
              </li>
            </ul>
            <div class="null-data" v-else>无搜索结果</div>
          </dd>
        </dl>
        <div v-else>
          <dl>
            <dt :class="newTabVisible ? 'show':''" @click.stop="newTabVisible = !newTabVisible">新的朋友 <svgIcon name="right" size="16" color="#999" /></dt>
            <dd>
              <ul class="user-tree">
                <li :class="'new ' + (showUser && showUser.addType && showUser.userInfo && user.uid === showUser.uid ? 'active' : '')" v-for="(user, i) in applyList" :key="i" @click.stop="showing(user)">
                  <div class="av-box">
                    <Avatar :userInfo="user" />
                  </div>
                  <div class="nick-name">{{ user.userInfo.nickName }}</div>
                  <div class="desc">{{ user.msg }}</div>
                  <div class="status">{{ initStatus(user.status) }}</div>
                </li>
              </ul>
            </dd>
          </dl>
          <dl>
            <dt :class="contactsTabVisible ? 'show':''" @click.stop="contactsTabVisible = !contactsTabVisible">联系人 <span v-if="contactCount">（{{ contactCount }}）</span><svgIcon name="right" size="16" color="#999" /></dt>
            <dd>
              <ul class="user-tree">
                <li :class="showUser && !showUser.addType &&showUser.userInfo && v.uid === showUser.userInfo.uid ? 'active' : ''" v-for="(v, i) in list" :key="i" @click.stop="showing(v)">
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
    </div>
    <div class="right-inner">
      <div class="drag-wrapper drag"></div>
      <div class="show-user-inner" v-if="showUser && showUser.userInfo">
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
        <div class="info-detail-inners" v-if="showUser.addType">
          <div class="detail-line">
            <span>添加来源</span>
            <div class="keys">{{ showUser.addType === 2 ? '群聊添加' : '查找添加' }}</div>
          </div>
          <div class="detail-line">
            <span>打招呼</span>
            <div class="keys">{{ showUser.msg }}</div>
          </div>
        </div>
        <div class="contorl-box">
          <div class="control-line" v-if="[1, 3].includes(showUser.status)">
            <button class="green" @click.stop="apply(1)" :disabled="+showUser.status === 3">{{showUser.status === 3 ? '已过期':'同意'}}</button>
            <button class="del" @click.stop="apply(3)">删除</button>
          </div>
          <div class="ct-btn" @click.stop="chatting" v-else>发消息</div>
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
