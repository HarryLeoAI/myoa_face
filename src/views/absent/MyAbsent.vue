<script setup>
import OAPageHeader from '@/components/OAPageHeader.vue'
</script>

<template>
  <el-space style="width: 100%" direction="vertical" fill="true" :size="15">
    <OAPageHeader content="个人考勤"></OAPageHeader>
    <el-card style="text-align: right">
      <el-button type="primary">
        <el-icon><Plus /></el-icon>
        <span>发起考勤</span>
      </el-button>
    </el-card>
  </el-space>
</template>

<style scoped></style>
