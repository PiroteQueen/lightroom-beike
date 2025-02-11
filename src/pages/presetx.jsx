import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, Image, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { getUserProfile, getStoredUserInfo } from '../utils/userProfile'

const ReadingProgress = ({ progress }) => {
    const totalBars = 25
    const activeBars = Math.floor((progress / 100) * totalBars)

    return (
        <View className="bg-white rounded-xl p-2 shadow-sm mx-4 flex flex-col h-[88px]">
            <View className="flex justify-between items-start">
                <Text className="text-sm text-f1">文章阅读进度</Text>
                <Text className="text-xs bg-bg px-2 py-1 rounded-lg">{progress}%</Text>
            </View>
            <View className="flex space-x-1 mt-auto">
                {[...Array(totalBars)].map((_, index) => (
                    <View
                        key={index}
                        className={`flex-1 h-0.5 rounded-full ${index < activeBars ? 'bg-f1' : 'bg-bg'}`}
                    />
                ))}
            </View>
        </View>
    )
}

const TokenBalance = () => {
    return (
        <View className="bg-white rounded-xl p-2 shadow-sm mt-3 mx-4 flex flex-col h-[88px]">
            <View className="flex justify-between items-start">
                <View>
                    <Text className="text-sm text-f1">Token 余量</Text>
                    <Text className="text-xs text-f2 mt-1">本月剩余</Text>
                </View>
                <View>
                    <Text className="text-xs bg-bg px-2 py-1 rounded-lg">无限制</Text>
                </View>
            </View>
            <View className="mt-auto self-end">
                <View className="bg-f1 rounded-full px-3 py-1">
                    <Text className="text-xs text-white">查看详情</Text>
                </View>
            </View>
        </View>
    )
}

const Metrics = () => {
    const metrics = [
        { label: '等级', value: 'Lv.3' },
        { label: '积分', value: '2680', trend: 'up' },
        { label: '模型', value: 'GPT4' }
    ]

    return (
        <View className="grid grid-cols-3 gap-1 mt-3 mx-4">
            {metrics.map((metric, index) => (
                <View key={index} className="bg-white rounded-xl p-2 shadow-sm flex flex-col aspect-[3/4]">
                    <Text className="text-sm text-f1">{metric.label}</Text>
                    <View className="mt-auto self-end">
                        <View className="flex items-center space-x-1">
                            <Text className="text-xs bg-bg px-2 py-1 rounded-lg">{metric.value}</Text>
                            {metric.trend === 'up' && (
                                <Text className="text-xs text-f1">↑</Text>
                            )}
                        </View>
                    </View>
                </View>
            ))}
        </View>
    )
}

function Profile() {
    const [isVisible, setIsVisible] = useState(false)
    const [userInfo, setUserInfo] = useState(null)

    useEffect(() => {
        setTimeout(() => setIsVisible(true), 100)
        // 获取存储的用户信息
        const storedUserInfo = getStoredUserInfo()
        if (storedUserInfo) {
            setUserInfo(storedUserInfo)
            console.log('当前用户信息:', storedUserInfo)
        } else {
            console.log('未找到存储的用户信息')
        }
    }, [])

    const handleLogin = async () => {
        try {
            const res = await getUserProfile('用于展示个人信息')
            setUserInfo(res.userInfo)
            console.log('登录成功，用户信息:', res.userInfo)
            // 刷新页面
            Taro.showToast({
                title: '登录成功',
                icon: 'success',
                duration: 2000
            })
        } catch (error) {
            console.error('登录失败:', error)
            Taro.showToast({
                title: '登录失败',
                icon: 'error',
                duration: 2000
            })
        }
    }

    if (!userInfo) {
        return (
            <View className="flex flex-col h-screen bg-bg items-center justify-center px-4">
                <View className="bg-bg rounded-xl p-8 shadow-sm w-full max-w-sm">
                    <View className="flex flex-col items-center">
                        <Text className="text-2xl font-medium text-f1 mb-2">Lightroom AI</Text>
                        <Text className="text-sm text-f2 mb-8 text-center">登录后即可查看更多信息</Text>
                        <Button
                            className="bg-f1 text-white text-sm rounded-full px-3 py-2 w-full shadow-md hover:opacity-90 transition-opacity"
                            onClick={handleLogin}
                        >
                            微信一键登录
                        </Button>
                    </View>
                </View>
            </View>
        )
    }

    return (
        <View className="flex flex-col h-screen bg-bg">
            <ScrollView scrollY className="flex-1">
                {/* 欢迎信息和头像 */}
                <View
                    className={`transform transition-all duration-500 ease-out px-4 pt-4 flex justify-between items-center ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                        }`}
                >
                    <View className="flex flex-col items-start">
                        <Text className="text-3xl text-f2">欢迎回来</Text>
                        <Text className="text-3xl text-f1">{userInfo.nickName}</Text>
                    </View>
                    <Image
                        className="w-[56px] h-[56px] rounded-full"
                        src={userInfo.avatarUrl}
                        mode="aspectFill"
                    />
                </View>

                {/* 阅读进度 */}
                <View
                    className={`mt-6 transform transition-all duration-500 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                        }`}
                    style={{ transitionDelay: '100ms' }}
                >
                    <ReadingProgress progress={45} />
                </View>

                {/* Token余量 */}
                <View
                    className={`transform transition-all duration-500 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                        }`}
                    style={{ transitionDelay: '200ms' }}
                >
                    <TokenBalance />
                </View>

                {/* 用户等级信息 */}
                <View
                    className={`transform transition-all duration-500 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                        }`}
                    style={{ transitionDelay: '300ms' }}
                >
                    <Metrics />
                </View>
            </ScrollView>
        </View>
    )
}

export default Profile 