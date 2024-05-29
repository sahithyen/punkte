import './styles.css';
import { Punkte } from "punkte";

const punkteCanvas = document.getElementById('punkte-canvas')

// Check if the canvas is found and is an instance of HTMLCanvasElement
if (!(punkteCanvas instanceof HTMLCanvasElement)) {
    throw new Error('Canvas not found')
}

const punkte = new Punkte(punkteCanvas, {
    count: 200,
    tremble: {
        offset: 10,
        min_time: 400,
        max_time: 800
    },
    punkt: {
        min_radius: 1,
        max_radius: 2.5,
        min_opacity: 0.2,
        max_opacity: 1.0
    }
})

punkte.run()

async function animation() {
    const rects = [
        [50, 50, 100, 100],
        [250, 250, 200, 200],
        [400, 400, 20, 20]
    ]

    while (true) {
        for (const [x, y, w, h] of rects) {
            await new Promise(r => setTimeout(r, 1000))
            punkte.rectangle(x, y, w, h)
        }
    }
}

animation()
