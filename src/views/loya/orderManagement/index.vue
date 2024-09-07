<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryRef" :inline="true" :model="queryParams" label-width="auto">
      <el-form-item label="关联首饰编码" prop="jewelCode">
        <el-input
            v-model="queryParams.jewelCode"
            clearable
            placeholder="请输入关联首饰编码"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="艺人" prop="artistName">
        <el-input
            v-model="queryParams.artistName"
            clearable
            placeholder="请输入艺人"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="需求送达日期" prop="deliveryDate">
        <el-date-picker v-model="queryParams.deliveryDate"
                        clearable
                        placeholder="请选择需求送达日期"
                        type="date"
                        value-format="YYYY-MM-DD">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="订单流程" prop="orderStatus">
        <el-select v-model="queryParams.orderStatus" clearable placeholder="请选择订单流程">
          <el-option
              v-for="dict in order_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button icon="Search" type="primary" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            v-hasPermi="['order:orderManagement:add']"
            icon="Plus"
            plain
            type="primary"
            @click="handleAdd"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            v-hasPermi="['order:orderManagement:edit']"
            :disabled="single"
            icon="Edit"
            plain
            type="success"
            @click="handleUpdate"
        >修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            v-hasPermi="['order:orderManagement:remove']"
            :disabled="multiple"
            icon="Delete"
            plain
            type="danger"
            @click="handleDelete"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            v-hasPermi="['order:orderManagement:export']"
            icon="Download"
            plain
            type="warning"
            @click="handleExport"
        >导出
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="orderManagementList" @selection-change="handleSelectionChange">
      <el-table-column align="center" type="selection" width="55"/>
      <el-table-column align="center" label="订单ID" prop="orderId"/>
      <!--      <el-table-column align="center" label="关联首饰编码" prop="jewelCode"/>-->
      <el-table-column align="center" label="艺人" prop="artistName"/>
      <el-table-column align="center" label="用途" prop="purpose"/>
      <!--      <el-table-column align="center" label="返图时间" prop="returnPhotoTime" width="180">-->
      <!--        <template #default="scope">-->
      <!--          <span>{{ parseTime(scope.row.returnPhotoTime, '{y}-{m}-{d}') }}</span>-->
      <!--        </template>-->
      <!--      </el-table-column>-->
      <!--      <el-table-column align="center" label="露出方式" prop="exposureMethod"/>-->
      <el-table-column align="center" label="需求送达日期" prop="deliveryDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.deliveryDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <!--      <el-table-column align="center" label="预计使用时长 (天)" prop="expectedUsageDuration"/>-->
      <!--      <el-table-column align="center" label="寄出物流单号" prop="shipmentTrackingNo"/>-->
      <!--      <el-table-column align="center" label="送达日期" prop="arrivalDate" width="180">-->
      <!--        <template #default="scope">-->
      <!--          <span>{{ parseTime(scope.row.arrivalDate, '{y}-{m}-{d}') }}</span>-->
      <!--        </template>-->
      <!--      </el-table-column>-->
      <!--      <el-table-column align="center" label="寄返物流单号" prop="returnShipmentTrackingNo"/>-->
      <!--      <el-table-column align="center" label="寄回时间" prop="returnDate" width="180">-->
      <!--        <template #default="scope">-->
      <!--          <span>{{ parseTime(scope.row.returnDate, '{y}-{m}-{d}') }}</span>-->
      <!--        </template>-->
      <!--      </el-table-column>-->
      <!--      <el-table-column align="center" label="订单返图" prop="returnPhoto"/>-->
      <!--      <el-table-column align="center" label="宣发链接" prop="promotionLink"/>-->
      <el-table-column align="center" label="订单流程" prop="orderStatus">
        <template #default="scope">
          <dict-tag :options="order_status" :value="scope.row.orderStatus"/>
        </template>
      </el-table-column>
      <el-table-column align="center" class-name="small-padding fixed-width" label="操作">
        <template #default="scope">
          <el-button v-hasPermi="['order:orderManagement:edit']" icon="Edit" link type="primary"
                     @click="handleUpdate(scope.row)">查看
          </el-button>
          <el-button v-hasPermi="['order:orderManagement:remove']" icon="Delete" link type="primary"
                     @click="handleDelete(scope.row)">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
        v-show="total>0"
        v-model:limit="queryParams.pageSize"
        v-model:page="queryParams.pageNum"
        :total="total"
        @pagination="getList"
    />


    <el-drawer
        v-model="open"
        :title="title"
        direction="rtl"
    >
      <el-form ref="orderManagementRef" :model="form" :rules="rules" label-width="auto">
        <el-descriptions :column="1">
          <el-descriptions-item label="艺人">{{ form.artistName }}</el-descriptions-item>
          <el-descriptions-item label="活动内容">{{ form.purpose }}</el-descriptions-item>
          <el-descriptions-item label="需求送达时间">{{ form.deliveryDate }}</el-descriptions-item>
          <el-descriptions-item label="预计使用时长">{{ form.expectedUsageDuration }}</el-descriptions-item>
          <el-descriptions-item label="预定首饰清单">
            <div class="jewel-box">
              <van-card
                  v-for="jewel in form.jewels"
                  :centered="true"
                  :thumb="jewel.imageUrl"
                  :title="jewel.jewelName"
                  class="sku-card"
              >
              </van-card>
              <div>共{{ form.jewels.length }}件</div>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="流程状态">
            <div class="order-status">
              <div class="step">
                <el-steps
                    direction="vertical"
                    finish-status="success"
                    :active="order_status.map(item=>item.value).indexOf(form.orderStatus)"
                >
                  <el-step :title="dict.label" :name="dict.value" v-for="dict in order_status" :key="dict"/>
                </el-steps>
              </div>
              <div class="panel">
                <!--              TODO 增加一键复制地址信息功能-->
                <div class="locked" v-if="form.orderStatus === 'locked'">
                  <el-descriptions title="客户已补充地址信息：" :column="1">
                    <el-descriptions-item label="收件人">{{ form.tripInfo.recipientName }}</el-descriptions-item>
                    <el-descriptions-item label="联系电话">{{ form.tripInfo.recipientPhone }}</el-descriptions-item>
                    <el-descriptions-item label="地址">{{ form.tripInfo.recipientAddress }}</el-descriptions-item>
                  </el-descriptions>
                  <el-button type="primary" round @click="submitForm">确认</el-button>
                </div>
                <div class="pending_shipment" v-if="form.orderStatus === 'pending_shipment'">
                  <el-descriptions title="客户已补充地址信息：" :column="1">
                    <el-descriptions-item label="收件人">{{ form.tripInfo.recipientName }}</el-descriptions-item>
                    <el-descriptions-item label="联系电话">{{ form.tripInfo.recipientPhone }}</el-descriptions-item>
                    <el-descriptions-item label="地址">{{ form.tripInfo.recipientAddress }}</el-descriptions-item>
                  </el-descriptions>
                  <!--                TODO 图片识别快递单号-->
                  <el-form-item label="寄出物流单号" prop="shipmentTrackingNo">
                    <el-input v-model="form.shipmentTrackingNo" placeholder="请输入寄出物流单号"/>
                  </el-form-item>
                  <el-form-item label="寄件人" prop="senderName">
                    <el-input v-model="form.tripInfo.senderName" placeholder="寄件人"/>
                  </el-form-item>
                  <el-form-item label="联系电话" prop="senderPhone">
                    <el-input v-model="form.tripInfo.senderPhone" placeholder="联系电话"/>
                  </el-form-item>
                  <el-form-item label="寄出地址" prop="senderAddress">
                    <el-input v-model="form.tripInfo.senderAddress" placeholder="寄出地址"/>
                  </el-form-item>


                  <el-button type="primary" round @click="submitForm">确认</el-button>
                </div>

                <div v-if=" ['shipped_awaiting_receipt','received_awaiting_return'].includes(form.orderStatus)"
                     class="shipped_awaiting_receipt">
                  <el-descriptions :column="1" title="快递面单信息">
                    <el-descriptions-item label="收件人">{{ form.tripInfo.recipientName }}</el-descriptions-item>
                    <el-descriptions-item label="联系电话">{{ form.tripInfo.recipientPhone }}</el-descriptions-item>
                    <el-descriptions-item label="地址">{{ form.tripInfo.recipientAddress }}</el-descriptions-item>
                    <el-descriptions-item label="寄出物流单号">{{ form.shipmentTrackingNo }}</el-descriptions-item>
                    <el-descriptions-item label="寄件人">{{ form.tripInfo.senderName }}</el-descriptions-item>
                    <el-descriptions-item label="寄件人联系电话">{{ form.tripInfo.senderPhone }}</el-descriptions-item>
                    <el-descriptions-item label="寄出地址">{{ form.tripInfo.senderAddress }}</el-descriptions-item>
                  </el-descriptions>
                </div>

                <div v-if="form.orderStatus === 'return_awaiting_check'" class="return_awaiting_check">
                  <div class="tracking_number">
                    <el-descriptions v-for="turnInfo in form.turnInfo" :column="1" style="margin-bottom: 20px"
                                     title="寄回面单信息">
                      <el-descriptions-item label="寄出物流单号">
                        <div style="font-size: 22px">{{ turnInfo.trackingNumber }}</div>
                        <el-link v-copyText="turnInfo.trackingNumber" v-copyText:callback="copyTextSuccess" :underline="false"
                                 icon="DocumentCopy" style="float:right">&nbsp;复制
                        </el-link>
                      </el-descriptions-item>
                      <el-descriptions-item label="本单状态">
                        <dict-tag :options="logistics_status" :value="turnInfo.confirmStatus"/>
                      </el-descriptions-item>
                      <el-descriptions-item label="寄回首饰">
                        <div class="jewel-box">
                          <van-card
                              v-for="jewel in form.jewels.filter(item=>turnInfo.jewelIds.includes(item.jewelId+''))"
                              :centered="true"
                              :thumb="jewel.imageUrl"
                              :title="jewel.jewelName"
                              class="sku-card"
                          >
                          </van-card>
                          <div>共{{
                              form.jewels.filter(item => turnInfo.jewelIds.includes(item.jewelId + '')).length
                            }}件
                          </div>
                        </div>
                      </el-descriptions-item>
                      <el-descriptions-item label="寄件人">{{ turnInfo.recipientName }}</el-descriptions-item>
                      <el-descriptions-item label="寄件人联系电话">{{ turnInfo.recipientPhone }}</el-descriptions-item>
                      <el-descriptions-item label="寄出地址">{{ turnInfo.recipientAddress }}</el-descriptions-item>
                      <el-descriptions-item label="操作">
                        <el-button :disabled="turnInfo.confirmStatus!=='Wait'" round type="primary"
                                   @click="handleOnPass(turnInfo)">确认收到
                        </el-button>
                        <el-button :disabled="turnInfo.confirmStatus!=='Wait'" round type="primary"
                                   @click="handleOnExecept(turnInfo)">异常处理
                        </el-button>
                      </el-descriptions-item>
                    </el-descriptions>
                  </div>
                </div>
              </div>
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </el-form>
    </el-drawer>


    <!-- 异常物流管理对话框 -->
    <el-dialog v-model="exceptOpen" append-to-body title="异常物流" width="800px">
      <el-form ref="logisticsRef" :model="logisticsForm" :rules="exceptRules" label-width="auto">
        <el-form-item label="异常首饰" prop="exceptJewelIds">
          <div class="skus">
            <van-card
                v-for="jewel in turnList.filter(item=>logisticsForm.jewelIds?.includes(item.jewelId+''))"
                :centered="true"
                :thumb="jewel.imageUrl"
                :title="jewel.jewelName"
                class="sku-card"
            >
              <template #footer>
                <van-checkbox v-model="jewel.selected" :disabled="jewel.disable" class="checkbox"/>
              </template>
            </van-card>
          </div>

        </el-form-item>
        <el-form-item label="异常原因" prop="exceptDesc">
          <el-input v-model="logisticsForm.exceptDesc" placeholder="请输入异常原因" type="textarea"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitExcept">提交异常</el-button>
          <el-button @click=" exceptOpen=false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script name="OrderManagement" setup>
import {
  addOrderManagement,
  delOrderManagement,
  getOrderManagement,
  listOrderManagement,
  updateOrderManagement
} from "@/api/order/orderManagement";
import {updateLogistics} from "@/api/logistics/logistics.js";

const {proxy} = getCurrentInstance();
const {order_status, logistics_status} = proxy.useDict('order_status', 'logistics_status');

const orderManagementList = ref([]);
const open = ref(false);
const exceptOpen = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const exceptJewelList = ref([])

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    jewelCode: null,
    artistName: null,
    purpose: null,
    jewels: [],
    returnPhotoTime: null,
    exposureMethod: null,
    deliveryDate: null,
    expectedUsageDuration: null,
    shipmentTrackingNo: null,
    arrivalDate: null,
    returnShipmentTrackingNo: null,
    returnDate: null,
    returnPhoto: null,
    promotionLink: null,
    tripInfo: {},
    turnInfo: {},
    orderStatus: null,
  },
  rules: {
    jewelCode: [
      {required: true, message: "关联首饰编码不能为空", trigger: "submit"}
    ],
    artistName: [
      {required: true, message: "艺人不能为空", trigger: "submit"}
    ],
    purpose: [
      {required: true, message: "用途不能为空", trigger: "submit"}
    ],
    orderStatus: [
      {required: true, message: "订单流程不能为空", trigger: "submit"}
    ],
  },
  exceptRules: {
    exceptJewelIds: [
      {required: true, message: "异常首饰不能为空", trigger: "submit"}
    ],
    exceptDesc: [
      {required: true, message: "异常原因不能为空", trigger: "submit"}
    ],
  }
});

const {queryParams, form, rules, exceptRules} = toRefs(data);
const logisticsForm = ref({})
const turnList = ref([])


function submitExcept() {
  logisticsForm.value.exceptJewelIds = turnList.value.filter(j => j.selected).map(j => j.jewelId + '')
  proxy.$refs["logisticsRef"].validate(valid => {
    if (valid) {
      updateLogistics(logisticsForm.value).then(response => {
        proxy.$modal.msgSuccess("提交成功");
        exceptOpen.value = false;
        logisticsForm.value = {}
      });
    }
  });
}

/** 查询订单管理列表 */
function getList() {
  loading.value = true;
  listOrderManagement(queryParams.value).then(response => {
    orderManagementList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

/** 复制代码成功 */
function copyTextSuccess() {
  proxy.$modal.msgSuccess("复制成功");
}

/** 复制代码成功 */
function handleOnPass(data) {
  logisticsForm.value = data
  logisticsForm.value.confirmStatus = "Pass"
  updateLogistics(logisticsForm.value).then(response => {
    proxy.$modal.msgSuccess("确认成功");
    exceptOpen.value = false;
    logisticsForm.value = {}
  });
}

/** 复制代码成功 */
function handleOnExecept(data) {
  logisticsForm.value = data
  turnList.value = form.value.jewels.filter(j => data.jewelIds.includes(j.jewelId + '')).map(jewel => ({
    ...jewel,
    disable: false,
    selected: false, // 动态添加 selected 属性
  }))
  exceptOpen.value = true
}

// 取消按钮
function cancel() {
  open.value = false;

  reset();
}

// 表单重置
function reset() {
  form.value = {
    orderId: null,
    jewelCode: null,
    artistName: null,
    purpose: null,
    returnPhotoTime: null,
    exposureMethod: null,
    deliveryDate: null,
    expectedUsageDuration: null,
    shipmentTrackingNo: null,
    arrivalDate: null,
    returnShipmentTrackingNo: null,
    returnDate: null,
    returnPhoto: null,
    promotionLink: null,
    orderStatus: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  };
  proxy.resetForm("orderManagementRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.orderId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加订单管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _orderId = row.orderId || ids.value
  getOrderManagement(_orderId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = `${form.value.artistName} 的订单 ${_orderId}`;
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["orderManagementRef"].validate(valid => {
    if (valid) {
      if (form.value.orderId != null) {
        updateOrderManagement(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addOrderManagement(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _orderIds = row.orderId || ids.value;
  proxy.$modal.confirm('是否确认删除订单管理编号为"' + _orderIds + '"的数据项？').then(function () {
    return delOrderManagement(_orderIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {
  });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('order/orderManagement/export', {
    ...queryParams.value
  }, `orderManagement_${new Date().getTime()}.xlsx`)
}

getList();
</script>

<style lang="scss" scoped>
.jewel-box {
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  flex-direction: column;
  height: 200px;
  overflow-y: auto;
}

.skus {
  display: flex;
  flex-direction: column;
  width: 100%;

  .checkbox {
    position: absolute;
    right: 5%;
    top: 40%;
  }
}

.order-status {
  width: 100%;
  display: flex;
  flex-direction: row;

  .step {
    height: 40vh;
  }

  .panel {
    height: 40vh;
    padding: 0 10px;
  }
}

</style>
