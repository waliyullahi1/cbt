<template>
  <button @click="handleLogoClick" class="flex items-center font-bold gap-3 text-4xl text-secondary marcellus">
    <img src="/images/logos.png" alt="Logo"   class=" w-20  sm:w-40 object-contain" />
     

      
     </button>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const config = useRuntimeConfig()
const projectName = config.public.projectName
defineProps({

})

const handleLogoClick = () => {
  
  
  router.push('/')
}
</script>