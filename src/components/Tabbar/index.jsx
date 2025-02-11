import React from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'

const Tabbar = ({ currentTab, onTabChange }) => {
    const handleChatClick = () => {
        Taro.navigateTo({
            url: '/pages/chat'
        })

    }

    return (
        <View className="flex justify-between items-center px-20 py-8 pb-12 bg-bg">
            <View className="flex flex-col items-center">
                <View className={`w-1.5 h-1.5 rounded-full mb-1 ${currentTab === 'edit' ? 'bg-f2' : 'bg-transparent'}`} />
                <Text
                    className={`${currentTab === 'chat' ? 'text-f1' : 'text-f2'} transition-colors`}
                    onClick={handleChatClick}
                >
                    对话
                </Text>
            </View>
            <View className="flex flex-col items-center">
                <View className={`w-1.5 h-1.5 rounded-full mb-1 ${currentTab === 'home' ? 'bg-f2' : 'bg-transparent'}`} />
                <Text
                    className={`${currentTab === 'home' ? 'text-f1' : 'text-f2'} transition-colors`}
                    onClick={() => onTabChange('home')}
                >
                    视野
                </Text>
            </View>
            <View className="flex flex-col items-center">
                <View className={`w-1.5 h-1.5 rounded-full mb-1 ${currentTab === 'profile' ? 'bg-f2' : 'bg-transparent'}`} />
                <Text
                    className={`${currentTab === 'profile' ? 'text-f1' : 'text-f2'} transition-colors`}
                    onClick={() => onTabChange('profile')}
                >
                    我的
                </Text>
            </View>
        </View>
    )
}

export default Tabbar 