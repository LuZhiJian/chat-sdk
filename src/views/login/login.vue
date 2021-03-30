<template>
	<div class="login-wrapper">
    <div class="login-inner">
      <div class="form-header">请输入授权码</div>
      <div class="form-layout">
        <div class="input-box">
          <input type="text" id="code" value="" placeholder="请输入授权码">
        </div>
        <button id="login-btn">登录</button>
      </div>
    </div>
	</div>
</template>
<script>
import login from './login.es6'
export default login
</script>
<style src="./login.scss" lang="scss"></style>
