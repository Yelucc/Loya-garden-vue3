<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryRef" :inline="true" :model="queryParams" label-width="auto">
      <el-form-item label="关联订单ID" prop="orderId">
        <el-input
            v-model="queryParams.orderId"
            clearable
            placeholder="请输入关联订单ID"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="关联首饰ID" prop="jewelIds">
        <el-input
            v-model="queryParams.jewelIds"
            clearable
            placeholder="请输入关联首饰ID"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="寄件人" prop="senderName">
        <el-input
            v-model="queryParams.senderName"
            clearable
            placeholder="请输入寄件人"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="收件人" prop="recipientName">
        <el-input
            v-model="queryParams.recipientName"
            clearable
            placeholder="请输入收件人"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="寄件电话" prop="senderPhone">
        <el-input
            v-model="queryParams.senderPhone"
            clearable
            placeholder="请输入寄件电话"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="收件电话" prop="recipientPhone">
        <el-input
            v-model="queryParams.recipientPhone"
            clearable
            placeholder="请输入收件电话"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="寄件地址" prop="senderAddress">
        <el-input
            v-model="queryParams.senderAddress"
            clearable
            placeholder="请输入寄件地址"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="收件地址" prop="recipientAddress">
        <el-input
            v-model="queryParams.recipientAddress"
            clearable
            placeholder="请输入收件地址"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button icon="Search" type="primary" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            v-hasPermi="['logistics:logistics:add']"
            icon="Plus"
            plain
            type="primary"
            @click="handleAdd"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            v-hasPermi="['logistics:logistics:edit']"
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
            v-hasPermi="['logistics:logistics:remove']"
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
            v-hasPermi="['logistics:logistics:export']"
            icon="Download"
            plain
            type="warning"
            @click="handleExport"
        >导出
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="logisticsList" @selection-change="handleSelectionChange">
      <el-table-column align="center" type="selection" width="55"/>
      <el-table-column align="center" label="物流单号" prop="trackingNumber"/>
      <el-table-column align="center" label="关联订单ID" prop="orderId"/>
      <el-table-column align="center" label="关联首饰ID" prop="jewelIds"/>
      <el-table-column align="center" label="寄件人" prop="senderName"/>
      <el-table-column align="center" label="收件人" prop="recipientName"/>
      <el-table-column align="center" label="寄件电话" prop="senderPhone"/>
      <el-table-column align="center" label="收件电话" prop="recipientPhone"/>
      <el-table-column align="center" label="寄件地址" prop="senderAddress"/>
      <el-table-column align="center" label="收件地址" prop="recipientAddress"/>
      <el-table-column align="center" class-name="small-padding fixed-width" label="操作">
        <template #default="scope">
          <el-button v-hasPermi="['logistics:logistics:edit']" icon="Edit" link type="primary"
                     @click="handleUpdate(scope.row)">修改
          </el-button>
          <el-button v-hasPermi="['logistics:logistics:remove']" icon="Delete" link type="primary"
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

    <!-- 添加或修改物流管理对话框 -->
    <el-dialog v-model="open" :title="title" append-to-body width="500px">
      <el-form ref="logisticsRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="关联订单ID" prop="orderId">
          <el-input v-model="form.orderId" placeholder="请输入关联订单ID"/>
        </el-form-item>
        <el-form-item label="关联多个首饰ID，用逗号分隔" prop="jewelIds">
          <el-input v-model="form.jewelIds" placeholder="请输入关联多个首饰ID，用逗号分隔"/>
        </el-form-item>
        <el-form-item label="寄件人" prop="senderName">
          <el-input v-model="form.senderName" placeholder="请输入寄件人"/>
        </el-form-item>
        <el-form-item label="收件人" prop="recipientName">
          <el-input v-model="form.recipientName" placeholder="请输入收件人"/>
        </el-form-item>
        <el-form-item label="寄件电话" prop="senderPhone">
          <el-input v-model="form.senderPhone" placeholder="请输入寄件电话"/>
        </el-form-item>
        <el-form-item label="收件电话" prop="recipientPhone">
          <el-input v-model="form.recipientPhone" placeholder="请输入收件电话"/>
        </el-form-item>
        <el-form-item label="寄件地址" prop="senderAddress">
          <el-input v-model="form.senderAddress" placeholder="请输入寄件地址"/>
        </el-form-item>
        <el-form-item label="收件地址" prop="recipientAddress">
          <el-input v-model="form.recipientAddress" placeholder="请输入收件地址"/>
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

<script name="Logistics" setup>
import {addLogistics, delLogistics, getLogistics, listLogistics, updateLogistics} from "@/api/logistics/logistics";

const {proxy} = getCurrentInstance();

const logisticsList = ref([]);
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
    orderId: null,
    jewelIds: null,
    senderName: null,
    recipientName: null,
    senderPhone: null,
    recipientPhone: null,
    senderAddress: null,
    recipientAddress: null,
  },
  rules: {
    orderId: [
      {required: true, message: "关联订单ID不能为空", trigger: "blur"}
    ],
    jewelIds: [
      {required: true, message: "关联多个首饰ID，用逗号分隔不能为空", trigger: "blur"}
    ],
    senderName: [
      {required: true, message: "寄件人不能为空", trigger: "blur"}
    ],
    recipientName: [
      {required: true, message: "收件人不能为空", trigger: "blur"}
    ],
    senderPhone: [
      {required: true, message: "寄件电话不能为空", trigger: "blur"}
    ],
    recipientPhone: [
      {required: true, message: "收件电话不能为空", trigger: "blur"}
    ],
    senderAddress: [
      {required: true, message: "寄件地址不能为空", trigger: "blur"}
    ],
    recipientAddress: [
      {required: true, message: "收件地址不能为空", trigger: "blur"}
    ],
  }
});

const {queryParams, form, rules} = toRefs(data);

/** 查询物流管理列表 */
function getList() {
  loading.value = true;
  listLogistics(queryParams.value).then(response => {
    logisticsList.value = response.rows;
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
    trackingNumber: null,
    orderId: null,
    jewelIds: null,
    senderName: null,
    recipientName: null,
    senderPhone: null,
    recipientPhone: null,
    senderAddress: null,
    recipientAddress: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  };
  proxy.resetForm("logisticsRef");
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
  ids.value = selection.map(item => item.trackingNumber);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加物流管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _trackingNumber = row.trackingNumber || ids.value
  getLogistics(_trackingNumber).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改物流管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["logisticsRef"].validate(valid => {
    if (valid) {
      if (form.value.trackingNumber != null) {
        updateLogistics(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addLogistics(form.value).then(response => {
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
  const _trackingNumbers = row.trackingNumber || ids.value;
  proxy.$modal.confirm('是否确认删除物流管理编号为"' + _trackingNumbers + '"的数据项？').then(function () {
    return delLogistics(_trackingNumbers);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {
  });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('logistics/logistics/export', {
    ...queryParams.value
  }, `logistics_${new Date().getTime()}.xlsx`)
}

getList();
</script>
