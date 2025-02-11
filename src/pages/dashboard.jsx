import React from 'react'
import { View, Text } from '@tarojs/components'

function Dashboard() {
    const roundData = [
        { name: '种子轮', count: 2, color: '#E3B5A4', percent: 10 },
        { name: '天使轮', count: 3, color: '#8FBDD3', percent: 15 },
        { name: 'Pre-A轮', count: 3, color: '#BFD8B8', percent: 15 },
        { name: 'A轮', count: 4, color: '#E1D4BB', percent: 20 },
        { name: 'B轮', count: 0, color: '#B8B8D1', percent: 15 },
        { name: 'C轮', count: 0, color: '#F5CAC3', percent: 10 },
        { name: 'D轮', count: 0, color: '#B6D7CF', percent: 10 },
        { name: 'Pre-IPO', count: 0, color: '#D7C0AE', percent: 5 }
    ];

    return (
        <View className="min-h-screen bg-bg px-2">
            {/* 顶部导航栏 */}
            <View className="flex items-center mb-4 pt-16 ">
                <Text className="text-sm text-gray-900">看板</Text>
            </View>

            {/* Banking卡片 */}
            <View className="bg-black rounded-xl p-4 shadow-lg mb-3">
                <View className="flex flex-col mb-3">
                    <Text className="text-sm text-white/80">总规模</Text>
                    <Text className="text-3xl font-bold text-white">$154,211.00</Text>
                </View>

                <View className="space-y-2">
                    <View className="flex justify-between">
                        <Text className="text-xs text-white/70">已投</Text>
                        <Text className="text-xs bg-white/10 backdrop-blur-sm px-2 py-1 rounded-lg text-white">$154,211.00</Text>
                    </View>
                    <View className="flex justify-between">
                        <Text className="text-xs text-white/70">投后估值</Text>
                        <Text className="text-xs bg-white/10 backdrop-blur-sm px-2 py-1 rounded-lg text-white">$0.00</Text>
                    </View>
                    <View className="flex justify-between">
                        <Text className="text-xs text-white/70">公司数</Text>
                        <Text className="text-xs bg-white/10 backdrop-blur-sm px-2 py-1 rounded-lg text-white">20</Text>
                    </View>
                </View>
            </View>


            {/* 项目状态卡片组 */}
            <View className="flex space-x-2 mb-3">
                {/* 在管项目卡片 */}
                <View className="flex-1 bg-white rounded-xl p-3 shadow-sm aspect-[9/16] flex flex-col">
                    <Text className="text-sm text-gray-900">在管项目</Text>
                    <View className="mt-4">
                        <Text className="text-xs text-gray-500">总估值</Text>
                        <Text className="text-base text-gray-900 mt-1">$2.31B</Text>
                    </View>
                    <View className="mt-auto">
                        <Text className="text-xs text-gray-500">总投资额</Text>
                        <Text className="text-base text-gray-900 mt-1">$154.2M</Text>
                    </View>
                </View>

                {/* 在途项目卡片 */}
                <View className="flex-1 bg-white rounded-xl p-3 shadow-sm aspect-[9/16] flex flex-col">
                    <Text className="text-sm text-gray-900">在途项目</Text>
                    <View className="mt-4">
                        <Text className="text-xs text-gray-500">总估值</Text>
                        <Text className="text-base text-gray-900 mt-1">$526M</Text>
                    </View>
                    <View className="mt-auto">
                        <Text className="text-xs text-gray-500">预期投资</Text>
                        <Text className="text-base text-gray-900 mt-1">$42.5M</Text>
                    </View>
                </View>

                {/* 退出项目卡片 */}
                <View className="flex-1 bg-white rounded-xl p-3 shadow-sm aspect-[9/16] flex flex-col">
                    <Text className="text-sm text-gray-900">退出项目</Text>
                    <View className="mt-4">
                        <Text className="text-xs text-gray-500">总估值</Text>
                        <Text className="text-base text-gray-900 mt-1">$1.25B</Text>
                    </View>
                    <View className="mt-auto">
                        <Text className="text-xs text-gray-500">累计收益</Text>
                        <Text className="text-base text-gray-900 mt-1">$89.3M</Text>
                    </View>
                </View>
            </View>

            {/* 轮次分布卡片 */}
            <View className="bg-white rounded-xl p-4 shadow-sm mb-3">
                <Text className="text-sm text-gray-900">轮次分布</Text>

                {/* 环形图容器 */}
                <View className="relative w-28 h-28 mx-auto my-3">
                    {/* 中心文字 */}
                    <View className="absolute inset-0 flex flex-col items-center justify-center z-10">
                        <Text className="text-base font-normal text-gray-900">{roundData.reduce((sum, item) => sum + item.count, 0)}</Text>
                        <Text className="text-[10px] text-gray-900">总数</Text>
                    </View>

                    {/* 环形图段 */}
                    {roundData.filter(item => item.count > 0).map((item, index, filteredArray) => (
                        <View
                            key={item.name}
                            className="absolute inset-0"
                            style={{
                                borderRadius: '50%',
                                border: `16px solid ${item.color}`,
                                borderRightColor: 'transparent',
                                borderBottomColor: 'transparent',
                                transform: `rotate(${(index * 360) / filteredArray.length}deg)`,
                                opacity: 0.9,
                                clipPath: 'circle(50%)'
                            }}
                        />
                    ))}
                </View>

                {/* 图例 */}
                <View className="grid grid-cols-2 gap-3">
                    {roundData.filter(item => item.count > 0).map((item) => (
                        <View key={item.name} className="flex items-center">
                            <View className="w-2 h-2 rounded-full mr-2.5" style={{ backgroundColor: item.color }} />
                            <Text className="text-[10px] text-gray-900">{item.name} ({item.count})</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* 轮次分布柱状图卡片 */}
            <View className="bg-white rounded-xl p-4 shadow-sm mb-3">
                <Text className="text-sm text-gray-900">轮次分布趋势</Text>

                {/* 柱状图容器 */}
                <View className="h-28 flex items-end justify-between my-2">
                    {roundData.filter(item => item.count > 0).map((item) => (
                        <View key={item.name} className="flex flex-col items-center w-8">
                            {/* 数值 */}
                            <Text className="text-[10px] text-gray-900 mb-1">{item.count}</Text>
                            {/* 柱子 */}
                            <View
                                className="w-3 rounded-t transition-all duration-500"
                                style={{
                                    height: `${(item.count / Math.max(...roundData.filter(d => d.count > 0).map(d => d.count))) * 60}px`,
                                    backgroundColor: item.color,
                                    opacity: 0.9
                                }}
                            />
                            {/* 轮次名称 - 强制单行显示 */}
                            <Text className="text-[10px] text-gray-900 mt-1 whitespace-nowrap overflow-hidden text-ellipsis w-12 text-center">{item.name}</Text>
                        </View>
                    ))}
                </View>
            </View>
            {/* 增加底部安全边距 */}
            <View className="h-16"></View>
        </View>
    )
}

export default Dashboard 