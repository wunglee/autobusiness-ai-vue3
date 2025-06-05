<template>
  <div class="workspace-layout">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <h1>醒客自主智能体</h1>
        </div>
        <nav class="nav-menu">
          <router-link to="/workspace" class="nav-item" active-class="active">
            工作空间
          </router-link>
          <router-link to="/workspace/agent-config" class="nav-item" active-class="active">
            智能体
          </router-link>
          <router-link to="/workspace/chat" class="nav-item" active-class="active">
            MCP
          </router-link>
          <router-link to="/workspace/datasource" class="nav-item" active-class="active">
            大模型
          </router-link>
        </nav>
        <div class="user-menu">
          <el-button type="primary" size="small">登录</el-button>
          <el-button plain size="small">注册</el-button>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
// 布局组件
</script>

<style scoped>
.workspace-layout {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 64px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.logo h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: white;
}

.nav-menu {
  display: flex;
  gap: 32px;
  flex: 1;
  justify-content: center;
}

.nav-item {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-item.active {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.user-menu {
  display: flex;
  gap: 12px;
}

.main-content {
  flex: 1;
  overflow: hidden;
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
  }

  .nav-menu {
    gap: 16px;
  }

  .nav-item {
    padding: 6px 12px;
    font-size: 14px;
  }

  .logo h1 {
    font-size: 18px;
  }
}
</style>