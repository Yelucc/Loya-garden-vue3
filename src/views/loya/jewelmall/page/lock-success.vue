<template>
  <div class="page-container">
    <div class="title">
      首饰预定成功
    </div>

    <div class="content">
      <div v-if="route.params.status === 'lock'" class="warn">
        请于7日内补充收件信息
      </div>
      <div v-else>
        首饰准备发出，请留意物流信息
      </div>
    </div>
    <div class="btn">
      <van-button hairline plain round type="success" @click="router.push('/loya/user')">查看预定</van-button>
      <van-button round type="success" @click="router.push('/loya/mall')">返回珠宝盒</van-button>
    </div>
  </div>
</template>

<script setup>

import {useRoute, useRouter} from "vue-router";
const route = useRoute()
const  router = useRouter()


</script>

<style lang="scss" scoped>
.page-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  height: 100vh;
  background: linear-gradient(to bottom, #a8b8a0 10%, #ffffff 95%);
  color: #57723e;

  .title {
    padding: 50px 0;
    color: #57723e;
    font-size: 32px;
  }

  .content {
    padding: 20px 0;

    .warn {
      color: rgba(160, 93, 14, 1);
    }
  }

  .btn {
    width: 60%;
    display: flex;
    flex-direction: row;
    align-items: center;
    align-content: center;
    justify-content: space-evenly;
  }
}
</style>