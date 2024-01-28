<template>
    <div>
      <input type="radio" name="option" :id="index" :value='value' class="peer hidden" :checked="index===0" @change="emitOptionValue" />
      <label
        :for="index"
        :class="classes"
      >
        {{value}}
      </label>
    </div>
  </template>
  
  <script>
  export default {
    props: {
        value: {
            type: String,
            required: true,
        },
        classes: {
          type: String,
          default: "block capitalize cursor-pointer select-none rounded-xl p-2 text-center peer-checked:bg-blue-400 peer-checked:font-bold peer-checked:text-white"
        },
        index: {
            type: [String, Number],
            required: true,
        },
    },
    methods: {
      emitOptionValue(event) {
        // Emit an event with the selected option's value
        this.$emit("option-selected", event.target.value);
      }
    }
  };
  </script>
  