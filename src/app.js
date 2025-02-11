/**
 * App.js - Taro 小程序的全局入口组件
 * 
 * 这是一个 Taro 框架下的微信小程序主入口文件，继承自 React Component
 * 主要职责：
 * 1. 提供全局的应用生命周期管理
 * 2. 提供全局的状态管理和配置
 * 3. 作为所有页面的父容器
 */

import './polyfills'  // 引入 polyfills 以支持更多的 ES6+ 特性
import { Component } from 'react'
import Taro from '@tarojs/taro'
import './app.css'    // 全局样式文件
import 'taro-ui/dist/style/index.scss'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isLoggedIn: false,
      openId: null
    }
  }

  /**
   * 检查登录状态
   * @returns {Promise<boolean>} 返回是否已登录
   */
  async checkLoginStatus() {
    try {
      const token = Taro.getStorageSync('token')
      const openId = Taro.getStorageSync('openId')

      if (!token || !openId) return false

      // TODO: 这里可以添加token校验逻辑
      // const res = await Taro.request({
      //   url: 'https://your-api.com/verify-token',
      //   method: 'POST',
      //   header: { Authorization: token }
      // })

      this.setState({ isLoggedIn: true, openId })
      return true
    } catch (error) {
      console.error('检查登录状态失败:', error)
      return false
    }
  }

  /**
   * 执行微信登录
   * @returns {Promise} 返回登录结果
   */
  async login() {
    try {
      // 调用微信登录接口获取登录凭证（code）
      const { code } = await Taro.login()

      if (!code) {
        throw new Error('获取 code 失败')
      }

      console.log('获取登录凭证成功，code:', code)

      // TODO: 发送 code 到开发者服务器，换取 openId、sessionKey、unionId
      // const res = await Taro.request({
      //   url: 'https://your-api.com/api/login',
      //   method: 'POST',
      //   data: { code }
      // })

      // const { openId, token } = res.data

      // 模拟服务器返回数据
      const mockOpenId = 'mock_openid_' + code
      const mockToken = 'mock_token_' + code

      // 保存登录态
      Taro.setStorageSync('token', mockToken)
      Taro.setStorageSync('openId', mockOpenId)

      this.setState({
        isLoggedIn: true,
        openId: mockOpenId
      })

      return { success: true, openId: mockOpenId }
    } catch (error) {
      console.error('登录错误:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * 执行登录流程
   */
  async handleLogin() {
    const loginResult = await this.login()

    if (loginResult.success) {
      Taro.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 2000
      })
    } else {
      Taro.showToast({
        title: '登录失败',
        icon: 'error',
        duration: 2000
      })
    }
  }

  /**
   * componentDidMount 生命周期
   * 在小程序环境中对应 app 的 onLaunch
   * 整个应用只执行一次，在这里执行登录检查和云开发初始化
   */
  async componentDidMount() {
    // 初始化云开发环境
    if (!Taro.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      Taro.cloud.init({
        env: 'lightroom-8go5lyr26535007e', // 请将 your-env-id 替换为你的云开发环境 ID
        traceUser: true // 是否要捕捉每个用户的访问记录。设置为true，用户可在管理端看到用户访问记录
      })
    }

    // 检查是否已登录
    const isLoggedIn = await this.checkLoginStatus()

    if (!isLoggedIn) {
      // 未登录，执行登录流程
      this.handleLogin()
    }
  }

  /**
   * componentDidShow 生命周期
   * 在小程序环境中对应 app 的 onShow
   * 当小程序从后台进入前台时触发，检查登录状态
   */
  async componentDidShow() {
    // 每次进入前台都检查登录状态
    await this.checkLoginStatus()
  }

  /**
   * componentDidHide 生命周期
   * 在小程序环境中对应 app 的 onHide
   * 当小程序从前台进入后台时触发
   */
  componentDidHide() { }

  /**
   * render 函数
   * 渲染应用的根组件，this.props.children 将包含所有的页面组件
   * 这里使用了 Tailwind CSS 的样式配置，设置了全局背景色
   * @returns {ReactNode} 返回根组件的 JSX 结构
   */
  render() {
    return (
      <div className="bg-[#F5F4F2]">
        {this.props.children}
      </div>
    )
  }
}

export default App
