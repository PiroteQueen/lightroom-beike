/**
 * 消息类型定义
 * @typedef {Object} Message
 * @property {string} messageId - 消息唯一标识
 * @property {string} content - 消息内容
 * @property {boolean} isUser - 是否为用户消息
 * @property {string} [conversationId] - 可选的会话ID
 * @property {number} timestamp - 消息创建时间戳
 * @property {Object[]} [messageFiles] - 可选的消息附件
 * @property {Object[]} [agentThoughts] - 可选的AI思考过程
 */

/**
 * 创建用户消息
 * @param {string} content - 消息内容
 * @param {string} [conversationId] - 可选的会话ID
 * @param {number} [timestamp] - 可选的时间戳
 * @returns {Message}
 */
export const createUserMessage = (content, conversationId = null, timestamp = Date.now()) => ({
    messageId: `user_${timestamp}`,
    content,
    isUser: true,
    conversationId,
    timestamp,
    messageFiles: [],
    agentThoughts: []
});

/**
 * 创建AI消息
 * @param {string} content - 消息内容
 * @param {string} [conversationId] - 可选的会话ID
 * @param {Object[]} [messageFiles] - 可选的消息附件
 * @param {Object[]} [agentThoughts] - 可选的AI思考过程
 * @param {number} [timestamp] - 可选的时间戳
 * @returns {Message}
 */
export const createAIMessage = (content, conversationId = null, messageFiles = [], agentThoughts = [], timestamp = Date.now()) => ({
    messageId: `ai_${timestamp}`,
    content,
    isUser: false,
    conversationId,
    timestamp,
    messageFiles,
    agentThoughts
});

/**
 * 从问答对创建消息数组
 * @param {Object} qaItem - API返回的问答对对象
 * @returns {Message[]} 返回包含用户消息和AI消息的数组
 */
export const createMessagesFromQA = (qaItem) => {
    const timestamp = qaItem.created_at * 1000; // 转换为毫秒
    const messages = [];

    // 创建用户消息
    if (qaItem.query) {
        messages.push(createUserMessage(
            qaItem.query,
            qaItem.conversation_id,
            timestamp
        ));
    }

    // 创建AI消息
    if (qaItem.answer) {
        messages.push(createAIMessage(
            qaItem.answer,
            qaItem.conversation_id,
            qaItem.message_files || [],
            qaItem.agent_thoughts || [],
            timestamp
        ));
    }

    return messages;
};
