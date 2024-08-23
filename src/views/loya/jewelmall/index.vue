<template>
  <div class="mall-container">
    <div class="sidebar">
      <van-sidebar v-model="active" @change="changeTypeTab">
        <van-sidebar-item>
          <template #title>全部</template>
        </van-sidebar-item>
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
          <van-button
              :disabled="choseJewelList.indexOf(jewel) !== -1 || jewel.reservationStatus !=='available'"
              size="small"
              type="warning"
              @click="addToCart(jewel)"
          >{{ selectDictLabel(jewel_reservation_status, jewel.reservationStatus) }}
          </van-button>
        </template>
      </van-card>

      <van-empty v-if="jewelcaseList.length === 0"
                 :image="customEmptyImage"
                 image-size="80"
                 description="暂无首饰"
      />
    </div>
    <van-submit-bar :disabled="choseJewelList.length === 0" button-text="提交订单" @submit="onConfirm"/>

    <JewelReserveAction v-model="choseJewelList" v-model:show="show" v-model:form-data="orderFrom"></JewelReserveAction>
  </div>
</template>

<script setup>
import {listJewelcase} from "@/api/jewel/jewelcase.js";
import customEmptyImage from '@/assets/images/custom-empty-image.png';
import {selectDictLabel} from "@/utils/ruoyi.js";
import JewelReserveAction from "@/views/loya/jewelmall/JewelReserveAction.vue";

const active = ref(0);
const show = ref(false);
const {proxy} = getCurrentInstance();
const {jewel_category, jewel_reservation_status} = proxy.useDict('jewel_category', 'jewel_reservation_status');

// 商品列表
const jewelcaseList = ref([]);
const choseJewelList = ref([]);
const data = reactive({
  jewelQueryParams: {
    pageNum: 1,
    pageSize: 999,
    category: null,
    reservationStatus: null,
  },
  orderFrom: {
    // 首饰IDs
    jewelCode: [],
    // 艺人
    artistName: null,
    // 活动内容
    purpose: null,
    // 送达时间
    deliveryDate: null,
    // 收件人
    recipientName: null,
    // 收件电话
    recipientPhone: null,
    // 收件地址
    recipientAddress: null
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
function addToCart(jewel) {
  choseJewelList.value.push(jewel)
}

function onConfirm() {
  show.value = true
}

/** 查询首饰管理列表 */
function getList() {
  listJewelcase(jewelQueryParams.value).then(response => {
    jewelcaseList.value = response.rows;
  });
}

function changeTypeTab(index) {
  if(index !== 0){
    jewelQueryParams.value.category = jewel_category.value[index - 1].value
  }else {
    jewelQueryParams.value.category = null
  }
  getList()
}


</script>

<style lang="scss" scoped>
.mall-container {
  display: flex;
  flex-direction: row;

  .action-content {
    height: auto;
    padding: 10px 10px;
    background: linear-gradient(to bottom, #a8b8a0 -300%, #ffffff 95%);

    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    flex-wrap: nowrap;
    gap: 4px;

    .box {
      --van-field-label-color: #57723e;
      height: auto;
      background-color: #ffffff;
      border-radius: 10px;
      padding: 10px 10px;

      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-evenly;
      align-content: center;
      flex-wrap: nowrap;
      gap: 4px;

      .sku-card {
        width: 100%;
      }

      .time {
        width: 100%;
        background-color: #bde3a1;
        border: 1px solid #75a054;
        padding: 10px;
        border-radius: 10px;
        color: #57723e;

      }

      .address {
        width: 100%;
        background-color: #ffffff;
        border: 1px dashed #75a054;
        padding: 10px;
        border-radius: 10px;
        color: #57723e;

        display: flex;
        flex-direction: row;

        .label {
          width: 20%;
        }
      }


    }

    .chose-list {
      min-height: 30%;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
    }
  }

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