import React from 'react'
import { View, Text } from '@tarojs/components'

const Navbar = () => {
    return (
        <View className="flex items-center px-5 pt-14 pb-4 bg-[#F5F4F2]">
            <View className="flex items-center">
                <Text className="text-xl font-medium">Lightroom</Text>
                <View className="w-1.5 h-1.5 rounded-full bg-orange-500 ml-0.5" />
            </View>
        </View>
    )
}

export default Navbar 