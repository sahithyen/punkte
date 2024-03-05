import { Punkte } from "punkte";

const punkteCanvas = document.querySelector('.punkte-canvas')

const getViewport = () => ({
    x: punkteCanvas.clientLeft,
    y: punkteCanvas.clientTop,
    width: punkteCanvas.clientWidth,
    height: punkteCanvas.clientHeight
})

const pointsCount = 200
const punkte = new Punkte({
    count: pointsCount,
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
}, getViewport())
const positionsBuffer = punkte.get_positions_buffer()
const propertiesBuffer = punkte.get_properties_buffer()

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

// const context = punkteCanvas.getContext('2d')

// function render(time) {
//     punkte.update(time)

//     context.clearRect(0, 0, 500, 500)

//     for (let index = 0; index < pointsCount; index++) {
//         const x = pointsBuffer[index * 2];
//         const y = pointsBuffer[index * 2 + 1];

//         context.beginPath()
//         context.arc(x, y, 4, 0, 2 * Math.PI)
//         context.closePath()
//         context.fill()
//     }


//     requestAnimationFrame(render)
// }

// requestAnimationFrame(render)

// Initialize Web GL and get required extensions
const gl = punkteCanvas.getContext("webgl")
const instancedArraysExt = gl.getExtension("ANGLE_instanced_arrays");

// Vertex shader
const vsSource = `
    attribute vec2 a_edge_position;
    attribute vec2 a_position;
    attribute vec2 a_properties;

    uniform vec2 u_canvas_resolution;

    varying vec2 v_position;
    varying float v_opacity;

    #define PI radians(180.0)
    
    void main() {
        float radius = a_properties[0];
        v_opacity = a_properties[1];
        vec2 position = a_position + (a_edge_position * radius);

        vec2 zero_to_one = position / u_canvas_resolution;
        vec2 zero_to_two = zero_to_one * 2.0;
        vec2 clip_space = zero_to_two - 1.0;
        gl_Position = vec4(clip_space * vec2(1, -1), 0, 1);

        v_position = a_edge_position;
    }
    `;

// Fragment shader
const fsSource = `
    precision mediump float;

    varying vec2 v_position;
    varying float v_opacity;

    float circle(in vec2 st, in float radius) {
        vec2 dist = st - vec2(0.5);
        return 1.0 - smoothstep(
            radius - (radius * 0.01),
            radius + (radius * 0.01),
            dot(dist, dist) * 4.0
            );
    }

    void main() {
        if (circle((v_position + 1.0) * 0.5, 1.0) < 0.5) {
            discard;
        }
        
        gl_FragColor = vec4(v_opacity, 0.0, 0.0, 1.0);
    }
    `;

// Creates WebGL program from vertex shader and fragment shader
function createProgram(gl, vsSource, fsSource) {
    // Create both shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // Link them together
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log(
            `Unable to initialize the shader program: ${gl.getProgramInfoLog(
                program,
            )}`,
        );
        gl.deleteProgram(program);
        return null;
    }

    return program;
}

// Creates a shader from source
function createShader(gl, type, source) {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log(`An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`);
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

// Creates our program
const program = createProgram(gl, vsSource, fsSource)

// Change viewport
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

// Use previously created program
gl.useProgram(program);

// Pass resolution of canvas
const canvasResolutionUniformLocation = gl.getUniformLocation(program, "u_canvas_resolution")
gl.uniform2f(canvasResolutionUniformLocation, gl.canvas.width, gl.canvas.height)

// Create buffer for squares
const edgePositionsBuffer = new Float32Array(pointsCount * 12)
for (let i = 0; i < pointsCount; i++) {
    let o = i * 12
    const x = 1.0
    const y = 1.0

    // First triangle (top-left - bottom-right - top-right)
    edgePositionsBuffer[o] = -x
    edgePositionsBuffer[o + 1] = -y
    edgePositionsBuffer[o + 2] = x
    edgePositionsBuffer[o + 3] = y
    edgePositionsBuffer[o + 4] = x
    edgePositionsBuffer[o + 5] = -y

    // Second triangle (top-left - bottom-right - bottom-left)
    edgePositionsBuffer[o + 6] = -x
    edgePositionsBuffer[o + 7] = -y
    edgePositionsBuffer[o + 8] = x
    edgePositionsBuffer[o + 9] = y
    edgePositionsBuffer[o + 10] = -x
    edgePositionsBuffer[o + 11] = y
}

// Pass buffer of edge indices
const edgeIndicesGLBuffer = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, edgeIndicesGLBuffer)
gl.bufferData(gl.ARRAY_BUFFER, edgePositionsBuffer, gl.STATIC_DRAW)
const edgePositionAttributeLocation = gl.getAttribLocation(program, "a_edge_position")
gl.enableVertexAttribArray(edgePositionAttributeLocation)
gl.vertexAttribPointer(
    edgePositionAttributeLocation,
    2, // components
    gl.FLOAT, // data type
    false, // normalize
    0, // stride
    0, // offset
)

// Pass buffer of positions
var pointPositionBuffer = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, pointPositionBuffer)
gl.bufferData(gl.ARRAY_BUFFER, positionsBuffer, gl.STREAM_DRAW)
const positionAttributeLocation = gl.getAttribLocation(program, "a_position")
gl.enableVertexAttribArray(positionAttributeLocation)
gl.vertexAttribPointer(
    positionAttributeLocation,
    2, // components
    gl.FLOAT, // data type
    false, // normalize
    0, // stride
    0, // offset
)
instancedArraysExt.vertexAttribDivisorANGLE(positionAttributeLocation, 2)

// Pass buffer of properties
var pointPropertiesBuffer = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, pointPropertiesBuffer)
gl.bufferData(gl.ARRAY_BUFFER, propertiesBuffer, gl.STATIC_DRAW)
const propertiesAttributeLocation = gl.getAttribLocation(program, "a_properties")
gl.enableVertexAttribArray(propertiesAttributeLocation)
gl.vertexAttribPointer(
    propertiesAttributeLocation,
    2, // components
    gl.FLOAT, // data type
    false, // normalize
    0, // stride
    0, // offset
)
instancedArraysExt.vertexAttribDivisorANGLE(propertiesAttributeLocation, 2)

function render(time) {
    punkte.update(time)

    // Update buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, pointPositionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, positionsBuffer, gl.STREAM_DRAW)

    // Clear screen
    gl.clearColor(0, 0, 0, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    // Draw
    instancedArraysExt.drawArraysInstancedANGLE(
        gl.TRIANGLES,
        0, // Offset
        pointsCount * 2 * 3, // Count of vertices
        pointsCount * 2, // Count of triangles
    );

    requestAnimationFrame(render)
}

requestAnimationFrame(render)