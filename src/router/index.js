import WorkspaceLayout from '@/layouts/WorkspaceLayout.vue'
import HomePage from '@/views/HomePage.vue'
import WorkspacePage from '@/views/Workspace/WorkspacePage.vue'
import AgentConfigPage from '@/views/AgentConfig/AgentConfigPage.vue'
import McpPage from '@/views/Mcp/McpPage.vue'
import LlmPage from '@/views/llm/LlmPage.vue'
import DataSourcePage from '@/views/DataSources/DataSourcePage.vue'

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
        path: 'agent',
        name: 'AgentConfig',
        component: AgentConfigPage
      },
      {
        path: 'mcp',
        name: 'Mcp',
        component: McpPage
      },
      {
        path: 'datasource',
        name: 'DataSource',
        component: DataSourcePage
      },
      {
        path: 'llm',
        name: 'Llm',
        component: LlmPage
      },
    ]
  }
]

export default routes