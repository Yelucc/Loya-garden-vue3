<template>
  <div class="order-container">
    <div class="header">
      <div class="artistName">{{ model.artistName }}</div>
      <div class="status">{{
          order_status.filter(s => s.value === model.orderStatus)[0] ? order_status.filter(s => s.value === model.orderStatus)[0].label : ''
        }}
      </div>
    </div>
    <div class="sub-header">
      <div class="status-desc">{{ model.statusDescription }}</div>
    </div>
    <div class="content">
      <div class="sku-list">
        <div class="image-box" v-for="sku in model.jewels" :key="sku">
          <div class="tag">
            <van-tag type="primary">{{
                jewel_category.filter(s => s.value === sku.category)[0] ? jewel_category.filter(s => s.value === sku.category)[0].label : ''
              }}
            </van-tag>
          </div>
          <van-image
              class="sku-image"
              width="80"
              height="80"
              :src="sku.imageUrl"
          />
        </div>
      </div>
      <div class="description">
        共{{ model.jewels.length }}件
      </div>
    </div>
    <div class="control">
      <van-button
          type="warning" round plain hairline size="small"
          @click="addressEditShow = true"
          v-if="model.orderStatus === 'init'"
      >
        {{ '补充地址' }}
      </van-button>
      <van-button type="default" round plain hairline size="small"
                  v-if="model.orderStatus === 'shipped_awaiting_receipt'">
        {{ '查看物流' }}
      </van-button>
      <van-button type="success" round plain hairline size="small" @click="onConfirm"
                  v-if="model.orderStatus === 'shipped_awaiting_receipt'">
        {{ '确认收货' }}
      </van-button>
      <van-button type="success" round plain hairline size="small"
                  v-if="model.orderStatus === 'received_awaiting_return'">{{ '去寄回' }}
      </van-button>
      <van-button type="success" round plain hairline size="small" v-if="model.orderStatus === 'returned'">>{{
          '去返图'
        }}
      </van-button>
      <van-button type="danger" round plain hairline size="small">{{ '取消订单' }}</van-button>
      <van-button type="primary" round plain hairline size="small" v-if="model.orderStatus === 'init'">{{
          '修改订单'
        }}
      </van-button>
    </div>

    <van-action-sheet v-model:show="addressEditShow" title="补充收件地址">
      <van-address-edit
          :area-columns-placeholder="['请选择', '请选择', '请选择']"
          :area-list="areaList"
          @save="onAddressSave"
      />
    </van-action-sheet>
  </div>
</template>

<script setup name="UserOrderCard">
import {defineModel} from 'vue';
import {areaList} from "@vant/area-data";
import {addOrderManagement, updateOrderManagement} from "@/api/order/orderManagement.js";
import {showConfirmDialog, showToast} from "vant";

const {proxy} = getCurrentInstance();
const {order_status} = proxy.useDict('order_status');
const {jewel_category} = proxy.useDict('jewel_category');
const model = defineModel()
const addressEditShow = ref(false)

function onAddressSave(data) {
  let address = {
    recipientName: data.name,
    recipientPhone: data.tel,
    recipientAddress: data.province + data.city + data.county + data.addressDetail,
  }
  let form = {...model.value, ...address}
  addOrderManagement(form).then(response => {
    addressEditShow.value = false
    showToast('补充完成请耐心等待');
  });
}

// 确认收货
function onConfirm() {
  showConfirmDialog({
    title: '确认收货？',
    message:
        '请检查包装是否完好，首饰数量与订单数量是否一致',
  })
      .then(() => {
        updateOrderManagement(model.value).then(response => {
          showToast('确认完成');
        });
      })
      .catch(() => {
        // on cancel
      });

}


</script>

<style lang="scss" scoped>
.order-container {
  width: 95%;
  height: auto;
  background-color: #dbeae1;
  border-radius: 10px;
  margin-bottom: 5px;
  padding: 10px;
  display: flex;
  flex-direction: column;


  .header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-bottom: 5px;
  }

  .sub-header {
    font-size: 12px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-bottom: 2px;

    .status-desc {
      color: darkred;
    }
  }

  .content {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;

    .sku-list {
      width: 80%;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      margin-bottom: 10px;

      .image-box {
        .tag {
          position: absolute;
          width: 80px;
          height: 40px;
          border-radius: 5px;
          background: linear-gradient(to bottom, #4287b9 30%, #00000000 70%);
          z-index: 1;
        }

        .sku-image {
          margin-right: 10px;
          border-radius: 5px;
          object-fit: cover;
          width: 80px;
          height: 80px;
          overflow: hidden;

        }
      }

    }

    .description {
      font-size: 14px;
      color: #666;
      margin-bottom: 10px;
      text-align: center;
    }
  }

  .control {
    display: flex;
    flex-direction: row-reverse;
    justify-content: flex-start;
    gap: 5px;
  }
}

</style>