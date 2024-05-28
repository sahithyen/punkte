export const VertexShaderSource = `
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

export const FragmentShaderSource = `
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