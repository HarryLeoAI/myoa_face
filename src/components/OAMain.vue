<script setup name="OAMain">
import OAPageHeader from '@/components/OAPageHeader.vue'
import { defineProps } from 'vue'

let props = defineProps({
  // eslint-disable-next-line vue/require-prop-type-constructor
  title: '',
})
</script>

<template>
  <el-space style="width: 100%" direction="vertical" fill="true" :size="15">
    <OAPageHeader :content="props.title"></OAPageHeader>

    <!-- 待填充的默认插槽 -->
    <slot></slot>
  </el-space>
</template>

<style scoped></style>
