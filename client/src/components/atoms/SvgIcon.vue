<template>
    <component :class="[width, clickable ? 'cursor-pointer' : ''].concat(' ')" :is="getIconComponent" />
  </template>
  
  <script>
  import icons from '../../assets/icons/index';
  
  export default {
    props: {
      icon: {
        type: String,
        required: true
      },
      width: {
        type: String,
        default: 'w-4'
      },
      clickable:{
        type: Boolean,
        default: false
      }
    },
    computed: {
      getIconComponent() {
        return icons[this.icon] || null;
      }
    }
  };
  </script>
  