export default function Punkte (container) {
  const punkte = {
    container,
    canvas: null,
    lastFrame: null,
    ctx: null,
    width: null,
    height: null,

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

      // request first frame
      window.requestAnimationFrame(timestamp => this.draw(timestamp))
    },

    update (delta) {
    },

    draw (timestamp) {
      const delta = this.lastFrame ? timestamp - this.lastFrame : 0
      this.lastFrame = timestamp

      this.update(delta)

      this.ctx.clearRect(0, 0, this.width, this.height)

      this.ctx.beginPath()
      this.ctx.rect(this.width - 220, this.height - 220, 200, 200)

      this.ctx.stroke()

      window.requestAnimationFrame(timestamp => this.draw(timestamp))
    },

    fitCanvas () {
      const devicePixelRatio = window.devicePixelRatio || 1
      const backingStoreRatio = this.ctx.webkitBackingStorePixelRatio ||
        this.ctx.mozBackingStorePixelRatio ||
        this.ctx.msBackingStorePixelRatio ||
        this.ctx.oBackingStorePixelRatio ||
        this.ctx.backingStorePixelRatio || 1

      const ratio = devicePixelRatio / backingStoreRatio

      this.width = window.innerWidth
      this.height = window.innerHeight

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
