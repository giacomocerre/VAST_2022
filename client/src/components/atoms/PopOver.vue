<template>
    <div class="text-gray-400 w-full relative z-50">
      <svg-icon icon="question" @click.stop="togglePopover" class="float-right" :clickable="true" />
      <div v-if="isPopoverVisible" class="popover w-40 right-0 rounded" ref="popover">
        <svg-icon icon="close" @click="hidePopover" class="float-right wb-10" :clickable="true"/>
        <p>{{ value }}</p>
      </div>
    </div>
  </template>
  
  <script>
  import SvgIcon from '../atoms/SvgIcon.vue';
  
  export default {
    components: { SvgIcon },
    props :{
        value: {
            type: String,
            required: true,
            default: 'This value represents the average age of the participants in the dataset.'
        }
    },
    data() {
      return {
        isPopoverVisible: false,
      };
    },
    methods: {
      togglePopover() {
        this.isPopoverVisible = !this.isPopoverVisible;
        if (this.isPopoverVisible) {
          document.addEventListener('click', this.handleOutsideClick);
        } else {
          document.removeEventListener('click', this.handleOutsideClick);
        }
      },
      hidePopover() {
        this.isPopoverVisible = false;
        document.removeEventListener('click', this.handleOutsideClick);
      },
      handleOutsideClick(event) {
        const popover = this.$refs.popover;
        if (popover && !popover.contains(event.target)) {
          this.hidePopover();
        }
      },
    },
  };
  </script>
  
  <style scoped>
  /* Stili opzionali per il tuo componente */
  .popover {
    position: absolute;
    background-color: #fff;
    border: 1px solid #ccc;
    padding: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  </style>
  