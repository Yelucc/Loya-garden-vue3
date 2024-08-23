<template>
  <van-action-sheet v-model:show="internalShow" title="首饰预定">
    <div class="action-content">
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
          <div class="label">
            地址
            <van-icon name="friends"/>
          </div>
          <div class="context">
            {{ address }}
          </div>
        </div>

        <van-action-sheet v-model:show="addressSelectShow" title="地址列表">
          <van-address-list
              v-model="addressIdx"
              :list="userAddressList"
              default-tag-text="默认"
              @add="addressEditShow = true"
              @edit="onEditAddress"
              @select="onSelectAddress"
          />
        </van-action-sheet>

        <van-action-sheet v-model:show="addressEditShow" title="地址编辑">
          <van-address-edit
              :address-info="editAddress"
              :area-columns-placeholder="['请选择', '请选择', '请选择']"
              :area-list="areaList"
              @save="onAddressSave"
          />
        </van-action-sheet>


        <van-field v-model="formData.artistName" label="艺人" placeholder=""/>
        <van-field
            v-model="formData.purpose"
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

      <van-button type="danger" @click="onSubmit">立即预定</van-button>
    </div>
  </van-action-sheet>
</template>

<script setup>
import {defineModel} from "vue"
import {areaList} from "@vant/area-data";
import {showToast} from "vant";
import {addOrderManagement} from "@/api/order/orderManagement.js";

const router = useRouter();
const showPicker = ref(false);
const addressSelectShow = ref(false);
const addressEditShow = ref(false);
const editAddress = ref({})
const editIdx = ref(-1)
const addressIdx = ref(-1);

const choseJewelList = defineModel()

const props = defineProps({
  show: Boolean,
  formData: Object,
});
const emit = defineEmits([ 'update:show']);
const internalShow = ref(props.show);

watch(() => props.show, (newVal) => {
  internalShow.value = newVal;
});
watch(internalShow, (newVal) => {
  emit('update:show', newVal);
});

const userAddressList = ref([]);
const userAddressEdit = ref([]);

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

function onSelectAddress(item) {
  props.formData.recipientName = item.name
  props.formData.recipientPhone = item.tel
  props.formData.recipientAddress = item.address
  addressEditShow.value = false
}


function onTimeConfirm({selectedValues}) {
  showPicker.value = false;
  props.formData.deliveryDate = currentDate.value
}

const address = computed(() => {
  if (userAddressList.value.length > 0 && userAddressList.value[addressIdx.value]) {
    return userAddressList.value[addressIdx.value].address
  } else {
    return "（预定阶段可缓填）"
  }
})

//
function onEditAddress(item, index) {
  editAddress.value = userAddressEdit.value[index];
  editIdx.value = index
  addressEditShow.value = true
}

function onAddressSave(data) {
  if (editIdx.value === -1) {
    userAddressEdit.value.push({
      name: data.name,
      tel: data.tel,
      city: data.city,
      county: data.county,
      country: data.country,
      province: data.province,
      areaCode: data.areaCode,
      isDefault: data.isDefault,
      addressDetail: data.addressDetail
    })
    userAddressList.value.push({
      id: userAddressList.value.length,
      name: data.name,
      tel: data.tel,
      address: data.province + data.city + data.county + data.addressDetail,
    })
  } else {
    userAddressEdit.value[editIdx.value] = {
      name: data.name,
      tel: data.tel,
      city: data.city,
      county: data.county,
      country: data.country,
      province: data.province,
      areaCode: data.areaCode,
      isDefault: data.isDefault,
      addressDetail: data.addressDetail
    }
    userAddressList.value[editIdx.value] = {
      id: editIdx.value,
      name: data.name,
      tel: data.tel,
      address: data.province + data.city + data.county + data.addressDetail,
    }
  }
  editIdx.value = -1
  addressEditShow.value = false
}

function removeToCart(jewel) {
  props.formData.jewelCode = props.formData.jewelCode.filter(code => code !== jewel.jewelId+'')
  const index = choseJewelList.value.findIndex(item => item.jewelId === jewel.jewelId);
  if (index !== -1) {
    choseJewelList.value.splice(index, 1);
  }
}


function onSubmit() {
  // 处理提交和校验
  props.formData.deliveryDate = `${currentDate.value[0]}-${currentDate.value[1]}-${currentDate.value[2]}`
  props.formData.jewelCode = choseJewelList.value.map(item => item.jewelId)
  //校验
  if (!props.formData.artistName || props.formData.artistName === "") {
    showToast('请填写艺人');
    return;
  }
  if (!props.formData.purpose || props.formData.purpose === "") {
    showToast('请填写活动内容');
    return;
  }
  if (props.formData.jewelCode.length === 0) {
    showToast('请至少选择一个首饰');
    return;
  }
  addOrderManagement(props.formData).then(response => {
    router.push({name: 'MallStatus', params: {status: props.formData.recipientAddress ? 'pending' : 'lock'}});
  });
}
</script>

<style lang="scss" scoped>
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
</style>