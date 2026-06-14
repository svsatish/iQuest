import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/iQuest/',
  title: 'iQuest',
  description: 'Agentic Test Harness — AI-powered browser and API test automation. Write tests in plain English. Discover. Validate. Assure.',
  head: [
    ['link', { rel: 'icon', href: '/favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#EB521E' }],
  ],
  themeConfig: {
    logo: '/logo_light_mode.svg',
    nav: [
      { text: 'Documentation', link: '/' },
      { text: 'Quickstart', link: '/quickstart' },
      { text: 'How It Works', link: '/how-it-works' },
    ],
    sidebar: [
      {
        text: 'Documentation',
        items: [
          { text: 'Introduction', link: '/' },
          { text: 'Quickstart', link: '/quickstart' },
          { text: 'How It Works', link: '/how-it-works' },
        ],
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/svsatish/iQuest' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/iquest' },
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 Satish Saripella',
    },
    editLink: {
      pattern: 'https://github.com/svsatish/iQuest/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },
    search: {
      provider: 'local',
    },
  },
})