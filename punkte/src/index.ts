import { PunkteCore } from "punkte-core";
import { Config } from "./Config";
import { VertexShaderSource, FragmentShaderSource } from "./ShaderSources";
import { createGlProgram, createGlShader } from "./ShaderUtils";

export class Punkte {
    config: Config;

    core: PunkteCore;
    positionsBuffer: Float32Array;
    propertiesBuffer: Float32Array;

    canvas: HTMLCanvasElement;
    context: WebGLRenderingContext;
    instancedArraysExt: ANGLE_instanced_arrays;
    program: WebGLProgram;
    positionsGLBuffer: WebGLBuffer;

    boundRender: FrameRequestCallback = this.render.bind(this);

    constructor(canvas: HTMLCanvasElement, config: Config) {
        this.config = config;

        // Initialize the core
        this.core = new PunkteCore(this.config);
        this.positionsBuffer = this.core.get_positions_buffer();
        this.propertiesBuffer = this.core.get_properties_buffer();

        // Initialize HTML5 canvas and Web GL
        this.canvas = canvas;
        const context = this.canvas.getContext("webgl");
        if (!context) {
            throw new Error("WebGL not supported");
        }
        this.context = context;

        // Get ANGLE_instanced_arrays extension
        const instancedArraysExt = this.context.getExtension("ANGLE_instanced_arrays");
        if (!instancedArraysExt) {
            throw new Error("ANGLE_instanced_arrays extension not supported");
        }
        this.instancedArraysExt = instancedArraysExt;

        // Create the vertex shader
        const vertexShader = createGlShader(this.context, this.context.VERTEX_SHADER, VertexShaderSource);

        // Create the fragment shader
        const fragmentShader = createGlShader(this.context, this.context.FRAGMENT_SHADER, FragmentShaderSource);

        // Create the program
        this.program = createGlProgram(this.context, vertexShader, fragmentShader);

        // Change the viewport
        this.context.viewport(0, 0, this.canvas.width, this.canvas.height);

        // Use the GL program
        this.context.useProgram(this.program);

        // Pass resolution of canvas
        const canvasResolutionUniformLocation = this.context.getUniformLocation(this.program, "u_canvas_resolution")
        this.context.uniform2f(canvasResolutionUniformLocation, this.context.canvas.width, this.context.canvas.height)

        // Create buffer of squares
        const edgePositionsBuffer = new Float32Array(this.config.count * 12)
        for (let i = 0; i < this.config.count; i++) {
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
        const edgeIndicesGLBuffer = this.context.createBuffer()
        this.context.bindBuffer(this.context.ARRAY_BUFFER, edgeIndicesGLBuffer)
        this.context.bufferData(this.context.ARRAY_BUFFER, edgePositionsBuffer, this.context.STATIC_DRAW)
        const edgePositionAttributeLocation = this.context.getAttribLocation(this.program, "a_edge_position")
        this.context.enableVertexAttribArray(edgePositionAttributeLocation)
        this.context.vertexAttribPointer(
            edgePositionAttributeLocation,
            2, // components
            this.context.FLOAT, // data type
            false, // normalize
            0, // stride
            0, // offset
        )

        // Pass buffer of positions
        const positionsGLBuffer = this.context.createBuffer()
        if (!positionsGLBuffer) {
            throw new Error("Failed to create buffer")
        }
        this.positionsGLBuffer = positionsGLBuffer;
        this.context.bindBuffer(this.context.ARRAY_BUFFER, this.positionsGLBuffer)
        this.context.bufferData(this.context.ARRAY_BUFFER, this.positionsBuffer, this.context.STREAM_DRAW)
        const positionAttributeLocation = this.context.getAttribLocation(this.program, "a_position")
        this.context.enableVertexAttribArray(positionAttributeLocation)
        this.context.vertexAttribPointer(
            positionAttributeLocation,
            2, // components
            this.context.FLOAT, // data type
            false, // normalize
            0, // stride
            0, // offset
        )
        this.instancedArraysExt.vertexAttribDivisorANGLE(positionAttributeLocation, 2)

        // Pass buffer of properties
        const pointPropertiesBuffer = this.context.createBuffer()
        this.context.bindBuffer(this.context.ARRAY_BUFFER, pointPropertiesBuffer)
        this.context.bufferData(this.context.ARRAY_BUFFER, this.propertiesBuffer, this.context.STATIC_DRAW)
        const propertiesAttributeLocation = this.context.getAttribLocation(this.program, "a_properties")
        this.context.enableVertexAttribArray(propertiesAttributeLocation)
        this.context.vertexAttribPointer(
            propertiesAttributeLocation,
            2, // components
            this.context.FLOAT, // data type
            false, // normalize
            0, // stride
            0, // offset
        )
        this.instancedArraysExt.vertexAttribDivisorANGLE(propertiesAttributeLocation, 2)
    }

    run() {
        requestAnimationFrame(this.boundRender)
    }

    render(time: number) {
        this.core.update(time)

        // Update buffer
        this.context.bindBuffer(this.context.ARRAY_BUFFER, this.positionsGLBuffer)
        this.context.bufferData(this.context.ARRAY_BUFFER, this.positionsBuffer, this.context.STREAM_DRAW)

        // Clear screen
        this.context.clearColor(0, 0, 0, 1.0)
        this.context.clear(this.context.COLOR_BUFFER_BIT)

        // Draw
        this.instancedArraysExt.drawArraysInstancedANGLE(
            this.context.TRIANGLES,
            0, // Offset
            this.config.count * 2 * 3, // Count of vertices
            this.config.count * 2, // Count of triangles
        );

        requestAnimationFrame(this.boundRender)
    }

    rectangle(x: number, y: number, width: number, height: number) {
        this.core.rectangle(x, y, width, height)
    }
}