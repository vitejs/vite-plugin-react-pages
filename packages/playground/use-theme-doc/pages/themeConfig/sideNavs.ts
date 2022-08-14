import type { DefaultSideNavsOpts } from '../themeDev'

export const sideNavsConfig: { [locale: string]: DefaultSideNavsOpts } = {
  en: {
    groupConfig: {
      components: {
        overview: {
          label: 'Overview',
          order: 1,
        },
        general: {
          label: 'General',
          order: 2,
        },
        'data-display': {
          label: 'Data Display',
          order: 3,
        },
        layout: {
          label: 'Layout',
          order: 4,
        },
      },
      reference: {
        concepts: {
          label: 'Concepts',
          order: 1,
        },
        'cli-commands': {
          label: 'CLI Commands',
          order: 2,
        },
        'error-codes': {
          label: 'Error Codes',
          order: 3,
        },
      },
    },
  },
  zh: {
    groupConfig: {
      '/': {
        'sub-group': {
          label: '小分组',
        },
      },
      components: {
        overview: {
          label: '概览',
          order: 1,
        },
        general: {
          label: '通用',
          order: 2,
        },
        'data-display': {
          label: '数据展示',
          order: 3,
        },
        layout: {
          label: '布局',
          order: 4,
        },
      },
    },
  },
}
