<template>
  <div :class="'u-avatar ' + (+info.uid === 10002 ? 'u-helper' : +info.uid === -10002 ? 'g-notice' : +info.groupId ? 'group' : 'user')" v-if="info && info">
    <MsgTag v-if="tag" :tag="tag" :disturb="info.disturb" />
    <div class="img-path" :style="{backgroundImage: 'url(' + info.icon + ')'}"></div>
    <online-state v-if="+info.isShowOnline" :status="info.isOnline"></online-state>
  </div>
</template>
<script>
import { OnlineState, MsgTag } from 'components'

export default {
  name: "Avatar",
  components: {
    OnlineState,
    MsgTag
	},
  props: {
    userInfo: {
      type: Object,
      default: {}
    },
    tag: {
      type: Number,
      default: 0
    }
  },
  data () {
		return {
      info: {}
    }
  },
  methods: {
    onUserChange(user) {
      this.info = user.userInfo || user
    }
  },
  watch: {
    userInfo: {
      handler: 'onUserChange',
      immediate: true,
      deep: true
    }
  }
};
</script>
<style lang="scss">
  .u-avatar {
    position: relative;

    .online-status-wrapper {
      right: -3px;
      bottom: -3px;
    }

    .tag {
      top: -4px;
      left: 33px;
    }

    &.u-helper {
      @include av-style(40px, '../../assets/file-avatar.png');
    }

    &.g-notice {
      @include av-style(40px, '../../assets/group-notice.png');
    }

    &.group {
      @include av-style(40px, '../../assets/group-avatar.png');
    }

    &.user {
      @include av-style(40px, '../../assets/avatar.png');
    }

    .img-path {
      @include av-style(40px, null)
    }
  }
</style>
