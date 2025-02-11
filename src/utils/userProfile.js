import Taro from '@tarojs/taro'

const USER_STORAGE_KEY = 'user_info'

/**
 * 获取用户信息
 * @param {string} desc - 获取用户信息的用途说明
 * @returns {Promise} 返回用户信息
 */
export const getUserProfile = (desc = '用于完善会员资料') => {
    return new Promise((resolve, reject) => {
        // 判断是否支持 getUserProfile
        if (Taro.getUserProfile) {
            console.log('调用 getUserProfile')
            Taro.getUserProfile({
                desc,
                lang: 'zh_CN',
                success: (res) => {
                    console.log('getUserProfile success:', res)
                    // 存储用户信息
                    saveUserInfo(res.userInfo)
                    resolve(res)
                },
                fail: (err) => {
                    console.error('getUserProfile fail:', err)
                    reject(err)
                }
            })
        } else {
            console.log('不支持 getUserProfile，降级使用 getUserInfo')
            // 低版本兼容处理
            Taro.getUserInfo({
                lang: 'zh_CN',
                success: (res) => {
                    console.log('getUserInfo success:', res)
                    // 存储用户信息
                    saveUserInfo(res.userInfo)
                    resolve(res)
                },
                fail: (err) => {
                    console.error('getUserInfo fail:', err)
                    reject(err)
                }
            })
        }
    })
}

/**
 * 保存用户信息到本地存储
 * @param {Object} userInfo - 用户信息对象
 */
export const saveUserInfo = (userInfo) => {
    try {
        Taro.setStorageSync(USER_STORAGE_KEY, userInfo)
    } catch (e) {
        console.error('保存用户信息失败:', e)
    }
}

/**
 * 获取存储的用户信息
 * @returns {Object|null} 用户信息对象或null
 */
export const getStoredUserInfo = () => {
    try {
        return Taro.getStorageSync(USER_STORAGE_KEY)
    } catch (e) {
        console.error('获取用户信息失败:', e)
        return null
    }
}

/**
 * 清除存储的用户信息
 */
export const clearUserInfo = () => {
    try {
        Taro.removeStorageSync(USER_STORAGE_KEY)
    } catch (e) {
        console.error('清除用户信息失败:', e)
    }
}

/**
 * 检查是否支持 getUserProfile
 * @returns {boolean}
 */
export const canIUseGetUserProfile = () => {
    return !!Taro.getUserProfile
} 