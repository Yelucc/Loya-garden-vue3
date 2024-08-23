<template>
  <div class="component-upload-image">
    <van-uploader
        ref="imageUpload"
        :after-read="handleAfterRead"
        :max-count="limit"
        v-model="fileList"
        :preview-size="80"
        :before-delete="handleDelete"
        :multiple="true"
    >
    </van-uploader>

    <!-- 上传提示 -->
    <div v-if="showTip" class="el-upload__tip">
      请上传
      <template v-if="fileSize">
        大小不超过 <b style="color: #f56c6c">{{ fileSize }}MB</b>
      </template>
      <template v-if="fileType">
        格式为 <b style="color: #f56c6c">{{ fileType.join("/") }}</b>
      </template>
      的文件
    </div>

    <van-dialog
        v-model:show="dialogVisible"
        title="预览"
        :show-cancel-button="false"
        :show-confirm-button="false"
    >
      <img :src="dialogImageUrl" style="display: block; max-width: 100%; margin: 0 auto"/>
    </van-dialog>
  </div>
</template>

<script setup name="VantImageUpload">
import { getToken } from "@/utils/auth";
import { ref, computed, watch, getCurrentInstance } from "vue";
import {closeToast, showFailToast, showLoadingToast} from "vant";
import axios from "axios";

const props = defineProps({
  modelValue: [String, Object, Array],
  limit: {
    type: Number,
    default: 1,
  },
  fileSize: {
    type: Number,
    default: 5,
  },
  fileType: {
    type: Array,
    default: () => ["png", "jpg", "jpeg"],
  },
  isShowTip: {
    type: Boolean,
    default: true,
  },
});

const { proxy } = getCurrentInstance();
const emit = defineEmits();
const uploadList = ref([]);
const dialogImageUrl = ref("");
const dialogVisible = ref(false);
const baseUrl = import.meta.env.VITE_APP_BASE_API;
const headers = ref({ Authorization: "Bearer " + getToken() });
const uploadImgUrl = ref(import.meta.env.VITE_APP_BASE_API + "/common/uploadMinio"); // 上传的图片服务器地址
const fileList = ref([]);
const saveFileList = ref([]);
const showTip = computed(
    () => props.isShowTip && (props.fileType || props.fileSize)
);

watch(() => props.modelValue, (val) => {
  if (val) {
    const list = Array.isArray(val) ? val : props.modelValue.split(",");
    saveFileList.value = list.map((item) => {
      if (typeof item === "string") {
        item = { url: item };
      }
      return item;
    });
  } else {
    saveFileList.value = [];
  }
}, { deep: true, immediate: true });

function handleAfterRead(file) {
  if (!validateFile(file)) {
    return false;
  }

  showLoadingToast({
    message: "正在上传图片，请稍候...",
    forbidClick: true,
  });

  uploadImage(file.file)
      .then((res) => {
        if (res.code === 200) {
          uploadList.value.push({ name: res.newFileName, url: res.url });
          uploadedSuccessfully();
          closeToast();
        } else {
          showFailToast(res.msg);
        }
      })
      .catch((err) => {
        console.log(err)
        showFailToast("上传图片失败");
      })
      .finally(() => {
      });
}

function validateFile(file) {
  const isImg = props.fileType.some((type) =>
      file.file.type.indexOf(type) > -1 || file.file.name.endsWith(type)
  );

  if (!isImg) {
    showFailToast(`文件格式不正确, 请上传${props.fileType.join("/")}图片格式文件!`);
    return false;
  }

  const isLt = file.file.size / 1024 / 1024 < props.fileSize;
  if (!isLt) {
    showFailToast(`上传头像图片大小不能超过 ${props.fileSize} MB!`);
    return false;
  }

  return true;
}

function handleDelete(file) {
  const index = fileList.value.indexOf(file);
  if (index !== -1) {
    fileList.value.splice(index, 1);
    saveFileList.value.splice(index, 1);
    emit("update:modelValue", listToString(fileList.value));
  }
  return true;
}

function uploadedSuccessfully() {
  if (uploadList.value.length > 0) {
    saveFileList.value = saveFileList.value.concat(uploadList.value);
    uploadList.value = [];
    emit("update:modelValue", listToString(saveFileList.value));
  }
}

function handlePictureCardPreview(file) {
  dialogImageUrl.value = file.url;
  dialogVisible.value = true;
}

function listToString(list, separator) {
  return list.map((item) => item.url);
}

function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);

  return axios.post(uploadImgUrl.value, formData, {
    headers: {
      ...headers.value,
      'Content-Type': 'multipart/form-data'
    }
  }).then(response => {
    return response.data; // 返回服务器响应数据
  }).catch(error => {
    console.error("上传图片失败: ", error);
    throw error;
  });
}
</script>

<style scoped lang="scss">
.component-upload-image {
  .el-upload__tip {
    margin-top: 10px;
    font-size: 12px;
    color: #666;
  }
}
</style>
