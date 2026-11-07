'use client'

import { useEffect, useRef } from 'react'

interface NeuralNoiseProps {
  color?: [number, number, number]
  opacity?: number
  speed?: number
  className?: string
}

export function NeuralNoise({
  color = [0.85, 1.0, 0.26], // Tuned to match portfolio acid accent (#d9ff43)
  opacity = 0.45,
  speed = 0.001,
  className,
}: NeuralNoiseProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const pointer = useRef({ x: 0, y: 0, tX: 0, tY: 0 })

  useEffect(() => {
    const canvasEl = canvasRef.current
    if (!canvasEl) return

    let gl: WebGLRenderingContext | null =
      canvasEl.getContext('webgl') || (canvasEl.getContext('experimental-webgl') as WebGLRenderingContext | null)
    if (!gl) {
      console.error('WebGL not supported')
      return
    }

    const vsSource = `
      precision mediump float;
      varying vec2 vUv;
      attribute vec2 a_position;
      void main() {
        vUv = 0.5 * (a_position + 1.0);
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `

    const fsSource = `
      precision mediump float;
      varying vec2 vUv;
      uniform float u_time;
      uniform float u_ratio;
      uniform vec2 u_pointer_position;
      uniform vec3 u_color;
      uniform float u_speed;
      vec2 rotate(vec2 uv, float th) {
        return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
      }
      float neuro_shape(vec2 uv, float t, float p) {
        vec2 sine_acc = vec2(0.0);
        vec2 res = vec2(0.0);
        float scale = 8.0;
        for (int j = 0; j < 15; j++) {
          uv = rotate(uv, 1.0);
          sine_acc = rotate(sine_acc, 1.0);
          vec2 layer = uv * scale + float(j) + sine_acc - t;
          sine_acc += sin(layer) + 2.4 * p;
          res += (0.5 + 0.5 * cos(layer)) / scale;
          scale *= 1.2;
        }
        return res.x + res.y;
      }
      void main() {
        vec2 uv = 0.5 * vUv;
        uv.x *= u_ratio;
        vec2 pointer = vUv - u_pointer_position;
        pointer.x *= u_ratio;
        float p = clamp(length(pointer), 0.0, 1.0);
        p = 0.5 * pow(1.0 - p, 2.0);
        float t = u_speed * u_time;
        vec3 col = vec3(0.0);
        float noise = neuro_shape(uv, t, p);
        noise = 1.2 * pow(noise, 3.0);
        noise += pow(noise, 10.0);
        noise = max(0.0, noise - 0.5);
        noise *= (1.0 - length(vUv - 0.5));
        col = u_color * noise;
        gl_FragColor = vec4(col, noise);
      }
    `

    function createShader(glCtx: WebGLRenderingContext, source: string, type: number) {
      const shader = glCtx.createShader(type)
      if (!shader) return null
      glCtx.shaderSource(shader, source)
      glCtx.compileShader(shader)
      if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
        console.error('Shader compile error:', glCtx.getShaderInfoLog(shader))
        glCtx.deleteShader(shader)
        return null
      }
      return shader
    }

    function createProgram(glCtx: WebGLRenderingContext, vs: WebGLShader, fs: WebGLShader) {
      const program = glCtx.createProgram()
      if (!program) return null
      glCtx.attachShader(program, vs)
      glCtx.attachShader(program, fs)
      glCtx.linkProgram(program)
      if (!glCtx.getProgramParameter(program, glCtx.LINK_STATUS)) {
        console.error('Program link error:', glCtx.getProgramInfoLog(program))
        return null
      }
      return program
    }

    function getUniforms(glCtx: WebGLRenderingContext, program: WebGLProgram) {
      const uniformsMap: Record<string, WebGLUniformLocation | null> = {}
      const uniformCount = glCtx.getProgramParameter(program, glCtx.ACTIVE_UNIFORMS)
      for (let i = 0; i < uniformCount; i++) {
        const info = glCtx.getActiveUniform(program, i)
        if (info) {
          uniformsMap[info.name] = glCtx.getUniformLocation(program, info.name)
        }
      }
      return uniformsMap
    }

    const vertexShader = createShader(gl, vsSource, gl.VERTEX_SHADER)
    const fragmentShader = createShader(gl, fsSource, gl.FRAGMENT_SHADER)
    if (!vertexShader || !fragmentShader) return

    const shaderProgram = createProgram(gl, vertexShader, fragmentShader)
    if (!shaderProgram) return

    const uniforms = getUniforms(gl, shaderProgram)
    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])
    const vertexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
    gl.useProgram(shaderProgram)

    const positionLocation = gl.getAttribLocation(shaderProgram, 'a_position')
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    let animationFrameId: number

    function resizeCanvas() {
      if (!canvasEl || !gl) return
      const devicePixelRatio = Math.min(window.devicePixelRatio, 2)
      canvasEl.width = window.innerWidth * devicePixelRatio
      canvasEl.height = window.innerHeight * devicePixelRatio
      if (uniforms && uniforms.u_ratio) {
        gl.uniform1f(uniforms.u_ratio, canvasEl.width / canvasEl.height)
      }
      gl.viewport(0, 0, canvasEl.width, canvasEl.height)
    }

    function render() {
      if (!gl) return
      const currentTime = performance.now()
      pointer.current.x += (pointer.current.tX - pointer.current.x) * 0.2
      pointer.current.y += (pointer.current.tY - pointer.current.y) * 0.2

      gl.uniform1f(uniforms.u_time, currentTime)
      if (uniforms.u_pointer_position) {
        gl.uniform2f(
          uniforms.u_pointer_position,
          pointer.current.x / window.innerWidth,
          1 - pointer.current.y / window.innerHeight
        )
      }
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      animationFrameId = requestAnimationFrame(render)
    }

    const updateMousePosition = (x: number, y: number) => {
      pointer.current.tX = x
      pointer.current.tY = y
    }

    const pointermove = (e: PointerEvent) => updateMousePosition(e.clientX, e.clientY)
    const touchmove = (e: TouchEvent) => {
      if (e.targetTouches[0]) updateMousePosition(e.targetTouches[0].clientX, e.targetTouches[0].clientY)
    }
    const click = (e: MouseEvent) => updateMousePosition(e.clientX, e.clientY)

    window.addEventListener('pointermove', pointermove)
    window.addEventListener('touchmove', touchmove)
    window.addEventListener('click', click)
    const resizeListener = () => resizeCanvas()
    window.addEventListener('resize', resizeListener)

    if (uniforms.u_color) {
      gl.uniform3f(uniforms.u_color, color[0], color[1], color[2])
    }
    if (uniforms.u_speed) {
      gl.uniform1f(uniforms.u_speed, speed)
    }

    resizeCanvas()
    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('pointermove', pointermove)
      window.removeEventListener('touchmove', touchmove)
      window.removeEventListener('click', click)
      window.removeEventListener('resize', resizeListener)
    }
  }, [color, speed])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity,
        zIndex: 0,
      }}
    />
  )
}
