import React, { useState } from 'react'
import { WebView, View, Text } from '@tarojs/components'
import { useRouter } from '@tarojs/taro'
import BackButton from '../../components/BackButton'

function WebViewPage() {
    const router = useRouter()
    const { url } = router.params
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    const handleLoad = (e) => {
        console.log('网页加载成功', e.detail)
        setLoading(false)
        setError(false)
    }

    const handleError = (e) => {
        console.error('网页加载失败', e.detail)
        setLoading(false)
        setError(true)
    }

    const handleMessage = (e) => {
        console.log('收到网页消息', e.detail.data)
    }

    if (!url) {
        return (
            <View className="min-h-screen bg-bg flex flex-col">
                <View className="h-[88px]" />
                <BackButton />
                <View className="flex-1 flex items-center justify-center">
                    <Text className="text-f2">无效的链接</Text>
                </View>
            </View>
        )
    }

    return (
        <View className="min-h-screen bg-bg flex flex-col">
            <View className="h-[88px]" />
            <BackButton />

            {loading && (
                <View className="absolute inset-0 flex items-center justify-center bg-bg bg-opacity-75 z-10">
                    <Text className="text-f2">加载中...</Text>
                </View>
            )}

            {error ? (
                <View className="flex-1 flex items-center justify-center">
                    <Text className="text-f2">加载失败，请稍后重试</Text>
                </View>
            ) : (
                <WebView
                    src={decodeURIComponent(url)}
                    onLoad={handleLoad}
                    onError={handleError}
                    onMessage={handleMessage}
                    className="flex-1"
                />
            )}
        </View>
    )
}

export default WebViewPage 