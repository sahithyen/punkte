import { Punkte } from "punkte";

const punkteCanvas = document.querySelector('.punkte-canvas')

try {
    const punkte = new Punkte(punkteCanvas)
    punkte.start()
} catch (error) {
    console.log(error)
}
