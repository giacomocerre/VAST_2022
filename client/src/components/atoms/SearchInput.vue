<template>
  <div class="w-72 flex items-center mt-5">
    <div class="relative h-10 w-full min-w-[200px]">
      <input
        v-model="inputValue"
        :type="type"
        :min="min"
        :max="max"
        class="text-xs peer h-full w-full rounded-[7px] border border-blue-gray-200 bg-transparent px-2 font-sans font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 focus:border-2 focus:border-blue-500 focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50"
        placeholder=" "
      />
      <label
        class="before:content[' '] after:content[' '] text-gray-400 pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none text-[11px] font-normal leading-tight text-blue-gray-400 transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-blue-gray-200 before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-t after:border-r after:border-blue-gray-200 after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75] peer-placeholder-shown:text-blue-gray-500 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-blue-500 peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:border-blue-500 peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:border-blue-500 peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500"
      >
        {{ placeholder }}
      </label>
    </div>
    <div class="ml-2">
      <div @click="searchClicked">
        <tag-component
          icon="search"
          text="Search"
          classes="cursor-pointer transition ease-in-out duration-200 py-3 bg-slate-100 hover:bg-blue-500 hover:text-white text-xs"
        />
      </div>
    </div>
  </div>
</template>

<script>
import TagComponent from "./TagComponent.vue";

export default {
  components: { TagComponent },
  props: {
    type: {
      type: String,
      required: true,
    },
    placeholder: String,
    max: Number,
    min: Number,
  },
  data() {
    return {
      inputValue: "", // Add this data property to store the input value
    };
  },
  methods: {
    searchClicked() {
      this.$emit("search", this.inputValue);
    },
  },
};
</script>
