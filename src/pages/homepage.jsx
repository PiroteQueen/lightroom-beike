import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import deepseekBg from '../assets/images/deepseek.png'
import { getUserProfile } from '../utils/userProfile'

const StatisticsCards = ({ statistics }) => {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // 延迟显示以实现动画效果
        setTimeout(() => setIsVisible(true), 100)
    }, [])

    const handleCardClick = (type) => {
        Taro.navigateTo({
            url: `/pages/articles?type=${type}`
        })
    }

    return (
        <View className="flex space-x-1">
            {['photos', 'edits', 'albums'].map((type, index) => (
                <View
                    key={type}
                    className={`flex-1 bg-white rounded-xl p-2 shadow-sm aspect-[3/4] flex flex-col transform transition-all duration-500 ease-out ${isVisible
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-5'
                        }`}
                    style={{
                        transitionDelay: `${index * 150}ms`
                    }}
                    onClick={() => handleCardClick(type)}
                >
                    <Text className="text-sm text-gray-900">
                        {type === 'photos' ? '视野' : type === 'edits' ? '机会' : '被投'}
                    </Text>
                    <View className="mt-auto self-end">
                        <Text className="text-xs bg-[#F5F4F2] px-2 py-1 rounded-lg">
                            {statistics[type]}
                        </Text>
                    </View>
                </View>
            ))}
        </View>
    )
}

const PresetCard = () => {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        setTimeout(() => setIsVisible(true), 400)
    }, [])

    const handleChatClick = async () => {
        try {
            const userInfo = await getUserProfile('用于提供个性化的数据展示服务')
            // 跳转到看板页面
            Taro.navigateTo({
                url: '/pages/dashboard'
            })
        } catch (error) {
            Taro.showToast({
                title: '需要授权才能继续',
                icon: 'none'
            })
        }
    }

    return (
        <View
            className={`mt-1 transform transition-all duration-500 ease-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
        >
            <View className="bg-white rounded-2xl p-[3px]">
                <View className="relative aspect-[16/9] rounded-xl overflow-hidden">
                    <Image src={deepseekBg} className="absolute inset-0 w-full h-full z-10" />
                    <View
                        className={`absolute top-3 w-full text-center z-30 transform transition-all duration-500 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
                            }`}
                        style={{ transitionDelay: '600ms' }}
                    >
                        <Text className="text-sm text-white/80">看板</Text>
                    </View>
                    <View
                        className={`h-full flex items-center justify-center z-30 relative transform transition-all duration-500 ease-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                            }`}
                        style={{ transitionDelay: '700ms' }}
                    >
                        <Text className="text-3xl font-normal text-white">Overview</Text>
                    </View>
                    <View className="absolute bottom-3 w-full flex justify-center z-30">
                        <button
                            className={`bg-white/90 backdrop-blur-sm px-6 py-0 rounded-full transform transition-all duration-500 ease-out hover:scale-105 active:scale-95 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                                }`}
                            style={{
                                transitionDelay: '800ms',
                                border: 'none',
                                background: 'rgba(255, 255, 255, 0.9)'
                            }}
                            onClick={handleChatClick}
                        >
                            <Text className="text-sm font-medium text-black">立即进入</Text>
                        </button>
                    </View>
                </View>
            </View>
        </View>
    )
}

function Home() {
    const [statistics, setStatistics] = useState({
        photos: 0,
        edits: 0,
        albums: 0
    })

    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                const db = Taro.cloud.database()
                const _ = db.command

                // 查询各个标签的文章数量
                const photosPromise = db.collection('articles')
                    .where({
                        tag: '视野'
                    })
                    .count()

                const editsPromise = db.collection('articles')
                    .where({
                        tag: '机会'
                    })
                    .count()

                const albumsPromise = db.collection('articles')
                    .where({
                        tag: '被投'
                    })
                    .count()

                // 并行执行所有查询
                const [photosRes, editsRes, albumsRes] = await Promise.all([
                    photosPromise,
                    editsPromise,
                    albumsPromise
                ])

                setStatistics({
                    photos: photosRes.total,
                    edits: editsRes.total,
                    albums: albumsRes.total
                })
            } catch (error) {
                console.error('获取统计数据失败:', error)
                Taro.showToast({
                    title: '获取数据失败',
                    icon: 'none'
                })
            }
        }

        fetchStatistics()
    }, [])

    return (
        <ScrollView scrollY={false} className="h-full bg-bg">
            <View className="px-2 flex flex-col h-full">
                {/* 空白区域用于展示图片 */}
                <View className="flex-1" />

                {/* 统计卡片区域 */}
                <StatisticsCards statistics={statistics} />

                {/* 预设展示卡片 */}
                <PresetCard />
            </View>
        </ScrollView>
    )
}

export default Home 