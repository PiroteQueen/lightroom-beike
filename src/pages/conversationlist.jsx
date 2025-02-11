import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import BackButton from '../components/BackButton/index'
import { getStoredUserInfo } from '../utils/userProfile'

// AI API 配置
const AI_CONFIG = {
    auth: "app-ZikSpKF9IS3UpYNcVqelhDPx",
    api_url: "https://x-ai.ke.com/v1/conversations",
};

const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${month}月${day}日 ${hours}:${minutes}`;
}

const ConversationItem = ({ conversation, onItemClick, onLongPress }) => (
    <View
        className="bg-bg2 rounded-2xl p-3 mb-3 mx-3 active:opacity-80"
        onClick={() => onItemClick(conversation)}
        onLongPress={() => onLongPress(conversation)}
    >
        <View className="flex justify-between items-center">
            <Text className="text-f1 text-base">{conversation.name}</Text>
            <Text className="text-f2 text-xs">{formatTime(conversation.created_at)}</Text>
        </View>
        {conversation.introduction && (
            <Text className="text-f2 text-sm mt-2 line-clamp-2">{conversation.introduction}</Text>
        )}
    </View>
)

function ConversationList() {
    const [conversations, setConversations] = useState([])
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [lastId, setLastId] = useState('')
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedConversation, setSelectedConversation] = useState(null)

    const fetchConversations = async (isRefresh = false) => {
        try {
            setLoading(true)
            const userInfo = getStoredUserInfo()
            const userId = userInfo ? `user_${userInfo.nickName}` : `user_${Date.now()}`

            const response = await Taro.request({
                url: `${AI_CONFIG.api_url}?user=${userId}&last_id=${isRefresh ? '' : lastId}&limit=20`,
                method: 'GET',
                header: {
                    'Authorization': `Bearer ${AI_CONFIG.auth}`,
                },
            })

            if (response.statusCode === 200) {
                const { data, has_more } = response.data
                setConversations(prev => isRefresh ? data : [...prev, ...data])
                setHasMore(has_more)
                if (data.length > 0) {
                    setLastId(data[data.length - 1].id)
                }
            } else {
                Taro.showToast({
                    title: '获取对话记录失败',
                    icon: 'none'
                })
            }
        } catch (error) {
            console.error('获取对话记录失败:', error)
            Taro.showToast({
                title: '获取对话记录失败',
                icon: 'none'
            })
        } finally {
            setLoading(false)
            Taro.stopPullDownRefresh()
        }
    }

    useEffect(() => {
        fetchConversations(true)
    }, [])

    const handleRefresh = () => {
        fetchConversations(true)
    }

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            fetchConversations()
        }
    }

    const handleItemClick = (conversation) => {
        // 跳转到聊天页面，并传递会话 ID
        Taro.navigateTo({
            url: `/pages/chat?conversation_id=${conversation.id}`
        })
    }

    const handleLongPress = (conversation) => {
        setSelectedConversation(conversation)
        setShowDeleteModal(true)
    }

    const handleDeleteConfirm = async () => {
        if (!selectedConversation) return
        setShowDeleteModal(false)

        try {
            const userInfo = getStoredUserInfo()
            const userId = userInfo ? `user_${userInfo.nickName}` : `user_${Date.now()}`

            Taro.showLoading({ title: '删除中...' })

            const response = await Taro.request({
                url: `${AI_CONFIG.api_url}/${selectedConversation.id}`,
                method: 'DELETE',
                header: {
                    'Authorization': `Bearer ${AI_CONFIG.auth}`,
                    'Content-Type': 'application/json'
                },
                data: {
                    user: userId
                }
            })

            if (response.statusCode === 204 || (response.statusCode === 200 && response.data.result === 'success')) {
                fetchConversations(true)
                Taro.showToast({
                    title: '删除成功',
                    icon: 'success'
                })
            } else {
                throw new Error(`删除失败: ${JSON.stringify(response.data)}`)
            }
        } catch (error) {
            console.error('删除会话失败:', error)
            Taro.showToast({
                title: '删除失败',
                icon: 'error'
            })
        } finally {
            Taro.hideLoading()
            setSelectedConversation(null)
        }
    }

    return (
        <View className="flex flex-col h-screen bg-bg">
            {/* 顶部固定部分 */}
            <View className="pt-24">
                <BackButton />
                <View className="px-3 mb-3">
                    <Text className="text-f1 text-xl font-medium">对话记录</Text>
                </View>
            </View>

            {/* 可滚动列表部分 */}
            <ScrollView
                scrollY
                className="flex-1"
                enablePullDownRefresh
                onScrollToLower={handleLoadMore}
                onPullDownRefresh={handleRefresh}
            >
                {conversations.map(conversation => (
                    <ConversationItem
                        key={conversation.id}
                        conversation={conversation}
                        onItemClick={handleItemClick}
                        onLongPress={handleLongPress}
                    />
                ))}
                {loading && (
                    <View className="py-3 text-center">
                        <Text className="text-f2">加载中...</Text>
                    </View>
                )}
                {!loading && !hasMore && conversations.length > 0 && (
                    <View className="py-3 text-center">
                        <Text className="text-f2">没有更多了</Text>
                    </View>
                )}
                {!loading && conversations.length === 0 && (
                    <View className="py-3 text-center">
                        <Text className="text-f2">暂无对话记录</Text>
                    </View>
                )}
            </ScrollView>

            {/* 删除确认对话框 */}
            {showDeleteModal && (
                <View className="fixed inset-0 flex items-center justify-center bg-black/30">
                    <View className="bg-white rounded-lg w-[280px] overflow-hidden">
                        <View className="p-6">
                            <Text className="text-center block text-base">确认删除此对话？</Text>
                        </View>
                        <View className="flex border-t border-gray-100">
                            <View
                                className="flex-1 py-4 text-center active:bg-gray-50"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                <Text className="text-gray-600">取消</Text>
                            </View>
                            <View className="w-[1px] bg-gray-100" />
                            <View
                                className="flex-1 py-4 text-center active:bg-gray-50"
                                onClick={handleDeleteConfirm}
                            >
                                <Text className="text-red-500">删除</Text>
                            </View>
                        </View>
                    </View>
                </View>
            )}
        </View>
    )
}

export default ConversationList 