import React, { useState, useRef, useEffect } from 'react'
import { View, ScrollView, Input, Text, Image, RichText } from '@tarojs/components'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import BackButton from '../components/BackButton/index'
import { getStoredUserInfo } from '../utils/userProfile'
import { createUserMessage, createAIMessage, createMessagesFromQA } from '../types/message'

// AI API 配置
const AI_CONFIG = {
    auth: "app-R0UMTGOaigQzipg4jDmPhRr6",
    api_url: "https://x-ai.ke.com",
};

// 将 markdown 转换为简单的 HTML
const markdownToHtml = (markdown) => {
    if (!markdown) return '';

    // 处理标题
    markdown = markdown.replace(/^### (.*?)$/gm, '<h3 style="font-size: 1.17em; font-weight: bold; margin: 1em 0;">$1</h3>');
    markdown = markdown.replace(/^## (.*?)$/gm, '<h2 style="font-size: 1.5em; font-weight: bold; margin: 1em 0;">$1</h2>');
    markdown = markdown.replace(/^# (.*?)$/gm, '<h1 style="font-size: 2em; font-weight: bold; margin: 1em 0;">$1</h1>');

    // 处理代码块（带语言标记）
    markdown = markdown.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre style="background-color: #f5f5f5; padding: 12px; border-radius: 8px; margin: 8px 0; font-size: 16px;"><code>$2</code></pre>');

    // 处理行内代码
    markdown = markdown.replace(/`([^`]+)`/g, '<code style="background-color: #f5f5f5; padding: 2px 4px; border-radius: 4px; font-family: monospace; font-size: 16px;">$1</code>');

    // 处理粗体
    markdown = markdown.replace(/\*\*(.*?)\*\*/g, '<strong style="font-size: 16px;">$1</strong>');

    // 处理斜体
    markdown = markdown.replace(/\*(.*?)\*/g, '<em style="font-size: 16px;">$1</em>');

    // 处理下划线
    markdown = markdown.replace(/__(.*?)__/g, '<u style="font-size: 16px;">$1</u>');

    // 处理删除线
    markdown = markdown.replace(/~~(.*?)~~/g, '<del style="font-size: 16px;">$1</del>');

    // 处理链接
    markdown = markdown.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #1890ff; text-decoration: none; font-size: 16px;">$1</a>');

    // 处理无序列表（支持多级）
    markdown = markdown.replace(/^\s*-\s+(.*)$/gm, '<li style="margin-left: 20px; margin-bottom: 4px; font-size: 16px;">$1</li>');

    // 处理有序列表
    markdown = markdown.replace(/^\s*\d+\.\s+(.*)$/gm, '<li style="margin-left: 20px; margin-bottom: 4px; font-size: 16px;">$1</li>');

    // 处理引用
    markdown = markdown.replace(/^\>\s*(.*?)$/gm, '<blockquote style="border-left: 4px solid #ddd; margin: 8px 0; padding-left: 12px; color: #666; font-size: 16px;">$1</blockquote>');

    // 处理水平线
    markdown = markdown.replace(/^---$/gm, '<hr style="border: none; border-top: 1px solid #ddd; margin: 16px 0;">');

    // 处理换行（保留连续两个换行作为段落分隔）
    markdown = markdown.replace(/\n\n+/g, '</p><p style="margin: 1em 0; font-size: 16px;">');
    markdown = markdown.replace(/\n/g, '<br>');

    // 包装在段落标签中
    markdown = '<p style="margin: 1em 0; font-size: 16px;">' + markdown + '</p>';

    // 修复可能的段落嵌套问题
    markdown = markdown.replace(/<p>(\s*<\/?(?:h[1-6]|pre|blockquote|hr|p)[^>]*>\s*)+/g, '$1');
    markdown = markdown.replace(/(\s*<\/?(?:h[1-6]|pre|blockquote|hr|p)[^>]*>\s*)+<\/p>/g, '$1');

    return markdown;
};

// 消息气泡组件
const MessageBubble = ({ message, isNew }) => {
    return (
        <View
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-6`}
        >
            {!message.isUser && (
                <View
                    className="bg-white rounded-xl px-3 py-2 shadow-sm max-w-[75%]"
                >
                    {message.agentThoughts?.[0]?.thought && (
                        <View className="mb-2 text-gray-500 text-sm border-b border-gray-100 pb-2">
                            <Text
                                className="leading-relaxed break-words"
                                userSelect
                            >
                                {message.agentThoughts[0].thought}
                            </Text>
                        </View>
                    )}
                    {message.content ? (
                        <View className="relative">
                            <RichText
                                userSelect
                                className="text-f1 leading-relaxed break-words"
                                nodes={markdownToHtml(message.content)}
                            />
                        </View>
                    ) : (
                        <View className="flex items-center space-x-1">
                            <View className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <View className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <View className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </View>
                    )}
                    {message.messageFiles?.length > 0 && (
                        <View
                            className="mt-2"
                        >
                            {message.messageFiles.map((file, index) => (
                                file.type === 'image' && (
                                    <Image
                                        key={index}
                                        src={file.url}
                                        className="max-w-full rounded-lg"
                                        mode="widthFix"
                                    />
                                )
                            ))}
                        </View>
                    )}
                </View>
            )}
            {message.isUser && (
                <View
                    className="px-3 py-4 max-w-[75%]"
                >
                    <Text
                        className="text-f1 break-words"
                        userSelect
                    >
                        {message.content}
                    </Text>
                </View>
            )}
        </View>
    )
}

// 消息列表组件
const MessageList = ({ messages, scrollViewRef }) => {
    // 移除防抖，改用直接滚动
    const scrollToBottom = () => {
        const query = Taro.createSelectorQuery()
        query.select('.messages-container')
            .boundingClientRect(rect => {
                if (rect) {
                    Taro.pageScrollTo({
                        scrollTop: rect.height,
                        duration: 100  // 减少动画时间，使滚动更快
                    })
                }
            })
            .exec()
    };

    // 监听消息变化立即滚动
    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom();
        }
    }, [messages]);

    return (
        <ScrollView
            scrollY
            className="flex-1 message-scroll-view"
            ref={scrollViewRef}
            scrollWithAnimation
            enhanced
            showScrollbar={false}
            onScrollToLower={scrollToBottom}  // 当滚动到底部时也触发滚动
        >
            <View className="py-3 px-3 messages-container">
                {messages.map((message, index) => (
                    <MessageBubble
                        key={message.messageId}
                        message={message}
                        isNew={index === messages.length - 1}
                    />
                ))}
            </View>
        </ScrollView>
    )
}

// 输入栏组件
const InputBar = ({ inputValue, onInputChange, onSend }) => {
    const [keyboardHeight, setKeyboardHeight] = useState(0)
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)
    const inputRef = useRef(null)
    const lastKeyboardHeightRef = useRef(0)

    const handleSendClick = () => {
        // 先收起键盘
        Taro.hideKeyboard()
        // 然后调用发送函数
        onSend()
    }

    useEffect(() => {
        let keyboardShowTimer = null
        let keyboardHideTimer = null

        const handleKeyboardShow = (res) => {
            // 清除可能存在的隐藏定时器
            if (keyboardHideTimer) {
                clearTimeout(keyboardHideTimer)
                keyboardHideTimer = null
            }

            const height = res.height
            lastKeyboardHeightRef.current = height

            // 立即更新键盘可见状态
            setIsKeyboardVisible(true)

            // 使用 requestAnimationFrame 确保平滑过渡
            requestAnimationFrame(() => {
                setKeyboardHeight(height)
            })

            // 获取输入框位置并确保其可见
            const query = Taro.createSelectorQuery()
            query.select('.input-container')
                .boundingClientRect(rect => {
                    if (rect) {
                        const windowHeight = Taro.getSystemInfoSync().windowHeight
                        const inputBottom = rect.bottom
                        const keyboardTop = windowHeight - height

                        if (inputBottom > keyboardTop) {
                            const scrollDistance = inputBottom - keyboardTop + 10 // 额外10px的缓冲
                            Taro.pageScrollTo({
                                scrollTop: scrollDistance,
                                duration: 100
                            })
                        }
                    }
                })
                .exec()
        }

        const handleKeyboardHide = () => {
            // 使用延迟来防止键盘收起时的闪烁
            keyboardHideTimer = setTimeout(() => {
                setIsKeyboardVisible(false)
                setKeyboardHeight(0)
            }, 100)
        }

        // 监听键盘事件
        Taro.onKeyboardHeightChange(res => {
            if (res.height > 0) {
                handleKeyboardShow(res)
            } else {
                handleKeyboardHide()
            }
        })

        // 监听页面显示事件，处理从后台恢复时的键盘状态
        Taro.eventCenter.on('PAGE_SHOW', () => {
            if (lastKeyboardHeightRef.current > 0) {
                setKeyboardHeight(lastKeyboardHeightRef.current)
                setIsKeyboardVisible(true)
            }
        })

        return () => {
            // 清理所有定时器和监听器
            if (keyboardShowTimer) clearTimeout(keyboardShowTimer)
            if (keyboardHideTimer) clearTimeout(keyboardHideTimer)
            Taro.offKeyboardHeightChange()
            Taro.eventCenter.off('PAGE_SHOW')
        }
    }, [])

    return (
        <View
            className={`fixed bottom-0 left-0 right-0 border-t border-gray-100 bg-bg input-container transition-transform duration-300 ease-out ${isKeyboardVisible ? 'shadow-lg' : ''}`}
            style={{
                transform: `translateY(-${keyboardHeight}px)`,
                paddingBottom: isKeyboardVisible ? '10px' : '0px'
            }}
        >
            <View className="flex items-center gap-3 px-3 py-4">
                <Input
                    className="flex-1 bg-white rounded-2xl px-5 py-3 text-f1"
                    value={inputValue}
                    onInput={onInputChange}
                    placeholder="输入消息..."
                    placeholderClass="text-f2"
                    ref={inputRef}
                    adjustPosition={false}
                    holdKeyboard={true}
                />
                <View
                    className="flex-none bg-f1 px-7 py-3 rounded-2xl"
                    onClick={handleSendClick}
                >
                    <Text className="text-white text-sm">发送</Text>
                </View>
            </View>
            {/* 底部安全区域 */}
            <View className={`h-[34px] ${isKeyboardVisible ? 'hidden' : ''}`} />
        </View>
    )
}

// ArrayBuffer 转字符串函数（用于真机环境）
const arrayBufferToString = (arr) => {
    if (typeof arr === "string") {
        return arr;
    }
    var dataview = new DataView(arr);
    var ints = new Uint8Array(arr.byteLength);
    for (var i = 0; i < ints.length; i++) {
        ints[i] = dataview.getUint8(i);
    }
    var str = "",
        _arr = ints;
    for (var i = 0; i < _arr.length; i++) {
        if (_arr[i]) {
            var one = _arr[i].toString(2),
                v = one.match(/^1+?(?=0)/);
            if (v && one.length == 8) {
                var bytesLength = v[0].length;
                var store = _arr[i].toString(2).slice(7 - bytesLength);
                for (var st = 1; st < bytesLength; st++) {
                    if (_arr[st + i]) {
                        store += _arr[st + i].toString(2).slice(2);
                    }
                }
                str += String.fromCharCode(parseInt(store, 2));
                i += bytesLength - 1;
            } else {
                str += String.fromCharCode(_arr[i]);
            }
        }
    }
    return str;
};

function Chat() {
    const [messages, setMessages] = useState([])
    const [inputValue, setInputValue] = useState('')
    const [isLoadingHistory, setIsLoadingHistory] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [firstId, setFirstId] = useState('')
    const scrollViewRef = useRef(null)
    const currentRequestRef = useRef(null)
    const conversationIdRef = useRef(getCurrentInstance()?.router?.params?.conversation_id || null)

    // 添加 useEffect 来处理初始化
    useEffect(() => {
        // 只有在有会话ID时，才获取历史消息
        if (conversationIdRef.current) {
            console.log('开始获取历史消息，会话ID:', conversationIdRef.current)
            fetchHistoryMessages(true)
        }
    }, [])

    // 获取历史消息
    const fetchHistoryMessages = async (isRefresh = false) => {
        try {
            setIsLoadingHistory(true)
            const userInfo = getStoredUserInfo()
            const userId = userInfo ? `user_${userInfo.nickName}` : `user_${Date.now()}`

            const response = await Taro.request({
                url: `${AI_CONFIG.api_url}/v1/messages`,
                method: 'GET',
                header: {
                    'Authorization': `Bearer ${AI_CONFIG.auth}`,
                },
                data: {
                    conversation_id: conversationIdRef.current,
                    user: userId,
                    first_id: isRefresh ? '' : firstId,
                    limit: 20
                }
            })

            if (response.statusCode === 200) {
                const { data, has_more } = response.data

                // 处理每个问答对，生成消息数组
                const allMessages = data.reduce((acc, qaItem) => {
                    const messagesFromQA = createMessagesFromQA(qaItem)
                    return [...acc, ...messagesFromQA]
                }, [])

                // 按时间戳排序
                const sortedMessages = allMessages.sort((a, b) => a.timestamp - b.timestamp)

                setMessages(prev => isRefresh ? sortedMessages : [...sortedMessages, ...prev])
                setHasMore(has_more)

                if (sortedMessages.length > 0) {
                    // 使用第一条消息的ID作为分页标记
                    setFirstId(sortedMessages[0].messageId)
                }

                // 自动滚动到底部
                setTimeout(() => {
                    const query = Taro.createSelectorQuery()
                    query.select('.messages-container')
                        .boundingClientRect(rect => {
                            if (rect) {
                                Taro.pageScrollTo({
                                    scrollTop: rect.height,
                                    duration: 300
                                })
                            }
                        })
                        .exec()
                }, 100)
            } else {
                throw new Error(`获取历史消息失败: ${response.statusCode}`)
            }
        } catch (error) {
            console.error('获取历史消息失败:', error)
            Taro.showToast({
                title: error.message || '获取对话记录失败',
                icon: 'error',
                duration: 2000
            })
        } finally {
            setIsLoadingHistory(false)
            Taro.stopPullDownRefresh()
        }
    }

    const callAI = async (userMessage) => {
        try {
            setIsLoading(true)

            if (currentRequestRef.current) {
                currentRequestRef.current = false
            }

            currentRequestRef.current = true

            // 添加用户消息
            const userMessageObj = createUserMessage(userMessage, conversationIdRef.current)
            setMessages(prev => [...prev, userMessageObj])

            const userInfo = getStoredUserInfo()
            const userId = userInfo ? `user_${userInfo.nickName}` : `user_${Date.now()}`

            const requestData = {
                query: userMessage,
                response_mode: "streaming",
                user: userId,
                inputs: {},
                files: []
            }

            if (conversationIdRef.current) {
                requestData.conversation_id = conversationIdRef.current
            }

            // 初始化空的AI回复
            const aiMessageObj = createAIMessage('', conversationIdRef.current)
            setMessages(prev => [...prev, aiMessageObj])

            let accumulatedContent = ''
            let currentThoughts = []
            let currentMessageFiles = []
            let hasMessageContent = false
            let hasReasoningContent = false
            let reasoningBuffer = ''
            let isOutputtingReasoning = false
            let outputBuffer = ''
            let outputInterval = null
            let accumulatedReasoning = ''  // 新增：用于累加所有的思考内容
            const BUFFER_INTERVAL = 80
            const BUFFER_MESSAGE = 80

            const startReasoningOutput = () => {
                if (isOutputtingReasoning) return

                isOutputtingReasoning = true
                outputInterval = setInterval(() => {
                    if (reasoningBuffer) {
                        outputBuffer += reasoningBuffer
                        reasoningBuffer = ''
                    }

                    if (outputBuffer) {
                        const outputLength = Math.min(BUFFER_MESSAGE, outputBuffer.length)
                        const chunk = outputBuffer.slice(0, outputLength)
                        outputBuffer = outputBuffer.slice(outputLength)

                        // 累加思考内容
                        accumulatedReasoning += chunk
                        currentThoughts = [{ thought: accumulatedReasoning }]

                        setMessages(prev => {
                            const newMessages = [...prev]
                            const lastMessage = newMessages[newMessages.length - 1]
                            if (!lastMessage.isUser) {
                                newMessages[newMessages.length - 1] = {
                                    ...createAIMessage(
                                        accumulatedContent,
                                        conversationIdRef.current,
                                        currentMessageFiles,
                                        currentThoughts
                                    ),
                                    key: Date.now()
                                }
                            }
                            return newMessages
                        })
                    }
                }, BUFFER_INTERVAL)
            }
            console.log('auth info', `${AI_CONFIG.auth}`)

            const task = wx.request({
                url: `${AI_CONFIG.api_url}/v1/chat-messages`,
                method: 'POST',
                header: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${AI_CONFIG.auth}`,
                    'Accept': 'text/event-stream'
                },
                data: requestData,
                enableChunked: true,
                success: (res) => {
                    if (res.statusCode === 404) {
                        throw new Error('对话不存在，请重新开始对话')
                    }
                    if (res.statusCode !== 200) {
                        throw new Error(`请求失败: ${res.statusCode}`)
                    }
                },
                fail: (error) => {
                    console.error('请求失败：', error)
                    Taro.showToast({
                        title: error.errMsg || '请求失败',
                        icon: 'error',
                        duration: 2000
                    })
                    throw error
                }
            })

            task.onChunkReceived(function (response) {

                try {
                    if (!currentRequestRef.current) {
                        console.log('当前请求已取消')
                        return
                    }


                    let texts
                    try {
                        if (process.env.TARO_ENV === 'weapp' && Taro.getAppBaseInfo().platform === 'devtools') {
                            const decoder = new TextDecoder('utf-8')
                            texts = decoder.decode(response.data)
                        } else {
                            texts = arrayBufferToString(response.data)
                        }

                        console.log('--------------texts', {
                            texts
                        })


                    } catch (decodeError) {
                        console.error('数据解码失败:', decodeError)
                        return
                    }

                    if (!texts || typeof texts !== 'string') {
                        return
                    }

                    const textArray = texts.split('\n')

                    textArray.forEach(text => {
                        // 打印接受到的每一个chunk的内容
                        console.log('text', {
                            text
                        })

                        if (!text.trim() || text.trim() === 'data: ping') {
                            return
                        }

                        if (text.startsWith('data: ')) {

                            try {
                                const jsonString = text.replace(/^data:\s*/, '')
                                if (jsonString.trim().startsWith('{') && jsonString.trim().endsWith('}')) {
                                    const parsedData = JSON.parse(jsonString)

                                    // 打印接受到的每一个chunk的内容
                                    console.log('chunk', {
                                        类型: parsedData.event,
                                        parsedData: parsedData
                                    })

                                    switch (parsedData.event) {
                                        case 'message':
                                        case 'agent_message':
                                            if (parsedData.answer !== undefined) {
                                                let content = parsedData.answer
                                                if (!hasMessageContent) {
                                                    content = content.replace(/^[\s\n]+/, '')
                                                    if (/[^\s\n]/.test(content)) {
                                                        hasMessageContent = true
                                                    }
                                                }
                                                accumulatedContent += content

                                                if (parsedData.conversation_id && !conversationIdRef.current) {
                                                    conversationIdRef.current = parsedData.conversation_id
                                                }

                                                setMessages(prev => {
                                                    const newMessages = [...prev]
                                                    const lastMessage = newMessages[newMessages.length - 1]
                                                    if (!lastMessage.isUser) {
                                                        newMessages[newMessages.length - 1] = {
                                                            ...createAIMessage(
                                                                accumulatedContent,
                                                                parsedData.conversation_id,
                                                                currentMessageFiles,
                                                                currentThoughts
                                                            ),
                                                            key: Date.now()
                                                        }
                                                    }
                                                    return newMessages
                                                })
                                            }
                                            break

                                        case 'agent_reasoning':
                                            if (parsedData.reasoning_content) {
                                                let content = parsedData.reasoning_content
                                                console.log('--------------reasoning_content', {
                                                    content
                                                })

                                                if (!hasReasoningContent) {
                                                    content = content.replace(/^[\s\n]+/, '')
                                                    if (/[^\s\n]/.test(content)) {
                                                        hasReasoningContent = true
                                                    }
                                                }

                                                reasoningBuffer += content
                                                if (!isOutputtingReasoning) {
                                                    startReasoningOutput()
                                                }
                                            }
                                            break

                                        case 'agent_reasoning_end':
                                            if (reasoningBuffer) {
                                                outputBuffer += reasoningBuffer
                                                reasoningBuffer = ''
                                            }

                                            const waitForComplete = () => {
                                                if (outputBuffer) {
                                                    setTimeout(waitForComplete, BUFFER_INTERVAL)
                                                } else {
                                                    if (outputInterval) {
                                                        clearInterval(outputInterval)
                                                        outputInterval = null
                                                    }
                                                    isOutputtingReasoning = false
                                                    hasReasoningContent = false
                                                }
                                            }
                                            waitForComplete()
                                            break

                                        case 'message_end':
                                            hasMessageContent = false
                                            setIsLoading(false)
                                            if (parsedData.conversation_id) {
                                                const userInfo = getStoredUserInfo()
                                                const userId = userInfo ? `user_${userInfo.nickName}` : `user_${Date.now()}`

                                                wx.request({
                                                    url: `${AI_CONFIG.api_url}/v1/conversations/${parsedData.conversation_id}/name`,
                                                    method: 'POST',
                                                    header: {
                                                        'Content-Type': 'application/json',
                                                        'Authorization': `Bearer ${AI_CONFIG.auth}`,
                                                    },
                                                    data: {
                                                        auto_generate: true,
                                                        user: userId
                                                    },
                                                    success: (response) => {
                                                        console.log('标题生成成功，状态码:', response.statusCode)
                                                        console.log('标题生成响应数据:', response.data)
                                                        if (response.data && response.data.name) {
                                                            console.log('生成的标题为:', response.data.name)
                                                        }
                                                    },
                                                    fail: (error) => {
                                                        console.error('标题生成失败，详细错误:', error)
                                                        Taro.showToast({
                                                            title: '标题生成失败',
                                                            icon: 'error',
                                                            duration: 2000
                                                        })
                                                    }
                                                })
                                            } else {
                                                console.warn('未获取到 conversation_id，跳过标题生成')
                                            }
                                            break

                                        case 'error':
                                            throw new Error(parsedData.message || '未知错误')
                                    }
                                } else {
                                    console.error('无效的 JSON 格式:', jsonString)
                                }
                            } catch (parseError) {
                                console.error('JSON解析失败:', parseError, '原始文本:', text)
                            }
                        }
                    })
                } catch (error) {
                    console.error('数据块处理错误:', error)
                    Taro.showToast({
                        title: error.message || '消息处理失败',
                        icon: 'error',
                        duration: 2000
                    })
                }
            })

            // 等待请求完成
            await new Promise((resolve, reject) => {
                task.onHeadersReceived(() => {
                    console.log('收到响应头')
                })

                // 监听请求完成
                task.complete = function (res) {
                    if (res.errMsg && res.errMsg.indexOf('fail') !== -1) {
                        reject(new Error(res.errMsg))
                    } else {
                        resolve(res)
                    }
                }
            })

        } catch (error) {
            console.error('AI 请求失败:', error)
            const errorMessage = error.statusCode === 404 ? '对话不存在，请重新开始对话。' :
                error.statusCode === 400 ? '请求参数有误，请检查输入。' :
                    error.statusCode === 500 ? '服务器内部错误，请稍后重试。' :
                        '抱歉，发生了一些错误，请稍后再试。'

            Taro.showToast({
                title: errorMessage,
                icon: 'error',
                duration: 2000
            })

            setMessages(prev => {
                const newMessages = [...prev]
                const lastMessage = newMessages[newMessages.length - 1]
                if (!lastMessage.isUser) {
                    newMessages[newMessages.length - 1] = createAIMessage(
                        errorMessage,
                        conversationIdRef.current
                    )
                }
                return newMessages
            })
        } finally {
            setIsLoading(false)
            currentRequestRef.current = null
        }
    }

    const handleInputChange = (e) => {
        setInputValue(e.detail.value)
    }

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage = inputValue.trim();
        setInputValue('');

        // 调用 AI API
        await callAI(userMessage);
    }

    return (
        <View className="min-h-screen flex flex-col bg-bg">
            {/* 顶部安全区域 */}
            <View className="h-[88px]" />

            {/* 顶部导航区域 */}
            <View className="z-50 fixed top-[56px] left-0 right-0 flex items-center px-3">
                <BackButton />
                {/* 只有在有会话ID时才显示历史记录按钮 */}
                <View
                    className="fixed top-[52px] left-16 z-10 h-8 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl shadow-sm active:scale-90 transition-transform px-4"
                    onClick={() => {
                        Taro.navigateTo({
                            url: '/pages/conversationlist'
                        })
                    }}
                >
                    <Text className="text-f1 text-sm">历史记录</Text>
                </View>
            </View>

            {/* 消息列表 */}
            <View className="flex-1 pb-[98px]">
                <MessageList
                    messages={messages}
                    scrollViewRef={scrollViewRef}
                />
                {isLoadingHistory && (
                    <View className="py-3 flex justify-center items-center space-x-2">
                        <View className="flex items-center space-x-1">
                            <View className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <View className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <View className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </View>
                        <Text className="text-f2 ml-2">加载中</Text>
                    </View>
                )}
            </View>

            {/* 输入区域 */}
            <InputBar
                inputValue={inputValue}
                onInputChange={handleInputChange}
                onSend={handleSend}
            />
        </View>
    )
}

export default Chat 