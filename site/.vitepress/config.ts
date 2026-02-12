import { defineConfig } from 'vitepress';

export default defineConfig({
  title: '我的日报',
  description: '记录每一天的成长',
  lang: 'zh-CN',
  
  base: '/{{REPO_NAME}}/',  // 根据你的仓库名修改
  
  // 启用 Vue 支持
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => false
      }
    }
  },
  
  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: '首页', link: '/' },
      { text: '日历', link: '/calendar' },
      { text: '归档', link: '/archive' },
      { text: '统计', link: '/stats' }
    ],
    
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索日报',
            buttonAriaLabel: '搜索日报'
          },
          modal: {
            noResultsText: '无法找到相关结果',
            resetButtonTitle: '清除查询条件',
            footer: {
              selectText: '选择',
              navigateText: '切换'
            }
          }
        }
      }
    },
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/{{REPO_OWNER}}/{{REPO_NAME}}' }
    ],
    
    footer: {
      message: '基于 VitePress 构建',
      copyright: `Copyright © ${new Date().getFullYear()}`
    }
  },
  
  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    lineNumbers: true
  },
  
  sitemap: {
    hostname: 'https://{{REPO_OWNER}}.github.io/{{REPO_NAME}}'
  }
});
