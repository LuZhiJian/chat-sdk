<template>
  <div class="login-bg drag">
    <div class="login-wrapper">
      <div class="login-inner no-drag">
        <div class="form-header">请输入授权码</div>
        <div class="form-layout">
          <div class="input-box">
            <input type="text" v-model="code" placeholder="请输入授权码">
          </div>
          <button @click="login">登录</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import login from './login.es6'
export default login
</script>
<style src="./login.scss" lang="scss"></style>
