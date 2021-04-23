<template>
	<div class="home-wrapper">
    <div class="left-inner">
      <div class="search-box drag">
        <div class="input-view no-drag">
          <svgIcon name="search" class="icon-search" size="16" />
          <input type="text" ref="search" v-model.trim="chatSearchValue" placeholder="搜索">
          <div class="clear-btn" v-show="chatSearchValue" @click.stop="clear">
            <svgIcon name="clear" size="16" />
          </div>
        </div>
      </div>
      <div class="chatting-user-list">
        <div :class="'user-item ' + (chatUser.uid === v.userInfo.uid ? 'active' : '')" v-for="v in chattingList" :key="v.userInfo.uid" @click.stop="chatting(v)">
          <div class="av-box">
            <Avatar :userInfo="v" />
          </div>
          <div class="txt-box">
            <div class="top-line">
              <span class="nick-name">{{ v.userInfo.nickName }}</span>
              <ChatTime :chatTime="v.time" />
            </div>
            <div class="bt-line">
              <span class="msg-txt" v-if="v.unread">[{{ v.unread }}条]</span>
              <span class="msg-txt" v-html="v.msg"></span>
              <svgIcon name="disturb" v-if="+v.disturb" class="icon-disturb" size="14" color="#999" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="right-inner">
      <div class="chat-head drag">
        <div class="chat-name no-drag" v-if="chatUser.userInfo">{{ chatUser.userInfo.nickName }}<span v-if="chatUser && chatUser.groupCount">({{ chatUser.groupCount }})</span></div>
        <div class="more-info-btn no-drag" v-if="chatUser.uid">
          <svgIcon name="more" size="20px" color="#333" />
        </div>
      </div>
      <div class="message-main-inner">
        <div class="message-main-scroll" id="message-scroll">
          <div class="message-main-bying">
            <div class="message-item">
              <div class="time-line">下午 4:30</div>
              <div class="msg-line">
                <Avatar :userInfo="chatUser" />
                <div class="msg-box">
                  <div class="msg">今天过得怎么样，梦想是不是更远了？</div>
                </div>
              </div>
            </div>
            <div class="message-item me">
              <div class="time-line">下午 4:30</div>
              <div class="msg-line">
                <Avatar :userInfo="chatUser" />
                <div class="msg-box">
                  <div class="msg">今天过得怎么样，梦想是不是更远了？今天过得怎么样，梦想是不是更远了？梦想是不是更远了？今天过得怎么样，梦想是不是更远了？梦想是不是更远了？今天过得怎么样，梦想是不是更远了？</div>
                </div>
              </div>
            </div>
            <div class="message-item">
              <div class="time-line">下午 4:30</div>
              <div class="msg-line">
                <Avatar :userInfo="chatUser" />
                <div class="msg-box">
                  <div class="msg">今天过得怎么样，梦想是不是更远了？今天过得怎么样，梦想是不是更远了？梦想是不是更远了？今天过得怎么样，梦想是不是更远了？梦想是不是更远了？今天过得怎么样，梦想是不是更远了？</div>
                </div>
              </div>
            </div>
            <div class="message-item me">
              <div class="time-line">下午 4:30</div>
              <div class="msg-line">
                <Avatar :userInfo="chatUser" />
                <div class="msg-box">
                  <div class="msg">今天过得怎么样，梦想是不是更远了？今天过？</div>
                </div>
              </div>
            </div>
            <div class="message-item me">
              <div class="time-line">下午 4:30</div>
              <div class="msg-line">
                <Avatar :userInfo="chatUser" />
                <div class="msg-box">
                  <div class="msg">今天过得怎么样，梦想是不是更远了？今天过得怎么样，梦想是不是更远了？梦想是不是更远了？今天过得怎么样，梦想是不是更远了？梦想是不是更远了？今天过得怎么样，梦想是不是更远了？</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="editor-wrapper">
        <div class="editor-inner">
          <editor></editor>
        </div>
      </div>
    </div>
	</div>
</template>
<script>
import home from './home.es6'
export default home
</script>
<style src="./home.scss" lang="scss"></style>
