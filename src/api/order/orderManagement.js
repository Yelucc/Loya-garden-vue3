import request from '@/utils/request'

// 查询订单管理列表
export function listOrderManagement(query) {
    return request({
        url: '/order/orderManagement/list',
        method: 'get',
        params: query
    })
}

// 查询订单管理列表
export function listOrderVo(query) {
    return request({
        url: '/order/orderManagement/list-vo',
        method: 'get',
        params: query
    })
}

// 查询订单管理详细
export function getOrderManagement(orderId) {
    return request({
        url: '/order/orderManagement/' + orderId,
        method: 'get'
    })
}

// 新增订单管理
export function addOrderManagement(data) {
    return request({
        url: '/order/orderManagement',
        method: 'post',
        data: data
    })
}

// 修改订单管理
export function updateOrderManagement(data) {
    return request({
        url: '/order/orderManagement',
        method: 'put',
        data: data
    })
}

// 删除订单管理
export function delOrderManagement(orderId) {
    return request({
        url: '/order/orderManagement/' + orderId,
        method: 'delete'
    })
}
