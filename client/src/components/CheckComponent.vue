Copy code
<template>
  <div class="inline-flex items-center">
    <div class="checkbox-wrapper-2 relative flex items-center p-1 rounded-full cursor-pointer">
      <input
        type="checkbox"
        class="sc-gJwTLC ikxBAC"
        :style="{ backgroundColor: check.active ? check.color : '' }"
        :id="checkboxId"
        @change="handleChange"
        :checked="check.active"
      />
      <span class="text-xs pl-1">{{ check.value }}</span>
    </div>
  </div>
</template>

<script>

export default {
  props: {
    check: Object,
  },
  computed: {
    checkboxId() {
      return `checkbox-${Math.random().toString(36).substring(2, 15)}`;
    },
    addClass() {
      return "before:content[''] peer relative h-4 w-4 cursor-pointer appearance-none rounded-md border border-blue-gray-200 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-10 before:w-10 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacit hover:before:opacity-10 " + this.check.color
    }
  },
  methods: {
    handleChange(event) {
      this.$emit('checkChange', event.target.checked);
    },
  },
};
</script>
<style scoped>
.checkbox-wrapper-2 .ikxBAC {
  appearance: none;
  background-color: #dfe1e4;
  border-radius: 72px;
  border-style: none;
  flex-shrink: 0;
  height: 20px;
  margin: 0;
  position: relative;
  width: 30px;
}

.checkbox-wrapper-2 .ikxBAC::before {
  bottom: -6px;
  content: "";
  left: -6px;
  position: absolute;
  right: -6px;
  top: -6px;
}

.checkbox-wrapper-2 .ikxBAC,
.checkbox-wrapper-2 .ikxBAC::after {
  transition: all 100ms ease-out;
}

.checkbox-wrapper-2 .ikxBAC::after {
  background-color: #fff;
  border-radius: 50%;
  content: "";
  height: 14px;
  left: 3px;
  position: absolute;
  top: 3px;
  width: 14px;
}

.checkbox-wrapper-2 input[type=checkbox] {
  cursor: default;
}

.checkbox-wrapper-2 .ikxBAC:hover {
  background-color: #c9cbcd;
  transition-duration: 0s;
}

.checkbox-wrapper-2 .ikxBAC:checked::after {
  background-color: #fff;
  left: 13px;
}

.checkbox-wrapper-2 :focus:not(.focus-visible) {
  outline: 0;
}
</style>
