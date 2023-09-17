import { Punkte } from "punkte";

const punkteCanvas = document.querySelector('.punkte-canvas')

const punkte = new Punkte()
const pointsBuffer = punkte.get_float32_array()
const pointsCount = pointsBuffer.length / 2

// const context = punkteCanvas.getContext('2d')

// function render(time) {
//     punkte.update(time)

//     context.clearRect(0, 0, 500, 500)

//     for (let index = 0; index < pointsBuffer.length / 2; index++) {
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
 
const circleResolution = 5;

// Initialize Web GL and get required extensions
const gl = punkteCanvas.getContext("webgl")
const instancedArraysExt = gl.getExtension("ANGLE_instanced_arrays");

// Vertex shader
const vsSource = `
    attribute float a_edge_index;
    attribute vec2 a_position;
    uniform float u_circle_resolution;
    uniform vec2 u_canvas_resolution;

    #define PI radians(180.0)
    
    void main() {
        vec2 c_position;
        if (a_edge_index < 0.0)
        {
            c_position = vec2(0, 0);
        }
        else
        {
            float u = a_edge_index / u_circle_resolution;
            float angle = u * PI * 2.0;
            float radius = 4.0;
            c_position = vec2(cos(angle), sin(angle)) * radius;
        }

        vec2 position = a_position + c_position;
        vec2 zero_to_one = position / u_canvas_resolution;
        vec2 zero_to_two = zero_to_one * 2.0;
        vec2 clip_space = zero_to_two - 1.0;
        gl_Position = vec4(clip_space * vec2(1, -1), 0, 1);
    }
    `;
    
// Fragment shader
const fsSource = `
    void main() {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
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

// Pass resolution of canvas
const circleResolutionUniformLocation = gl.getUniformLocation(program, "u_circle_resolution")
gl.uniform1f(circleResolutionUniformLocation, circleResolution)

// Create buffer of edge indices
const edgeIndicesBuffer = new Float32Array(pointsCount * circleResolution * 3)
for (let i = 0; i < edgeIndicesBuffer.length; i++) {
    const instance_i = i % (circleResolution * 3)
    const quadrant = Math.floor(instance_i / 3)
    const vertice = instance_i % 3
    const edge = instance_i % 3 == 0 ? -1 : quadrant + vertice - 1
    edgeIndicesBuffer[i] = edge
}

// Pass buffer of edge indices
const edgeIndicesGLBuffer = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, edgeIndicesGLBuffer)
gl.bufferData(gl.ARRAY_BUFFER, edgeIndicesBuffer, gl.STATIC_DRAW)
const edgeIndicesAttributeLocation = gl.getAttribLocation(program, "a_edge_index")
gl.enableVertexAttribArray(edgeIndicesAttributeLocation)
gl.vertexAttribPointer(
    edgeIndicesAttributeLocation,
    1, // components
    gl.FLOAT, // data type
    false, // normalize
    0, // stride
    0, // offset
)

// Pass buffer of positions
var pointPositionBuffer = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, pointPositionBuffer)
gl.bufferData(gl.ARRAY_BUFFER, pointsBuffer, gl.DYNAMIC_DRAW)
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
instancedArraysExt.vertexAttribDivisorANGLE(positionAttributeLocation, circleResolution)

function render(time) {
    punkte.update(time)

    // Update buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, pointPositionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, pointsBuffer, gl.DYNAMIC_DRAW)

    // Clear screen
    gl.clearColor(0, 0, 0, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    // Draw
    instancedArraysExt.drawArraysInstancedANGLE(
        gl.TRIANGLES,
        0, // Offset
        pointsCount * circleResolution * 3, // Count of vertices
        pointsCount * circleResolution, // Count of triangles
    );

    requestAnimationFrame(render)
}

requestAnimationFrame(render)