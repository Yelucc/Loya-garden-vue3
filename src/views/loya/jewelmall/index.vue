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
          <van-button
              :disabled="choseJewelList.indexOf(jewel) !== -1"
              size="small"
              type="warning"
              @click="addToCart(jewel)"
          >预定
          </van-button>
        </template>
      </van-card>
    </div>
    <van-submit-bar button-text="提交订单" @submit="onConfirm"/>

    <van-action-sheet v-model:show="show" title="首饰预定">
      <div class="action-content">
        <!--        <van-address-list-->
        <!--            v-model="chosenAddressId"-->
        <!--            :list="list"-->
        <!--            :show-add-button="false"-->
        <!--        />-->
        <div class="box">
          <div class="time" @click="showPicker = true">
            选择送达时间
            <van-icon name="arrow"/>
            {{ `${currentDate[0]} 年 ${currentDate[1]} 月 ${currentDate[2]} 日` }}
          </div>
          <van-popup v-model:show="showPicker" position="bottom">
            <van-date-picker
                v-model="currentDate"
                :max-dat="maxDate"
                :min-date="minDate"
                title="选择日期"
                @cancel="showPicker = false"
                @confirm="onTimeConfirm"/>
          </van-popup>
          <div class="address" @click="addressSelectShow = true">
            地址
            <van-icon name="friends"/>
            {{ orderFrom.address || '（预定阶段可缓填）' }}
          </div>

          <van-action-sheet v-model:show="addressSelectShow" title="地址列表">
            <van-address-list
                v-model="orderFrom.address"
                :list="list"
                default-tag-text="默认"
                @add="addressEditShow = true"
                @edit="onEditAddress"
            />
          </van-action-sheet>

          <van-action-sheet v-model:show="addressEditShow" title="地址编辑">
            <van-address-edit
                :address-info="editAddress"
                :area-columns-placeholder="['请选择', '请选择', '请选择']"
                :area-list="[]"
                show-delete
            />
          </van-action-sheet>


          <van-field v-model="orderFrom.artistName" label="艺人" placeholder=""/>
          <van-field
              v-model="orderFrom.purpose"
              autosize
              label="活动内容"
              maxlength="50"
              placeholder="请输入活动内容，时间，链接等" rows="2"
              type="textarea"/>
        </div>

        <div class="box chose-list">
          <div class="">预定清单</div>
          <van-card
              v-for="jewel in choseJewelList"
              :centered="true"
              :thumb="jewel.imageUrl"
              :title="jewel.jewelName"
              class="sku-card"
          >
            <template #footer>
              <van-button icon="cross" round size="mini" type="danger" @click="removeToCart(jewel)"></van-button>
            </template>
          </van-card>
        </div>

        <van-button type="danger">立即预定</van-button>
      </div>
    </van-action-sheet>
  </div>
</template>

<script setup>
import {listJewelcase} from "@/api/jewel/jewelcase.js";

const active = ref(0);
const show = ref(false);
const showPicker = ref(false);
const addressSelectShow = ref(false);
const addressEditShow = ref(false);
const editAddress = ref({})

// 获取明天的日期
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
// 默认选中的日期 (字符串数组)
const currentDate = ref([
  tomorrow.getFullYear().toString(),
  (tomorrow.getMonth() + 1).toString().padStart(2, '0'), // 月份从0开始，需要加1
  tomorrow.getDate().toString().padStart(2, '0'),
]);
const minDate = new Date(tomorrow.getFullYear(), (tomorrow.getMonth()), tomorrow.getDate());
const maxDate = new Date(tomorrow.getFullYear() + 1, (tomorrow.getMonth()), tomorrow.getDate());
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
    jewelCode: [],
    address: null,
    artistName: null,
    purpose: null,
    deliveryDate: null,
  }
});


const list = [
  {
    id: '1',
    name: '张三',
    tel: '13000000000',
    address: '浙江省杭州市西湖区文三路 138 号东方通信大厦 7 楼 501 室',
    isDefault: true,
  }
];

const {jewelQueryParams, orderFrom} = toRefs(data);

onMounted(() => {
  getList()
})

/**
 * 添加到订单购物车
 * @param id
 */
function addToCart(jewel) {
  orderFrom.value.jewelCode.push(jewel.id + '')
  choseJewelList.value.push(jewel)
}

//
function onEditAddress(item, index) {
  editAddress.value = item;
  addressEditShow.value = true
}

function removeToCart(jewel) {
  orderFrom.value.jewelCode = orderFrom.value.jewelCode.filter(item => item.id !== jewel.id)
  choseJewelList.value = choseJewelList.value.filter(item => item.id !== jewel.id)
}

function onTimeConfirm({selectedValues}) {
  showPicker.value = false;
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
  queryParams.value.category = jewel_category.value[index].value
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