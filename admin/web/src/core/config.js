/**
 * 网站配置文件
 */
const greenText = (text) => `\x1b[32m${text}\x1b[0m`

const getEnv = (key, fallback) => {
  const value = process?.env?.[key]
  return value === undefined || value === '' ? fallback : value
}

const config = {
  appName: getEnv('VITE_BRAND_NAME', '垣码平台管理中心'),
  appLogo: getEnv('VITE_BRAND_LOGO_URL', 'logo.png'),
  showViteLogo: true,
  logs: [],
  copyrightText: getEnv('VITE_COPYRIGHT_TEXT', 'Copyright © 2025 我方公司 版权所有'),
}

export const viteLogo = (env) => {
  if (config.showViteLogo) {
    
    
    
    
    
    
    
    
    
    
    
    
    console.log('\n')
  }
}

export default config
