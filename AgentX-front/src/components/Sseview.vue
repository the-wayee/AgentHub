<template>
  <div class="sse-container">
    <h2>SSE 实时消息</h2>
    <ul>
      <li v-for="(msg, index) in messages" :key="index">{{ msg }}</li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
const messages = ref<string[]>([]);
let eventSource: EventSource
onMounted(() => {
  eventSource = new EventSource("http://127.0.0.1:8888/chat/stream");

  eventSource.onmessage = (event: MessageEvent) => {
    messages.value.push(event.data)
  }

  eventSource.onerror = (error) => {
    console.error('SSE 连接错误:', error)
    eventSource?.close()
  }
  
});

onBeforeUnmount(() => {
  eventSource?.close()
})
</script>

<style scoped>
.sse-container {
  padding: 20px;
}
</style>
