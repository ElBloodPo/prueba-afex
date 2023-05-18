<template>
    <div id="myModal" class="modal fade" ref="myModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content" style="padding: 1rem;">
          <div class="modal-header" style="border-bottom: 0;">
            <h5 class="modal-title" id="myModalLabel">
            </h5>
            <button type="button" class="btn-close" @click="hideModal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <slot name="body"></slot>

          </div>
        </div>
      </div>
    </div>
  </template>
  
<script setup>
  import { Modal } from 'bootstrap';
  import { watchEffect, onMounted, ref, defineEmits, defineProps } from 'vue'
  
  const props = defineProps({
    showModal: {
      type: Boolean,
      default: false
    }
  });
  
  let modalInstance = ref(null);
  
  onMounted(() => {
    modalInstance.value = new Modal(document.getElementById('myModal'), {
      target: "body",
      backdrop: 'static',
      keyboard:false
    });
  });
  
  watchEffect(() => {
    if (props.showModal === true && modalInstance.value) {
      modalInstance.value.show();
    }
  });
  
  const emit = defineEmits('close-modal');
  
  function hideModal() {
    if (modalInstance.value) {
      modalInstance.value.hide();
      emit('close-modal');
    }
  }
  
  </script>