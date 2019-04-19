import dragscrollbar from './dragscrollbar.vue'
const scrollbar = {}
scrollbar.install = (Vue) => {
  Vue.component(dragscrollbar.name, dragscrollbar)
}
if (typeof window === 'undefined' && window.Vue) {
  // eslint-disable-next-line no-undef
  install(window.Vue)
};
export default scrollbar
