<template>
  <div class="mall-container">
    <div class="sidebar">
      <van-sidebar v-model="active" @change="changeTypeTab">
        <van-sidebar-item v-for="dict in jewel_category">
          <template #title>{{ dict.label }}</template>
        </van-sidebar-item>
      </van-sidebar>
    </div>
    <div class="content">
      <van-card
          v-for="jewel in jewelcaseList"
          :centered="true"
          :thumb="jewel.imageUrl"
          :title="jewel.jewelName"
          class="sku-card"
      >
        <template #footer>
          <van-button size="small" type="warning" @click="addToCart">预定</van-button>
        </template>
      </van-card>
    </div>
    <van-submit-bar button-text="提交订单" @submit="onSubmit"/>
  </div>
</template>

<script setup>
import {listJewelcase} from "@/api/jewel/jewelcase.js";

const active = ref(0);
const {proxy} = getCurrentInstance();
const {jewel_category, jewel_reservation_status} = proxy.useDict('jewel_category', 'jewel_reservation_status');

// 商品列表
const jewelcaseList = ref([]);

const data = reactive({
  jewelQueryParams: {
    pageNum: 1,
    pageSize: 999,
    category: null,
    reservationStatus: null,
  },
  orderFrom: {
    jewelCode: [],
    artistName: null,
    purpose: null,
    deliveryDate: null,
  }
});

const {jewelQueryParams, orderFrom} = toRefs(data);

onMounted(() => {
  getList()
})

/**
 * 添加到订单购物车
 * @param id
 */
function addToCart(id) {
  orderFrom.value.jewelCode.push(id + '')
  console.log(orderFrom.value)
}

/** 查询首饰管理列表 */
function getList() {
  listJewelcase(jewelQueryParams.value).then(response => {
    jewelcaseList.value = response.rows;
  });
}

function changeTypeTab(index) {
  queryParams.value.category = jewel_category.value[index].value
  getList()
}

</script>

<style lang="scss" scoped>
.mall-container {
  display: flex;
  flex-direction: row;

  .sidebar {
    height: 100vh;
    width: 30vw;
    --van-sidebar-width: 30vw;
    background-color: #f7f8fa;
  }

  .content {
    display: flex;
    width: 70vw;
    flex-direction: column;
    padding: 5px;

    .sku-card {
      width: 66vw;
    }
  }
}
</style>