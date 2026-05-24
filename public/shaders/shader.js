const canvas = document.getElementById("bg");

if (canvas) {
    const gl = canvas.getContext("webgl");

    function resizeCanvas() {
        canvas.width = canvas.clientWidth * 0.5;
        canvas.height = canvas.clientHeight * 0.5;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }

    resizeCanvas();

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

        vec4 colour_1 = vec4(0.039, 0.039, 0.102, 1.00);
        vec4 colour_2 = vec4(1.0, 0.9, 0.0, 1.00);
        vec4 colour_3 = vec4(1.0, 0.22, 0.2, 1.00);

        vec2 crtDistort(vec2 uv) {
            uv -= 0.5;
            float r2 = dot(uv, uv);
            uv *= 1.0 + r2 * (0.12 + r2 * 0.04);
            uv += 0.5;
            return uv;
        }

        vec4 originalShader(vec2 uv) {
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
            vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec2 shaderUV = (uv * resolution.xy - 0.5 * resolution.xy) / resolution.y;
vec4 col = originalShader(shaderUV);

float scanline = sin(uv.y * resolution.y * 3.14159);
            scanline = pow(abs(scanline), 0.4) * sign(scanline) * 0.5 + 0.5;
            col.rgb *= mix(0.75, 1.0, scanline);

            float px = mod(gl_FragCoord.x, 3.0);
            vec3 mask = vec3(
                smoothstep(0.0, 1.0, px) * (1.0 - smoothstep(1.0, 2.0, px)),
                smoothstep(1.0, 2.0, px) * (1.0 - smoothstep(2.0, 3.0, px)),
                (1.0 - smoothstep(0.0, 0.5, px)) + smoothstep(2.5, 3.0, px)
            );

            col.rgb *= mix(vec3(1.0), mask * 1.3, 0.2);
vec2 vig = uv - 0.5;
            float vignette = 1.0 - dot(vig, vig) * 1.8;
            col.rgb *= clamp(vignette, 0.0, 1.0);

            float flicker = 0.97 + 0.03 * sin(time * 180.0);
            col.rgb *= flicker;

            gl_FragColor = vec4(clamp(col.rgb, 0.0, 1.0), 1.0);
        }
    `;

    function createShader(type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
    }

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

    function render(t) {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.uniform2f(resolutionUniform, canvas.width, canvas.height);
        gl.uniform1f(timeUniform, t * 0.0004);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);

    window.addEventListener("resize", resizeCanvas);
}