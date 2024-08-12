<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryRef" :inline="true" :model="queryParams" label-width="68px">
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
      <el-form-item label="返图时间" prop="returnPhotoTime">
        <el-date-picker v-model="queryParams.returnPhotoTime"
                        clearable
                        placeholder="请选择返图时间"
                        type="date"
                        value-format="YYYY-MM-DD">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="露出方式" prop="exposureMethod">
        <el-input
            v-model="queryParams.exposureMethod"
            clearable
            placeholder="请输入露出方式"
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
      <el-form-item label="预计使用时长 (天)" prop="expectedUsageDuration">
        <el-input
            v-model="queryParams.expectedUsageDuration"
            clearable
            placeholder="请输入预计使用时长 (天)"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="寄出物流单号" prop="shipmentTrackingNo">
        <el-input
            v-model="queryParams.shipmentTrackingNo"
            clearable
            placeholder="请输入寄出物流单号"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="送达日期" prop="arrivalDate">
        <el-date-picker v-model="queryParams.arrivalDate"
                        clearable
                        placeholder="请选择送达日期"
                        type="date"
                        value-format="YYYY-MM-DD">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="寄返物流单号" prop="returnShipmentTrackingNo">
        <el-input
            v-model="queryParams.returnShipmentTrackingNo"
            clearable
            placeholder="请输入寄返物流单号"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="寄回时间" prop="returnDate">
        <el-date-picker v-model="queryParams.returnDate"
                        clearable
                        placeholder="请选择寄回时间"
                        type="date"
                        value-format="YYYY-MM-DD">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="订单返图" prop="returnPhoto">
        <el-input
            v-model="queryParams.returnPhoto"
            clearable
            placeholder="请输入订单返图"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="宣发链接" prop="promotionLink">
        <el-input
            v-model="queryParams.promotionLink"
            clearable
            placeholder="请输入宣发链接"
            @keyup.enter="handleQuery"
        />
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
      <el-table-column align="center" label="关联首饰编码" prop="jewelCode"/>
      <el-table-column align="center" label="艺人" prop="artistName"/>
      <el-table-column align="center" label="用途" prop="purpose"/>
      <el-table-column align="center" label="返图时间" prop="returnPhotoTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.returnPhotoTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="露出方式" prop="exposureMethod"/>
      <el-table-column align="center" label="需求送达日期" prop="deliveryDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.deliveryDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="预计使用时长 (天)" prop="expectedUsageDuration"/>
      <el-table-column align="center" label="寄出物流单号" prop="shipmentTrackingNo"/>
      <el-table-column align="center" label="送达日期" prop="arrivalDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.arrivalDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="寄返物流单号" prop="returnShipmentTrackingNo"/>
      <el-table-column align="center" label="寄回时间" prop="returnDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.returnDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="订单返图" prop="returnPhoto"/>
      <el-table-column align="center" label="宣发链接" prop="promotionLink"/>
      <el-table-column align="center" label="订单流程" prop="orderStatus">
        <template #default="scope">
          <dict-tag :options="order_status" :value="scope.row.orderStatus"/>
        </template>
      </el-table-column>
      <el-table-column align="center" class-name="small-padding fixed-width" label="操作">
        <template #default="scope">
          <el-button v-hasPermi="['order:orderManagement:edit']" icon="Edit" link type="primary"
                     @click="handleUpdate(scope.row)">修改
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

    <!-- 添加或修改订单管理对话框 -->
    <el-dialog v-model="open" :title="title" append-to-body width="500px">
      <el-form ref="orderManagementRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="关联首饰编码" prop="jewelCode">
          <el-input v-model="form.jewelCode" placeholder="请输入关联首饰编码"/>
        </el-form-item>
        <el-form-item label="艺人" prop="artistName">
          <el-input v-model="form.artistName" placeholder="请输入艺人"/>
        </el-form-item>
        <el-form-item label="用途" prop="purpose">
          <el-input v-model="form.purpose" placeholder="请输入内容" type="textarea"/>
        </el-form-item>
        <el-form-item label="返图时间" prop="returnPhotoTime">
          <el-date-picker v-model="form.returnPhotoTime"
                          clearable
                          placeholder="请选择返图时间"
                          type="date"
                          value-format="YYYY-MM-DD">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="露出方式" prop="exposureMethod">
          <el-input v-model="form.exposureMethod" placeholder="请输入露出方式"/>
        </el-form-item>
        <el-form-item label="需求送达日期" prop="deliveryDate">
          <el-date-picker v-model="form.deliveryDate"
                          clearable
                          placeholder="请选择需求送达日期"
                          type="date"
                          value-format="YYYY-MM-DD">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="预计使用时长 (天)" prop="expectedUsageDuration">
          <el-input v-model="form.expectedUsageDuration" placeholder="请输入预计使用时长 (天)"/>
        </el-form-item>
        <el-form-item label="寄出物流单号" prop="shipmentTrackingNo">
          <el-input v-model="form.shipmentTrackingNo" placeholder="请输入寄出物流单号"/>
        </el-form-item>
        <el-form-item label="送达日期" prop="arrivalDate">
          <el-date-picker v-model="form.arrivalDate"
                          clearable
                          placeholder="请选择送达日期"
                          type="date"
                          value-format="YYYY-MM-DD">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="寄返物流单号" prop="returnShipmentTrackingNo">
          <el-input v-model="form.returnShipmentTrackingNo" placeholder="请输入寄返物流单号"/>
        </el-form-item>
        <el-form-item label="寄回时间" prop="returnDate">
          <el-date-picker v-model="form.returnDate"
                          clearable
                          placeholder="请选择寄回时间"
                          type="date"
                          value-format="YYYY-MM-DD">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="订单返图" prop="returnPhoto">
          <el-input v-model="form.returnPhoto" placeholder="请输入订单返图"/>
        </el-form-item>
        <el-form-item label="宣发链接" prop="promotionLink">
          <el-input v-model="form.promotionLink" placeholder="请输入宣发链接"/>
        </el-form-item>
        <el-form-item label="订单流程" prop="orderStatus">
          <el-select v-model="form.orderStatus" placeholder="请选择订单流程">
            <el-option
                v-for="dict in order_status"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
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

const {proxy} = getCurrentInstance();
const {order_status} = proxy.useDict('order_status');

const orderManagementList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
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
  },
  rules: {
    jewelCode: [
      {required: true, message: "关联首饰编码不能为空", trigger: "blur"}
    ],
    artistName: [
      {required: true, message: "艺人不能为空", trigger: "blur"}
    ],
    purpose: [
      {required: true, message: "用途不能为空", trigger: "blur"}
    ],
    orderStatus: [
      {required: true, message: "订单流程不能为空", trigger: "change"}
    ],
  }
});

const {queryParams, form, rules} = toRefs(data);

/** 查询订单管理列表 */
function getList() {
  loading.value = true;
  listOrderManagement(queryParams.value).then(response => {
    orderManagementList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
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
    title.value = "修改订单管理";
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
