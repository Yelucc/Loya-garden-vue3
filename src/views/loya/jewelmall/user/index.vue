<template>
  <div class="user-order-container">
    <van-nav-bar
        left-arrow
        @click-left="router.back()"
    >
      <template #title>
        <van-search shape="round" v-model="searchQuery" placeholder="请输入搜索关键词"/>
      </template>
    </van-nav-bar>
    <van-tabs v-model:active="active">
      <van-tab :title="tab.title" :name="tab.name" v-for="tab in tabs" :key="tab.name">
        <van-list
            class="card-container"
            :finished="finished"
            v-model:loading="loading"
            finished-text="没有更多了"
            @load="onLoad"
        >
          <UserOrderCard v-for="(order,idx) in orderList" :key="idx" v-model:model-value="orderList[idx]">
          </UserOrderCard>
        </van-list>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup>
import UserOrderCard from "@/views/loya/jewelmall/user/user-order-card.vue";
import {listOrderVo} from "@/api/order/orderManagement.js";

const tabs = [
  {
    title: '全部',
    name: null
  },
  {
    title: '待补充地址',
    name: 'locked'
  },
  {
    title: '待收货',
    name: 'shipped_awaiting_receipt'
  },
  {
    title: '待寄回',
    name: 'received_awaiting_return'
  }, {
    title: '待反馈',
    name: 'returned'
  }
]

const router = useRouter()
const searchQuery = ref('')
const active = ref('all')
const loading = ref(false)
const finished = ref(false);

const orderList = ref([])
const total = ref(0)

function getList(){
  loading.value = true;
  listOrderVo({
    pageNum: 1,
    pageSize: 4,
    status: active.value
  }).then(response=>{
    orderList.value = response.rows
    total.value = response.total;
    loading.value = false;
    finished.value = response.rows.length === response.total;
  })
}

function onLoad() {
  getList()
}
</script>

<style lang="scss" scoped>

:deep(.van-nav-bar__title) {
  max-width: 90%;

  .van-search {
    width: 90vw;
    margin-left: 3%;
  }
}

.user-order-container {
  height: 100vh;
  overflow-y: auto;
  scrollbar-width: none; /* For Firefox */
  -ms-overflow-style: none; /* For Internet Explorer and Edge */

  /* For Webkit-based browsers (Chrome, Safari) */
  &::-webkit-scrollbar {
    display: none;
  }

  .card-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    margin-top: 10px;

  }
}
</style>