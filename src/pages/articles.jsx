import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import BackButton from '../components/BackButton/index'

const ArticleCard = ({ article }) => {
    const handleClick = () => {
        if (article.url) {
            // 如果 URL 以 @ 开头，去掉 @ 符号
            const cleanUrl = article.url.startsWith('@') ? article.url.slice(1) : article.url
            console.log('原始 URL:', article.url)
            console.log('处理后 URL:', cleanUrl)

            // 确保 URL 包含完整路径
            if (!cleanUrl.includes('/s/')) {
                console.error('无效的文章链接')
                Taro.showToast({
                    title: '无效的文章链接',
                    icon: 'none'
                })
                return
            }

            const webviewUrl = `/pages/webview/index?url=${encodeURIComponent(cleanUrl)}`
            console.log('跳转 URL:', webviewUrl)

            Taro.navigateTo({
                url: webviewUrl,
                fail: (err) => {
                    console.error('打开文章失败:', err)
                    Taro.showToast({
                        title: '打开文章失败',
                        icon: 'none'
                    })
                }
            })
        }
    }

    return (
        <View className="bg-bg2 rounded-2xl p-4 mb-2" onClick={handleClick}>
            <View className="flex items-center">
                {article.cover && (
                    <Image
                        src={article.cover}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    />
                )}
                <View className="flex-1 ml-3">
                    <Text className="text-f1 text-sm font-normal leading-normal">{article.title}</Text>
                    <View className="mt-1.5 flex items-center">
                        <Text className="text-f2 text-xs">{article.c_t ? new Date(article.c_t).toLocaleDateString() : '暂无日期'}</Text>
                        <Text className="text-f2 text-xs mx-2">·</Text>
                        <Text className="text-f2 text-xs">{article.read_count || 0} 阅读</Text>
                    </View>
                </View>
            </View>
        </View>
    )
}

const LoadingCard = () => (
    <View className="bg-bg2 rounded-2xl p-4 mb-2 animate-pulse">
        <View className="flex items-center">
            <View className="w-12 h-12 rounded-lg bg-gray-300" />
            <View className="flex-1 ml-3">
                <View className="h-4 bg-gray-300 rounded w-3/4" />
                <View className="mt-1.5 flex items-center">
                    <View className="h-3 bg-gray-300 rounded w-1/4" />
                </View>
            </View>
        </View>
    </View>
)

function Articles() {
    const router = useRouter()
    const { type } = router.params
    const [articles, setArticles] = useState([])
    const [pageTitle, setPageTitle] = useState('')
    const [loading, setLoading] = useState(true)

    // 获取文章列表数据
    const fetchArticles = async () => {
        try {
            setLoading(true)
            const db = Taro.cloud.database()

            // 根据type获取对应tag的文章
            const tagMap = {
                photos: '视野',
                edits: '机会',
                albums: '被投'
            }

            const { data } = await db.collection('articles')
                .where({
                    tag: tagMap[type]
                })
                .orderBy('createTime', 'desc') // 按创建时间倒序
                .get()

            console.info(data)
            setArticles(data)
        } catch (error) {
            console.error('获取文章列表失败:', error)
            Taro.showToast({
                title: '获取文章列表失败',
                icon: 'none'
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // 根据type设置页面标题
        const titles = {
            photos: '视野',
            edits: '机会',
            albums: '被投'
        }
        setPageTitle(titles[type] || '文章列表')
        Taro.setNavigationBarTitle({
            title: titles[type] || '文章列表'
        })

        // 获取文章列表
        fetchArticles()
    }, [type])

    // 下拉刷新处理
    const handlePullDownRefresh = async () => {
        await fetchArticles()
        Taro.stopPullDownRefresh()
    }

    return (
        <View className="min-h-screen flex flex-col bg-bg">
            {/* 顶部安全区域 */}
            <View className="h-[88px]" />

            {/* 返回按钮 */}
            <BackButton />

            {/* 标题区域 */}
            <View className="px-4 mb-4 pt-4">
                <Text className="text-f1 text-xl font-medium">{pageTitle}</Text>
            </View>

            <ScrollView
                scrollY
                className="flex-1 pb-[34px]"
                enablePullDownRefresh
                onPullDownRefresh={handlePullDownRefresh}
            >
                <View className="px-4">
                    {loading ? (
                        <>
                            <LoadingCard />
                            <LoadingCard />
                            <LoadingCard />
                        </>
                    ) : articles.length > 0 ? (
                        articles.map(article => (
                            <ArticleCard key={article._id} article={article} />
                        ))
                    ) : (
                        <View className="py-4 text-center">
                            <Text className="text-f2 text-sm">暂无文章</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* 底部安全区域 */}
            <View className="h-[34px]" />
        </View>
    )
}

export default Articles 