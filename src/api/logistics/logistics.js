import request from '@/utils/request'

// 查询物流管理列表
export function listLogistics(query) {
    return request({
        url: '/logistics/logistics/list',
        method: 'get',
        params: query
    })
}

// 查询物流管理详细
export function getLogistics(trackingNumber) {
    return request({
        url: '/logistics/logistics/' + trackingNumber,
        method: 'get'
    })
}

// 新增物流管理
export function addLogistics(data) {
    return request({
        url: '/logistics/logistics',
        method: 'post',
        data: data
    })
}

// 修改物流管理
export function updateLogistics(data) {
    return request({
        url: '/logistics/logistics',
        method: 'put',
        data: data
    })
}

// 删除物流管理
export function delLogistics(trackingNumber) {
    return request({
        url: '/logistics/logistics/' + trackingNumber,
        method: 'delete'
    })
}
