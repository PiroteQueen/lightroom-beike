export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/chat',
    'pages/articles',
    'pages/conversationlist',
    'pages/dashboard'
  ],
  window: {
    backgroundTextStyle: 'light',
    backgroundColor: '#F5F4F2',
    navigationBarBackgroundColor: '#F5F4F2',
    navigationBarTitleText: 'Lightroom',
    navigationBarTextStyle: 'black',
    navigationStyle: 'custom'
  }
})
