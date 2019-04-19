<template>
  <div class='dragScrollBar' :class="{'BarNotAlwaysClass':!defaultOption.alwaysShow}" ref='content' >
    <div class="dragScrollBarContent" :style="{cursor:defaultOption.isDragMove?'grab':''}" ref="contentWrap"  @scroll="handlescroll" @mousedown="dragClick" >
      <slot></slot>
    </div>
    <div class="dragScrollHorizontalPanel" :style="[{'background':defaultOption.HPBackground,'height':defaultOption.HPSize,}]" @mousedown="PanelClick('clientX','scrollLeft')">
      <div class='dragScrollHorizontalBar' ref='HorizontalBar' :style="[{'background':defaultOption.HBBackground,'height':defaultOption.HBSize}]" @mousedown="BarClick('clientX','scrollLeft')"></div>
    </div>
    <div class="dragScrollVerticalPanel" :style="[{'background':defaultOption.VPBackground,'width':defaultOption.VPSize,}]" @mousedown="PanelClick('clientY','scrollTop')">
      <div class='dragScrollVerticalBar' ref='VerticalBar' :style="[{'background':defaultOption.VBBackground,'height':defaultOption.VBSize}]" @mousedown="BarClick('clientY','scrollTop')"></div>
    </div>
  </div>
</template>
<script>
// eslint-disable-next-line no-unused-vars
import browerScrollWidth from '../utils/scrollbar-width'
export default {
  name: 'Dragscrollbar',
  props: {
    options: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      getScrollWidth: Number,
      defaultOption: {
        isDragMove: false,
        HBBackground: '#B2DEF7',
        HBSize: '6px',
        VBBackground: '#B2DEF7',
        VBSize: '6px',
        HPBackground: 'transparent',
        HPSize: '17px',
        VPBackground: 'transparent',
        VPSize: '17px',
        IsVPanelShow: false,
        IsHPanelShow: false,
        alwaysShow: true
      },
      scrollX: 0,
      scrollY: 0
    }
  },
  mounted () {
    this.extendProps()
    let content = this.$refs.content
    let contentWrap = this.$refs.contentWrap
    let prewidth, preheight
    this.getScrollWidth = browerScrollWidth()
    contentWrap.style.maxHeight = content.offsetHeight + 'px'
    contentWrap.style.marginBottom = -this.getScrollWidth + 'px'
    contentWrap.style.marginRight = -this.getScrollWidth + 'px'
    contentWrap.style.paddingBottom = this.defaultOption.HPSize
    contentWrap.style.paddingRight = this.defaultOption.VPSize
    prewidth = (contentWrap.clientWidth * 100) / contentWrap.scrollWidth
    preheight = (contentWrap.clientHeight * 100) / contentWrap.scrollHeight
    this.$refs.HorizontalBar.style.width = (prewidth < 100) ? (prewidth + '%') : ''
    this.$refs.VerticalBar.style.height = (preheight < 100) ? (preheight + '%') : ''
  },
  methods: {
    // 替换传来的参数
    extendProps () {
      for (var key in this.defaultOption) {
        if (this.options.hasOwnProperty(key)) {
          this.defaultOption[key] = this.options[key]
        }
      }
    },
    handlescroll (e) {
      let contentWrap = this.$refs.contentWrap
      this.scrollX = ((contentWrap.scrollLeft * 100) / contentWrap.clientWidth)
      this.scrollY = ((contentWrap.scrollTop * 100) / contentWrap.clientHeight)
      console.log(contentWrap.scrollTop)
      this.$refs.VerticalBar.style.transform = `translateY(${this.scrollY}%)`
      this.$refs.HorizontalBar.style.transform = `translateX(${this.scrollX}%)`
    },
    PanelClick (axis, scrollPosition, e) {
      e = e || window.event
      let contentWrap = this.$refs.contentWrap
      let offsetUnit = axis === 'clientX' ? 'offsetWidth' : 'offsetHeight'
      let scrollUnit = axis === 'clientX' ? 'scrollWidth' : 'scrollHeight'
      let TopOrLeft = axis === 'clientX' ? 'left' : 'top'
      let offsetPosition = e[axis] - contentWrap.getBoundingClientRect()[TopOrLeft]
      contentWrap[scrollPosition] = (offsetPosition / contentWrap[offsetUnit]) * contentWrap[scrollUnit]
      e.stopImmediatePropagation()
    },
    BarClick (axis, scrollPosition, e) {
      e = e || window.event
      if (e.stopPropagation) {
        e.stopPropagation()
      } else {
        e.cancelBubble = true
      }

      this['Axis'] = axis
      this['derection'] = scrollPosition
      this['preAxis'] = e[axis]
      this['prePosition'] = this.$refs.contentWrap[scrollPosition]
      if (window.addEventListener) {
        document.addEventListener('mousemove', this.mouseMoveEvent, false)
        document.addEventListener('mouseup', (e) => {
          document.removeEventListener('mousemove', this.mouseMoveEvent, false)
        }, false)
      } else {
        document.attachEvent('onmousemove', this.mouseMoveEvent, false)
        document.attachEvent('onmouseup', (e) => {
          document.detachEvent('onmousemove', this.mouseMoveEvent, false)
        }, false)
      }
      e.stopImmediatePropagation()
    },
    mouseMoveEvent (e) {
      e = e || window.event
      let contentWrap = this.$refs.contentWrap
      let offsetUnit = this.Axis === 'clientX' ? 'offsetWidth' : 'offsetHeight'
      let scrollUnit = this.Axis === 'clientX' ? 'scrollWidth' : 'scrollHeight'
      let offsetPosition = e[this['Axis']] - this['preAxis']
      contentWrap[this.derection] = this['prePosition'] + (offsetPosition / contentWrap[offsetUnit]) * contentWrap[scrollUnit]
      e.preventDefault()
    },
    dragClick (e) {
      if (this.defaultOption.isDragMove) {
        e = e || window.event
        this['preDragx'] = e.clientX
        this['preDragY'] = e.clientY
        this['preScrollTop'] = this.$refs.contentWrap.scrollTop
        this['preScrollLeft'] = this.$refs.contentWrap.scrollLeft
        this.$refs.contentWrap.style.cursor = 'grabbing'
        if (window.addEventListener) {
          document.addEventListener('mousemove', this.DragMoveEvent, false)
          document.addEventListener('mouseup', (e) => {
            this.$refs.contentWrap.style.cursor = 'grab'
            document.removeEventListener('mousemove', this.DragMoveEvent, false)
          })
        } else {
          document.attachEvent('onmousemove', this.DragMoveEvent, false)
          document.attachEvent('onmouseup', (e) => {
            this.$refs.contentWrap.style.cursor = 'grab'
            document.detachEvent('onmousemove', this.DragMoveEvent, false)
          })
        }
      }
    },
    DragMoveEvent (e) {
      e = e || window.event
      document.onselectstart = () => false
      this.$refs.contentWrap.style.cursor = 'grabbing'
      let contentWrap = this.$refs.contentWrap
      let gapLeft = e.clientX - this['preDragx']
      let gapTop = e.clientY - this['preDragY']
      contentWrap.scrollTop = this['preScrollTop'] + (gapTop / contentWrap.offsetHeight) * contentWrap.scrollHeight
      contentWrap.scrollLeft = this['preScrollLeft'] + (gapLeft / contentWrap.offsetWidth) * contentWrap.scrollWidth
    }
  },
  destroyed () {

  }
}
</script>
