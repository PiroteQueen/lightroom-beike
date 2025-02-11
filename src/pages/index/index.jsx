import React, { useState } from 'react'
import { View } from '@tarojs/components'
import Tabbar from '../../components/Tabbar/index'
import Navbar from '../../components/Navbar/index'
import Home from '../homepage'
import Profile from '../presetx'


function Index() {
  const [currentTab, setCurrentTab] = useState('home')

  const renderPage = () => {
    const pages = {
      home: <Home />,
      profile: <Profile />
    }
    return pages[currentTab] || pages.home
  }

  return (
    <View className="h-[100vh] flex flex-col bg-[#F5F4F2] overflow-hidden" scrollY={false}>
      <View className="flex-none">
        <Navbar />
      </View>
      <View className="flex-1 overflow-hidden">
        {renderPage()}
      </View>
      <View className="flex-none">
        <Tabbar currentTab={currentTab} onTabChange={setCurrentTab} />
      </View>
    </View>
  )
}

export default Index 