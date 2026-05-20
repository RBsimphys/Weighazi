const canvas = document.getElementById("profile-bg");
const gl = canvas.getContext("webgl");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const vertexShaderSource = `
attribute vec2 position;

void main() {
    gl_Position = vec4(position, 0.0, 1.0);
}
`;
const fragmentShaderSource = `
    precision highp float;

    uniform vec2 resolution;
    uniform float time;
    uniform float flashTime;

    vec4 colour_1 = vec4(0.0, 0.0, 0.0, 1.0);
    vec4 colour_3 = vec4(0.0, 0.0, 0.0, 1.0);

    vec4 originalShader(vec2 uv) {
        // base: dark grey/white monochrome, flashes to bright green
        vec4 colour_2 = mix(vec4(0.1, 0.1, 0.1, 1.0), vec4(0.2, 0.7, 0.5, 1.0), flashTime);

        float len = length(uv);

        float angle = atan(uv.y, uv.x);
        angle += time * 0.2 - len * 1.2;
        uv = vec2(cos(angle), sin(angle)) * len;
        uv *= 9.0;

        vec2 uv2 = uv;

        for(int i = 0; i < 5; i++) {
            uv2 += sin(max(uv.x, uv.y)) + uv;
            uv += 0.5 * vec2(
                cos(5.1 + 0.35 * uv2.y + time * 0.9),
                sin(uv2.x - time * 0.3)
            );
            uv -= cos(uv.x + uv.y) - sin(uv.x * 0.7 - uv.y);
        }

        float paint = min(2.0, length(uv) * 0.02 * 1.8);

        float c1p = max(0.0, 1.0 - 3.5 * abs(1.0 - paint));
        float c2p = max(0.0, 1.0 - 3.5 * abs(paint));
        float c3p = 1.0 - min(1.0, c1p + c2p);

        return colour_1 * c1p + colour_2 * c2p + colour_3 * c3p;
    }

    void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / resolution.y;
        vec4 col = originalShader(uv);
        gl_FragColor = vec4(clamp(col.rgb, 0.0, 1.0), 1.0);
    }
`;
function createShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
}

const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

const vertices = new Float32Array([
    -1, -1,
     1, -1,
    -1,  1,
     1,  1
]);

const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

const position = gl.getAttribLocation(program, "position");
gl.enableVertexAttribArray(position);
gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

const resolutionUniform = gl.getUniformLocation(program, "resolution");
const timeUniform = gl.getUniformLocation(program, "time");
const flashUniform = gl.getUniformLocation(program, "flashTime");

let flashStart = null;
const FLASH_DURATION = 5000;

document.querySelector('.btn-add').addEventListener('click', () => {
    flashStart = performance.now();
});
function render(t) {
    let flash = 0.0;
    if (flashStart !== null) {
        const elapsed = performance.now() - flashStart;
        if (elapsed < FLASH_DURATION) {
            const p = elapsed / FLASH_DURATION;
            // peak at 20% of duration, slow fade out for remaining 80%
            flash = p < 0.1
                ? p / 0.1                          // linear ramp up
                : Math.pow(1 - (p - 0.1) / 0.8, 2); // ease out over the rest
        } else {
            flashStart = null;
        }
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(resolutionUniform, canvas.width, canvas.height);
    gl.uniform1f(timeUniform, t * 0.0004);
    gl.uniform1f(flashUniform, flash);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
}
requestAnimationFrame(render);

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});