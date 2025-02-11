import React from 'react'
import { View, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'

const BackButton = () => {
    const handleBack = () => {
        Taro.navigateBack({
            delta: 1
        })
    }

    return (
        <View
            className="fixed top-[52px] left-4 z-10 w-8 h-8 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl shadow-sm active:scale-90 transition-transform"
            onClick={handleBack}
            hoverClass="none"
        >
            <Image
                className="w-5 h-5"
                src={require('../../assets/images/back.png')}
            />
        </View>
    )
}

export default BackButton 