<template>
	<div class="slidebar-wrapper">
    <div class="item-box avatar-box">
      <div :class="'login-avatar ' + (netState === 1 ? 'online' : '')">
        <div class="avatar-box" :style="{backgroundImage: 'url(' +  info.icon + ')'}" @click="showCard(info)">
        </div>
      </div>
      <ul class="page-list">
        <li :class="'page-item ' + (routeName === v.name ? 'active' : '')" v-for="(v, i) in pages" :key="i">
          <a :href="v.path">
            <svgIcon :size="v.size" :name="v.iconName" />
            <span class="tag" v-if="v.tag && +v.tag > 0">{{ v.tag }}</span>
          </a>
        </li>
      </ul>

      <div class="logout-btn" @click.stop="logout">
        <svgIcon size="24px" name="logout" color="#EEE" />
      </div>
    </div>
	</div>
</template>
<script>
import slidebar from './slidebar.es6'
export default slidebar
</script>
<style src="./slidebar.scss" lang="scss"></style>
