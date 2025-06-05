<template>
  <div class="home-page">
    <!-- 欢迎区域 -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">醒客自主智能体</h1>
        <p class="hero-subtitle">打造您的专属AI助手，提升工作效率</p>
        <div class="hero-actions">
          <el-button type="primary" size="large" @click="goToWorkspace">
            <el-icon class="mr-2"><ArrowRight /></el-icon>
            开始使用
          </el-button>
          <el-button size="large" @click="showFeatures">
            了解更多
          </el-button>
        </div>
      </div>
      <div class="hero-image">
        <div class="ai-avatar">
          <el-icon size="120"><Avatar /></el-icon>
        </div>
      </div>
    </section>

    <!-- 功能特性 -->
    <section class="features-section" v-show="featuresVisible">
      <div class="container">
        <h2 class="section-title">核心功能</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <el-icon size="48"><Setting /></el-icon>
            </div>
            <h3>智能体配置</h3>
            <p>灵活配置AI助手的角色、能力和行为模式，打造专属的智能助手</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <el-icon size="48"><ChatDotRound /></el-icon>
            </div>
            <h3>智能对话</h3>
            <p>支持多轮对话，理解上下文，提供准确、有用的回答和建议</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <el-icon size="48"><DataBoard /></el-icon>
            </div>
            <h3>数据源整合</h3>
            <p>连接多种数据源，让AI助手具备更丰富的知识和信息处理能力</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <el-icon size="48"><Operation /></el-icon>
            </div>
            <h3>工作区管理</h3>
            <p>统一管理多个智能体项目，提供清晰的工作流程和协作环境</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 快速开始 -->
    <section class="quick-start-section">
      <div class="container">
        <h2 class="section-title">快速开始</h2>
        <div class="steps">
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h3>创建工作区</h3>
              <p>设置您的专属工作环境</p>
            </div>
          </div>
          <div class="step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h3>配置智能体</h3>
              <p>定义AI助手的角色和能力</p>
            </div>
          </div>
          <div class="step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h3>开始对话</h3>
              <p>与您的AI助手进行交互</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ArrowRight, 
  Avatar, 
  Setting, 
  ChatDotRound, 
  DataBoard, 
  Operation 
} from '@element-plus/icons-vue'

const router = useRouter()
const featuresVisible = ref(false)

const goToWorkspace = () => {
  router.push('/workspace')
}

const showFeatures = () => {
  featuresVisible.value = true
  document.querySelector('.features-section').scrollIntoView({ 
    behavior: 'smooth' 
  })
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.hero-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 100vh;
  padding: 0 5%;
  max-width: 1200px;
  margin: 0 auto;
}

.hero-content {
  flex: 1;
  max-width: 500px;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: #7f8c8d;
  margin-bottom: 2rem;
  line-height: 1.5;
}

.hero-actions {
  display: flex;
  gap: 1rem;
}

.hero-image {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.ai-avatar {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.features-section {
  padding: 5rem 0;
  background: white;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 3rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  color: #667eea;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.feature-card p {
  color: #7f8c8d;
  line-height: 1.6;
}

.quick-start-section {
  padding: 5rem 0;
  background: #f8f9fa;
}

.steps {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-top: 3rem;
  flex-wrap: wrap;
  gap: 2rem;
}

.step {
  display: flex;
  align-items: center;
  gap: 1rem;
  max-width: 300px;
}

.step-number {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.25rem;
}

.step-content h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.step-content p {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.mr-2 {
  margin-right: 8px;
}

@media (max-width: 768px) {
  .hero-section {
    flex-direction: column;
    text-align: center;
    padding: 2rem 1rem;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.125rem;
  }
  
  .hero-actions {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .ai-avatar {
    width: 150px;
    height: 150px;
    margin-top: 2rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .steps {
    flex-direction: column;
  }
}
</style>