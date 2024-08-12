import request from '@/utils/request'

// 查询首饰管理列表
export function listJewelcase(query) {
  return request({
    url: '/jewelcase/list',
    method: 'get',
    params: query
  })
}

// 查询首饰管理详细
export function getJewelcase(jewelId) {
  return request({
    url: '/jewelcase/' + jewelId,
    method: 'get'
  })
}

// 新增首饰管理
export function addJewelcase(data) {
  return request({
    url: '/jewelcase',
    method: 'post',
    data: data
  })
}

// 修改首饰管理
export function updateJewelcase(data) {
  return request({
    url: '/jewelcase',
    method: 'put',
    data: data
  })
}

// 删除首饰管理
export function delJewelcase(jewelId) {
  return request({
    url: '/jewelcase/' + jewelId,
    method: 'delete'
  })
}
