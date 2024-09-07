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
    <van-tabs v-model:active="active" @change="onChangeTab">
      <van-tab :title="tab.title" :name="tab.name" v-for="tab in tabs" :key="tab.name">
        <van-list
            class="card-container"
            :finished="finished"
            v-model:loading="loading"
            finished-text="没有更多了"
            @load="onLoad"
        >
          <UserOrderCard
              v-for="(order,idx) in orderList"
              :key="idx"
              v-model:model-value="orderList[idx]"
              @refresh="getList"
          />
        </van-list>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup>
import UserOrderCard from "@/views/loya/jewelmall/userView/user-order-card.vue";
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
  },
  {
    title: '待反馈',
    name: 'returned'
  },
  {
    title: '已关闭',
    name: 'close'
  },
]

const router = useRouter()
const searchQuery = ref('')
const active = ref('all')
const loading = ref(false)
const finished = ref(false);

const orderList = ref([])
const total = ref(0)
const pageNum = ref(1)

function getList() {
  loading.value = true;
  listOrderVo({
    pageNum: pageNum.value,
    pageSize: 4,
    orderStatus: active.value === 0 ? null : active.value
  }).then(response => {
    orderList.value = [...orderList.value, ...response.rows]
    total.value = response.total;
    loading.value = false;
    if (orderList.value.length < response.total) {
      pageNum.value = pageNum.value + 1
      finished.value = false
    } else {
      finished.value = true
    }
  })
}

function onLoad() {
  getList()
}

function onChangeTab() {
  orderList.value = []
  pageNum.value = 1
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
    justify-content: center;
    margin-top: 10px;

  }
}
</style>