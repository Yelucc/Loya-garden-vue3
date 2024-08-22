<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryRef" :inline="true" :model="queryParams" label-width="auto">
      <el-form-item label="首饰名称" prop="jewelName">
        <el-input
            v-model="queryParams.jewelName"
            clearable
            placeholder="请输入首饰名称"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="首饰分类" prop="category">
        <el-select v-model="queryParams.category" clearable placeholder="请选择首饰分类" style="width: 120px">
          <el-option
              v-for="dict in jewel_category"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="首饰预定状态" prop="reservationStatus">
        <el-select v-model="queryParams.reservationStatus" clearable placeholder="请选择首饰预定状态"
                   style="width: 120px">
          <el-option
              v-for="dict in jewel_reservation_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="预计寄回时间" prop="expectedReturnTime">
        <el-date-picker v-model="queryParams.expectedReturnTime"
                        clearable
                        placeholder="请选择预计寄回时间"
                        type="date"
                        value-format="YYYY-MM-DD">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button icon="Search" type="primary" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            v-hasPermi="['jewel:jewelcase:add']"
            icon="Plus"
            plain
            type="primary"
            @click="handleAdd"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            v-hasPermi="['jewel:jewelcase:edit']"
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
            v-hasPermi="['jewel:jewelcase:remove']"
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
            v-hasPermi="['jewel:jewelcase:export']"
            icon="Download"
            plain
            type="warning"
            @click="handleExport"
        >导出
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="jewelcaseList" @selection-change="handleSelectionChange">
      <el-table-column align="center" type="selection" width="55"/>
      <el-table-column align="center" label="首饰ID" prop="jewelId"/>
      <el-table-column align="center" label="首饰名称" prop="jewelName"/>
      <el-table-column align="center" label="首饰分类" prop="category">
        <template #default="scope">
          <dict-tag :options="jewel_category" :value="scope.row.category"/>
        </template>
      </el-table-column>
      <el-table-column align="center" label="首饰图片地址" prop="imageUrl" width="100">
        <template #default="scope">
          <image-preview :height="50" :src="scope.row.imageUrl" :width="50"/>
        </template>
      </el-table-column>
      <el-table-column align="center" label="首饰预定状态 " prop="reservationStatus">
        <template #default="scope">
          <dict-tag :options="jewel_reservation_status" :value="scope.row.reservationStatus"/>
        </template>
      </el-table-column>
      <el-table-column align="center" label="预计寄回时间" prop="expectedReturnTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.expectedReturnTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" class-name="small-padding fixed-width" label="操作">
        <template #default="scope">
          <el-button v-hasPermi="['jewel:jewelcase:edit']" icon="Edit" link type="primary"
                     @click="handleUpdate(scope.row)">修改
          </el-button>
          <el-button v-hasPermi="['jewel:jewelcase:remove']" icon="Delete" link type="primary"
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

    <!-- 添加或修改首饰管理对话框 -->
    <el-dialog v-model="open" :title="title" append-to-body width="500px">
      <el-form ref="jewelcaseRef" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="首饰名称" prop="jewelName">
          <el-input v-model="form.jewelName" placeholder="请输入首饰名称"/>
        </el-form-item>
        <el-form-item label="首饰分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择首饰分类">
            <el-option
                v-for="dict in jewel_category"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="首饰图片地址" prop="imageUrl">
          <image-upload v-model="form.imageUrl"/>
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

<script name="Jewelcase" setup>
import {addJewelcase, delJewelcase, getJewelcase, listJewelcase, updateJewelcase} from "@/api/jewel/jewelcase";

const {proxy} = getCurrentInstance();
const {jewel_category, jewel_reservation_status} = proxy.useDict('jewel_category', 'jewel_reservation_status');

const jewelcaseList = ref([]);
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
    category: null,
    jewelName: null,
    imageUrl: null,
    reservationStatus: null,
    expectedReturnTime: null,
  },
  rules: {
    jewelName: [
      {required: true, message: "首饰名称不能为空", trigger: "change"}
    ],
    category: [
      {required: true, message: "首饰分类不能为空", trigger: "change"}
    ],
    imageUrl: [
      {required: true, message: "首饰图片地址不能为空", trigger: "blur"}
    ],
  }
});

const {queryParams, form, rules} = toRefs(data);

/** 查询首饰管理列表 */
function getList() {
  loading.value = true;
  listJewelcase(queryParams.value).then(response => {
    jewelcaseList.value = response.rows;
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
    jewelId: null,
    jewelName: null,
    category: null,
    imageUrl: null,
    reservationStatus: null,
    expectedReturnTime: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  };
  proxy.resetForm("jewelcaseRef");
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
  ids.value = selection.map(item => item.jewelId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加首饰管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _jewelId = row.jewelId || ids.value
  getJewelcase(_jewelId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改首饰管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["jewelcaseRef"].validate(valid => {
    if (valid) {
      if (form.value.jewelId != null) {
        updateJewelcase(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addJewelcase(form.value).then(response => {
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
  const _jewelIds = row.jewelId || ids.value;
  proxy.$modal.confirm('是否确认删除首饰管理编号为"' + _jewelIds + '"的数据项？').then(function () {
    return delJewelcase(_jewelIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {
  });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('jewel/jewelcase/export', {
    ...queryParams.value
  }, `jewelcase_${new Date().getTime()}.xlsx`)
}

getList();
</script>
