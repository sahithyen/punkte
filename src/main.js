export default function Punkte (container) {
  const punkte = {
    container,
    canvas: null,

    init () {
      // Append canvas
      this.canvas = document.createElement('canvas')
      this.container.appendChild(this.canvas)

      // Stick canvas and let it fill the whole viewport
      this.canvas.style.position = 'fixed'
      this.canvas.style.top = 0
      this.canvas.style.left = 0
      this.ctx = this.canvas.getContext('2d')
      this.fitCanvas()
      window.addEventListener('resize', () => this.fitCanvas())

      this.ctx.beginPath()
      this.ctx.rect(20, 20, 150, 250)
      this.ctx.stroke()
    },

    fitCanvas () {
      const devicePixelRatio = window.devicePixelRatio || 1
      const backingStoreRatio = this.ctx.webkitBackingStorePixelRatio ||
        this.ctx.mozBackingStorePixelRatio ||
        this.ctx.msBackingStorePixelRatio ||
        this.ctx.oBackingStorePixelRatio ||
        this.ctx.backingStorePixelRatio || 1

      const ratio = devicePixelRatio / backingStoreRatio

      this.canvas.width = window.innerWidth * ratio
      this.canvas.height = window.innerHeight * ratio

      this.canvas.style.width = window.innerWidth + 'px'
      this.canvas.style.height = window.innerHeight + 'px'

      this.ctx.scale(ratio, ratio)
    }
  }

  punkte.init()

  return punkte
}
