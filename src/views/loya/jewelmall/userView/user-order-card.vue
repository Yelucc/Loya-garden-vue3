<template>
  <div class="order-container">
    <div class="header">
      <div class="artistName">{{ model.artistName }}</div>
      <div style="display: flex;gap:10px">
        <dict-tag v-if="model.order.turnInfo.filter(t=>t.confirmStatus==='Except').length>0 && model.orderStatus!=='returned'" :options="logistics_status"
                  :value="'Except'"/>
        <div class="status">{{
            selectDictLabel(order_status, model.orderStatus)
          }}
        </div>
      </div>

    </div>
    <div class="sub-header">
      <div class="status-desc">{{ model.statusDescription }}</div>
    </div>
    <div class="content">
      <div class="sku-list">
        <div v-for="sku in model.jewels.slice(0,3)" :key="sku" class="image-box">
          <div class="tag">
            <van-tag type="primary">{{
                selectDictLabel(jewel_category, sku.category)
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
        <div v-if="model.jewels.length > 3">...</div>
      </div>
      <div class="description">
        共{{ model.jewels.length }}件
      </div>
    </div>
    <div class="control">
      <van-button
          hairline plain round size="small" type="success"
          @click="onDownLoadCaseImage"
      >
        {{ '保存原图到相册' }}
      </van-button>
      <van-button
          type="warning" round plain hairline size="small"
          @click="onShow('addressEditShow')"
          v-if="model.orderStatus === 'locked'"
      >
        {{ '补充地址' }}
      </van-button>
      <!--      <van-button type="default" round plain hairline size="small"-->
      <!--                  v-if="model.orderStatus === 'shipped_awaiting_receipt'">-->
      <!--        {{ '查看物流' }}-->
      <!--      </van-button>-->
      <van-button v-if="model.orderStatus === 'shipped_awaiting_receipt'" hairline plain round size="small"
                  type="success"
                  @click="trackingNumberShow = true">
        {{ '查看单号' }}
      </van-button>
      <van-button type="success" round plain hairline size="small"
                  @click="onConfirm"
                  v-if="model.orderStatus === 'shipped_awaiting_receipt'">
        {{ '确认收货' }}
      </van-button>
      <van-button type="success" round plain hairline size="small"
                  @click="onShow('turnActionShow')"
                  v-if="model.orderStatus === 'received_awaiting_return'">{{ '去寄回' }}
      </van-button>
      <van-button type="success" round plain hairline size="small"
                  @click="onShow('feedbackActionShow')"
                  v-if="model.orderStatus === 'returned'">{{
          '补充返图宣发'
        }}
      </van-button>
      <van-button v-if="model.orderStatus === 'locked'" hairline plain round size="small" type="danger"
                  @click="onClose">{{
          '取消订单'
        }}
      </van-button>
      <van-button type="primary" round plain hairline size="small" @click="onShow('orderEditShow')"
                  v-if="model.orderStatus === 'locked'">{{
          '修改订单'
        }}
      </van-button>
    </div>

    <van-action-sheet v-model:show="trackingNumberShow" title="查看物流单号">
      <div class="tracking-number">
        <div>{{ model.order.shipmentTrackingNo }}</div>
        <van-button v-copyText="model.order.shipmentTrackingNo" v-copyText:callback="copyTextSuccess" hairline plain
                    round size="small"
                    type="primary"
        >{{
            '复制'
          }}
        </van-button>
      </div>
    </van-action-sheet>

    <van-action-sheet v-model:show="addressEditShow" title="补充收件地址">
      <van-address-edit
          :area-columns-placeholder="['请选择', '请选择', '请选择']"
          :area-list="areaList"
          @save="onAddressSave"
      />
    </van-action-sheet>

    <van-action-sheet v-model:show="turnActionShow" title="首饰寄回">
      <div class="turn-container">
        <div class="address">
          <el-descriptions title="寄回地址信息" :column="1">
            <el-descriptions-item label="收件人">{{ form.tripInfo.senderName }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ form.tripInfo.senderPhone }}</el-descriptions-item>
            <el-descriptions-item label="地址">{{ form.tripInfo.senderAddress }}</el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="sku-container">
          <div class="header">
            <div class="title">选择寄回的首饰</div>
            <van-checkbox v-model="checkAll">全选</van-checkbox>
          </div>
          <div class="skus">
            <van-card
                v-for="jewel in turnList"
                :centered="true"
                :thumb="jewel.imageUrl"
                :title="jewel.jewelName"
                class="sku-card"
            >
              <template #footer>
                <van-checkbox class="checkbox" :disabled="jewel.disable" v-model="jewel.selected"></van-checkbox>
              </template>
            </van-card>
          </div>
          <div>共{{ turnList.filter(item => item.selected).length }}件</div>
        </div>
        <van-field v-model="returnShipmentTrackingNo" label="快递单号" placeholder="请输入寄回快递单号"/>
        <van-button type="primary" @click="onReturnSubmit">提交</van-button>
      </div>
    </van-action-sheet>

    <van-action-sheet v-model:show="feedbackActionShow" title="返图宣发">
      <div class="feed-container">
        <van-form @submit="onFeedbackSubmit">
          <van-cell-group inset>
            <van-field
                v-model="form.promotionLink"
                name="宣发链接"
                label="宣发链接"
                placeholder="请输入宣发链接"
                :rules="[{ required: true, message: '请输入宣发链接' }]"
            />
            <van-field name="uploader" label="返图上传">
              <template #input>
                <VantImageUpload :limit="9" v-model="form.returnPhoto"></VantImageUpload>
              </template>
            </van-field>
          </van-cell-group>
          <div style="margin: 16px;">
            <van-button round block type="primary" native-type="submit">
              提交
            </van-button>
          </div>
        </van-form>
      </div>
    </van-action-sheet>

    <JewelReserveAction v-model="choseJewelList" v-model:form-data="form"
                        v-model:show="orderEditShow"></JewelReserveAction>
  </div>
</template>

<script setup name="UserOrderCard">
import {defineEmits, defineModel} from 'vue';
import {areaList} from "@vant/area-data";
import {
  addOrderManagement,
  delOrderManagement,
  getOrderManagement,
  updateOrderManagement
} from "@/api/order/orderManagement.js";
import VantImageUpload from "@/components/VantImageUpload";
import {showConfirmDialog, showToast} from "vant";
import {addLogistics} from "@/api/logistics/logistics.js";
import JewelReserveAction from "@/views/loya/jewelmall/JewelReserveAction.vue";
import {selectDictLabel} from "@/utils/ruoyi.js";

const {proxy} = getCurrentInstance();
const {order_status, logistics_status} = proxy.useDict('order_status', 'logistics_status');
const {jewel_category} = proxy.useDict('jewel_category');
const model = defineModel()
const orderEditShow = ref(false)
const addressEditShow = ref(false)
const turnActionShow = ref(false)
const feedbackActionShow = ref(false)
const trackingNumberShow = ref(false)
const returnShipmentTrackingNo = ref(null)
const form = ref({})
const emit = defineEmits(['refresh']);
const turnList = reactive(
    model.value.jewels.map(jewel => ({
      ...jewel,
      disable: false,
      selected: true, // 动态添加 selected 属性
    }))
);
const choseJewelList = reactive(
    turnList.filter(item => item.selected).map(jewel => ({
      ...jewel,
    }))
);

function onShow(status) {
  getOrderManagement(model.value.orderId).then(res => {
    form.value = res.data
    if (status === 'addressEditShow') {
      addressEditShow.value = true
    }
    if (status === 'turnActionShow') {
      turnActionShow.value = true
      let turnInfo = res.data.turnInfo.map(item => item.jewelIds.filter(j => !item.exceptJewelIds.includes(j))).flat()
      console.log(turnInfo)
      turnList.forEach(item => {
        if (turnInfo.includes(item.jewelId + '')) {
          item.disable = true
        }
      })
    }
    if (status === 'feedbackActionShow') {
      feedbackActionShow.value = true
    }
    if (status === 'orderEditShow') {
      orderEditShow.value = true
    }
  })
}

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
    emit('refresh');
  });
}

function copyTextSuccess() {
  showToast('已复制');
}

const checkAll = computed({
  get: () => {
    return turnList.filter(jewel => !jewel.disable).every(jewel => jewel.selected)
  },
  set: (value) => {
    turnList.filter(jewel => !jewel.disable).forEach(jewel => {
      jewel.selected = value;
    });
  }
});

// 确认收货
function onConfirm() {
  showConfirmDialog({
    title: '确认收货？',
    message: '请检查包装是否完好，首饰数量与订单数量是否一致',
  }).then(() => {
    updateOrderManagement(model.value).then(response => {
      showToast('确认完成');
      emit('refresh');
    });
  }).catch(() => {
  });
}

// 确认收货
function onClose() {
  showConfirmDialog({
    title: '确认关闭订单？'
  }).then(() => {
    delOrderManagement(model.value.orderId).then(response => {
      showToast('订单已关闭');
      emit('refresh');
    });
  }).catch(() => {
  });
}

function onReturnSubmit() {
  if (!returnShipmentTrackingNo.value) {
    showToast('请填写物流单号');
    return
  }

  form.value.returnShipmentTrackingNo.push(returnShipmentTrackingNo.value)
  // 创建物流单
  let turnInfo = form.value.tripInfo
  turnInfo.logisticsId = null
  turnInfo.direction = 'turn'
  turnInfo.trackingNumber = returnShipmentTrackingNo.value
  turnInfo.recipientAddress = form.value.tripInfo.senderAddress
  turnInfo.recipientPhone = form.value.tripInfo.senderPhone
  turnInfo.recsenderName = form.value.tripInfo.senderName
  turnInfo.jewelIds = turnList.filter(item => item.selected && !item.disable).map(item => item.jewelId)
  addLogistics(turnInfo).then(response => {
    updateOrderManagement(form.value).then(response => {
      showToast('寄回完成');
      turnActionShow.value = false;
      emit('refresh');
    });
  });

}

function onFeedbackSubmit() {
  updateOrderManagement(form.value).then(response => {
    showToast('返图完成');
    feedbackActionShow.value = false;
    emit('refresh');
  });
}

function onDownLoadCaseImage() {
  turnList.forEach(item => {
    fetch(item.imageUrl.replace("preview_", ""))
        .then(response => response.blob())
        .then(blob => {
          saveAs(blob, item.imageUrl.substring(item.imageUrl.lastIndexOf('/') + 1).replace("preview_", ""));
        })
        .catch(e => console.error('图片下载失败:', e));
  })
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

.turn-container {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  .skus {
    max-height: 250px;
    overflow-y: auto;
  }

  .checkbox {
    position: absolute;
    right: 5%;
    top: 40%;
  }
}

.tracking-number {
  display: flex;
  flex-direction: row;
  padding: 20px 30px;
  justify-content: space-between;
  align-items: center;
  font-size: 22px;
}
</style>