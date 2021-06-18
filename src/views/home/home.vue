<template>
	<div class="home-wrapper">
    <div class="left-inner">
      <div class="search-box drag">
        <div class="input-view no-drag">
          <svgIcon name="search" class="icon-search" size="16" />
          <input type="text" ref="search" v-model.trim="chatSearchValue" @input="searchChatList" placeholder="搜索" @keydown.esc="clear">
          <div class="clear-btn" v-show="chatSearchValue" @click.stop="clear">
            <svgIcon name="clear" size="16" />
          </div>
        </div>
      </div>
      <!-- 搜索列表 -->
      <div v-if="chatSearchValue.length">
        <div class="chatting-user-list" v-if="searchList && searchList.length">
          <div :class="'user-item ' + (chatUser.uid === v.userInfo.uid ? 'active' : '')" v-for="v in searchList" :key="v.userInfo.uid" @click.stop="chatting(v)">
            <div class="av-box">
              <Avatar :userInfo="v" />
            </div>
            <div class="txt-box">
              <div class="top-line">
                <span class="nick-name" v-html="v.userInfo.showName"></span>
                <ChatTime :chatTime="v.time" />
              </div>
              <div class="bt-line">
                <span class="msg-txt" v-if="v.unread">[{{ v.unread }}条]</span>
                <span class="msg-txt" v-html="decodeReadyHtml(lastMsg(allChatData, v.uid))"></span>
                <svgIcon name="disturb" v-if="+v.disturb" class="icon-disturb" size="14" color="#999" />
              </div>
            </div>
          </div>
        </div>
        <div v-else class="null-data">无搜索结果</div>
      </div>
      <!-- 聊天列表 -->
      <div v-else>
        <div class="chatting-user-list" v-if="chattingList.length">
          <div :class="'user-item ' + (chatUser.uid === v.userInfo.uid ? 'active' : '')" v-for="v in chattingList" :key="v.userInfo.uid" @click.stop="chatting(v)" @contextmenu.prevent="showChatuserRtKey($event, 'right-click-menu', v)">
            <div class="av-box">
              <Avatar :userInfo="v" :tag="noreadData[v.uid]" />
            </div>
            <div class="txt-box">
              <div class="top-line">
                <span class="nick-name">{{ v.userInfo.nickName }}</span>
                <ChatTime :chatTime="v.time" />
              </div>
              <div class="bt-line">
                <span class="msg-txt" v-if="v.unread">[{{ v.unread }}条]</span>
                <span class="msg-txt" v-html="decodeReadyHtml(lastMsg(allChatData, v.uid))"></span>
                <svgIcon name="disturb" v-if="+v.disturb" class="icon-disturb" size="14" color="#999" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="right-inner" v-show="chatUser.userInfo">
      <div class="chat-head drag">
        <div class="chat-name no-drag" v-if="chatUser.userInfo">{{ chatUser.userInfo.nickName }}<span v-if="chatUser && chatUser.groupCount">({{ chatUser.groupCount }})</span></div>
        <div class="more-info-btn no-drag" v-if="chatUser.uid">
          <svgIcon name="more" size="20px" color="#333" />
        </div>
      </div>
      <div class="message-main-inner">
        <div class="message-main-scroll" id="message-scroll" @scroll.passive="scrollEvent">
          <div class="new-msg-tips" onselectstart="return false;" v-show="newMsgNum > 0" @click="readNewMsgFun">
            <svgIcon name="to" size="20" color="#253b78" />
            {{newMsgNum}}条新消息
            <svgIcon name="close" class="icon-close" size="16" color="#253b78" @click.stop="newMsgNum = 0" />
          </div>
          <div class="message-main-bying">
            <div :class="'message-item ' + (v.toUid !== +myInfo.uid ? 'me':'')" v-for="(v, i) in chatMessageList" :key="v.id">
              <ChatTime :chatTime="v.time" v-if="i > 0 && timeLine(chatMessageList[i].time, chatMessageList[i-1].time)" />
              <div class="recall-txt" v-if="v.isRecall">{{ (v.toUid !== +myInfo.uid ? '你' : '对方') + '撤回了一条消息' }}</div>
              <div :class="`msg-line state-${v.state}`" v-else>
                <Avatar :userInfo="v.toUid !== +myInfo.uid ? myInfo : chatUser" @click.stop="showCard(v.fromUid)" />
                <div class="msg-box" v-if="v.msgType === 1" @contextmenu.prevent="showChatRclickList($event, 'right-click-menu', v)">
                  <div class="msg" v-html="decodeEmojiHtml(v.content.content)"></div>
                </div>
                <div class="msg-box img" v-else-if="[2, 6].includes(v.msgType)" @contextmenu.prevent="showChatRclickList($event, 'right-click-menu', v)">
                  <div class="msg">
                    <div class="img-box" @click="downloadFile(v)">
                      <img :src="initImg(v.url || v.thumbURL)">
                      <div class="load-cover" v-if="v.thumbURL && !v.url" :style="{'--height': `${100 - (v.percent || 0)}%`}">
                        <div class="cancel-load-btn" v-if="v.percent && v.percent < 100">
                          <svgIcon name="close" size="30px" color="#ccc" />
                          <p>{{ v.percent }}%</p>
                        </div>
                        <div class="download-btn" v-else v-show="!v.percent">
                          <svgIcon name="download" size="30px" color="#ccc" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="msg-box audio" v-else-if="[3].includes(v.msgType)" @contextmenu.prevent="showChatRclickList($event, 'right-click-menu', v)">
                  <div class="cancel-btn" v-if="v.progress < 100" @click.stop="cancelUpload(v)">
                    <svgIcon name="clear" />
                  </div>
                  <div class="msg">
                    <vue-audio v-if="v.url" :file="initMedia(v.url)" @onPlay="onPlay(v)" :whoForm="v.toUid !== +myInfo.uid ? 'self':'other'" :noListen="v.noListen ? true : false"></vue-audio>
                  </div>
                </div>
                <div class="msg-box video" v-else-if="[4].includes(v.msgType)" @contextmenu.prevent="showChatRclickList($event, 'right-click-menu', v)">
                  <div class="cancel-btn" v-if="v.progress < 100" @click.stop="cancelUpload(v)">
                    <svgIcon name="clear" />
                  </div>
                  <div class="msg">
                    <div class="img-box">
                      <img :src="initImg(v.thumbURL)">
                      <div class="load-cover" v-if="v.thumbURL && !v.url" :style="{'--height': `${100 - (v.percent || 0)}%`}" @click="downloadFile(v)">
                        <div class="cancel-load-btn" v-if="v.percent && v.percent < 100">
                          <svgIcon name="close" size="30px" color="#ccc" />
                          <p>{{ v.percent }}%</p>
                        </div>
                        <div class="download-btn" v-else v-show="!v.percent">
                          <svgIcon name="download" size="30px" color="#ccc" />
                        </div>
                      </div>
                      <div class="div-play" v-if="v.url" @click="downloadFile(v)" >
                        <svgIcon name="video-play" size="30" color="#fff" />
                      </div>
                    </div>
                  </div>
                </div>
                <div class="msg-box file" v-else-if="[7].includes(v.msgType)" @contextmenu.prevent="showChatRclickList($event, 'right-click-menu', v)">
                  <div class="cancel-btn" v-if="v.progress < 100" @click.stop="cancelUpload(v)">
                    <svgIcon name="clear" />
                  </div>
                  <div class="msg">
                    <div class="file-box" @click.stop="openFile(v)">
                      <div class="file-name" v-html="initFileName(v.key, v.suffix)"></div>
                      <div class="duration">{{fileSizeFilter(v.content.fileSize)}}</div>
                      <div :class="'pro-inner ' + (v.progress === 100 ? 'finish' : '')" :data-progress="`${v.progress || 0}%`" :style="{backgroundImage: 'url(' + v.icon + ')', '--height': `${100 - (v.progress || 0)}%`}"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="editor-wrapper">
        <div class="editor-inner">
          <editor ref="editor" @homesend="send" :chatuser="chatUser"></editor>
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
