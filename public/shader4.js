const canvas = document.getElementById("login-bg");

if (canvas) {
    const gl = canvas.getContext("webgl");

    function resizeCanvas() {
        canvas.width = canvas.clientWidth * 0.35;
        canvas.height = canvas.clientHeight * 0.35;
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

        vec4 colour_1 = vec4(0.02, 0.04, 0.025, 1.0);
        vec4 colour_2 = vec4(1, 1, 1, 1.0);
        vec4 colour_3 = vec4(0, 0, 0, 1.0);

        vec4 originalShader(vec2 uv) {
            float len = length(uv);

            float angle = atan(uv.y, uv.x);
            angle += time * 0.22 - len * 1.15;
            uv = vec2(cos(angle), sin(angle)) * len;
            uv *= 8.0;

            vec2 uv2 = uv;

            for (int i = 0; i < 5; i++) {
                uv2 += sin(max(uv.x, uv.y)) + uv;

                uv += 0.45 * vec2(
                    cos(4.6 + 0.35 * uv2.y + time * 0.8),
                    sin(uv2.x - time * 0.25)
                );

                uv -= cos(uv.x + uv.y) - sin(uv.x * 0.65 - uv.y);
            }

            float paint = min(2.0, length(uv) * 0.035);

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
            scanline = pow(abs(scanline), 0.45) * sign(scanline) * 0.5 + 0.5;
            col.rgb *= mix(0.78, 1.0, scanline);

            vec2 vig = uv - 0.5;
            float vignette = 1.0 - dot(vig, vig) * 1.7;
            col.rgb *= clamp(vignette, 0.0, 1.0);

            float flicker = 0.975 + 0.025 * sin(time * 160.0);
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
        -1, 1,
        1, 1
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


canvas.classList.add("tv-on");
