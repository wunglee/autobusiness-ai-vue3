import { createRouter, createWebHistory } from 'vue-router'
import WorkspaceLayout from '@/layouts/WorkspaceLayout.vue'
import HomePage from '@/views/HomePage.vue'
import WorkspacePage from '@/views/WorkspacePage.vue'
import AgentConfigPage from '@/views/AgentConfigPage.vue'
import ChatPage from '@/views/ChatPage.vue'
import DataSourcePage from '@/views/DataSourcePage.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/workspace',
    component: WorkspaceLayout,
    children: [
      {
        path: '',
        name: 'Workspace',
        component: WorkspacePage
      },
      {
        path: 'agent-config/:id?',
        name: 'AgentConfig',
        component: AgentConfigPage
      },
      {
        path: 'chat/:agentId?',
        name: 'Chat',
        component: ChatPage
      },
      {
        path: 'datasource',
        name: 'DataSource',
        component: DataSourcePage
      }
    ]
  }
]

export default routes