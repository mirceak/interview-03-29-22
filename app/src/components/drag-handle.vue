<template>
  <span class="example-drag-handle">
    <slot></slot>
  </span>
</template>

<script>
// Makeshift handle because the directive doesnt work with vitepress
export default {
  mounted() {
    this.$el.sortableHandle = true;
  },
  name: 'DragHandle',
};
</script>

<style lang="scss" scoped>
.example-drag-handle {
  display: inline-block;
  min-width: 25px;
  min-height: 25px;
  width: 25px;
  height: 25px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='50' viewBox='0 0 50 50'%3E%3Cpath d='M 0 7.5 L 0 12.5 L 50 12.5 L 50 7.5 L 0 7.5 z M 0 22.5 L 0 27.5 L 50 27.5 L 50 22.5 L 0 22.5 z M 0 37.5 L 0 42.5 L 50 42.5 L 50 37.5 L 0 37.5 z' color='white'%3E%3C/path%3E%3C/svg%3E");
  background-size: contain;
  background-repeat: no-repeat;
  opacity: 0.5;
  margin-right: 10px;
  cursor: grab;
}
</style>
