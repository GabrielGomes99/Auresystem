import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;
uniform float uAspectRatio;

out vec4 fragColor;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v){
  const vec4 C = vec4(
      0.211324865405187, 0.366025403784439,
      -0.577350269189626, 0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);

  vec3 p = permute(
      permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0)
  );

  vec3 m = max(
      0.5 - vec3(
          dot(x0, x0),
          dot(x12.xy, x12.xy),
          dot(x12.zw, x12.zw)
      ), 
      0.0
  );
  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

struct ColorStop {
  vec3 color;
  float position;
};

#define COLOR_RAMP(colors, factor, finalColor) {              \
  int index = 0;                                            \
  for (int i = 0; i < 2; i++) {                               \
     ColorStop currentColor = colors[i];                    \
     bool isInBetween = currentColor.position <= factor;    \
     index = int(mix(float(index), float(i), float(isInBetween))); \
  }                                                         \
  ColorStop currentColor = colors[index];                   \
  ColorStop nextColor = colors[index + 1];                  \
  float range = nextColor.position - currentColor.position; \
  float lerpFactor = (factor - currentColor.position) / range; \
  finalColor = mix(currentColor.color, nextColor.color, lerpFactor); \
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  
  ColorStop colors[3];
  colors[0] = ColorStop(uColorStops[0], 0.0);
  colors[1] = ColorStop(uColorStops[1], 0.5);
  colors[2] = ColorStop(uColorStops[2], 1.0);
  
  vec3 rampColor;
  COLOR_RAMP(colors, uv.x, rampColor);
  
  // Ajustar escala baseado no aspect ratio para evitar esticamento no mobile
  // No mobile (aspect ratio < 1), reduzimos a escala horizontal para evitar esticamento
  float xScale = uAspectRatio > 1.0 ? 2.0 : 2.0 * uAspectRatio;
  
  // Aurora no topo
  float heightTop = snoise(vec2(uv.x * xScale + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
  heightTop = exp(heightTop);
  heightTop = (uv.y * 2.0 - heightTop + 0.2);
  float intensityTop = 0.6 * heightTop;
  float midPointTop = 0.20;
  float auroraAlphaTop = smoothstep(midPointTop - uBlend * 0.5, midPointTop + uBlend * 0.5, intensityTop);
  
  // Aurora na parte inferior (invertida)
  float heightBottom = snoise(vec2(uv.x * xScale - uTime * 0.1, uTime * 0.25 + 5.0)) * 0.5 * uAmplitude;
  heightBottom = exp(heightBottom);
  heightBottom = ((1.0 - uv.y) * 2.0 - heightBottom + 0.2);
  float intensityBottom = 0.6 * heightBottom;
  float midPointBottom = 0.20;
  float auroraAlphaBottom = smoothstep(midPointBottom - uBlend * 0.5, midPointBottom + uBlend * 0.5, intensityBottom);
  
  // Combinar ambas as auroras
  float auroraAlpha = max(auroraAlphaTop, auroraAlphaBottom);
  vec3 auroraColor = (intensityTop * auroraAlphaTop + intensityBottom * auroraAlphaBottom) * rampColor;
  
  fragColor = vec4(auroraColor * auroraAlpha, auroraAlpha);
}
`;

export class Aurora {
    constructor(container, options = {}) {
        // Verificar se o container existe
        if (!container) {
            console.error('Aurora: Container não encontrado');
            return;
        }

        // Verificar se o container é um elemento DOM válido
        if (typeof container === 'string') {
            container = document.querySelector(container);
            if (!container) {
                console.error('Aurora: Container não encontrado no DOM');
                return;
            }
        }

        this.container = container;
        this.options = {
            colorStops: ['#3A29FF', '#FF94B4', '#FF3232'],
            amplitude: 1.0,
            blend: 0.5,
            speed: 0.5,
            ...options
        };

        this.isDestroyed = false;
        this.animateId = null;

        // Aguardar um frame para garantir que o DOM está pronto
        requestAnimationFrame(() => {
            this.init();
        });
    }

    init() {
        if (!this.container || this.isDestroyed) return;

        try {
            // Verificar se WebGL está disponível
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
            if (!gl) {
                console.error('Aurora: WebGL não está disponível');
                return;
            }

            this.renderer = new Renderer({
                alpha: true,
                premultipliedAlpha: true,
                antialias: true
            });
            
            this.gl = this.renderer.gl;
            
            if (!this.gl) {
                console.error('Aurora: Falha ao criar contexto WebGL');
                return;
            }

            this.gl.clearColor(0, 0, 0, 0);
            this.gl.enable(this.gl.BLEND);
            this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
            this.gl.canvas.style.backgroundColor = 'transparent';
            this.gl.canvas.style.position = 'absolute';
            this.gl.canvas.style.top = '0';
            this.gl.canvas.style.left = '0';
            this.gl.canvas.style.width = '100%';
            this.gl.canvas.style.height = '100%';

            // Limpar container antes de adicionar canvas
            this.container.innerHTML = '';
            this.container.appendChild(this.gl.canvas);

            this.resize = this.resize.bind(this);
            window.addEventListener('resize', this.resize);

            const geometry = new Triangle(this.gl);
            if (geometry.attributes.uv) {
                delete geometry.attributes.uv;
            }

            // Converter cores para array de vetores
            const colorStopsArray = this.parseColorStops(this.options.colorStops);

            const initialWidth = window.innerWidth;
            const initialHeight = window.innerHeight;
            const initialAspectRatio = initialWidth / initialHeight;
            
            this.program = new Program(this.gl, {
                vertex: VERT,
                fragment: FRAG,
                uniforms: {
                    uTime: { value: 0 },
                    uAmplitude: { value: this.options.amplitude },
                    uColorStops: { value: colorStopsArray },
                    uResolution: { value: [initialWidth, initialHeight] },
                    uBlend: { value: this.options.blend },
                    uAspectRatio: { value: initialAspectRatio }
                }
            });

            this.mesh = new Mesh(this.gl, { geometry, program: this.program });

            this.update = this.update.bind(this);
            this.animateId = requestAnimationFrame(this.update);

            this.resize();
        } catch (error) {
            console.error('Aurora: Erro na inicialização:', error);
        }
    }

    parseColorStops(colorStops) {
        return colorStops.map(hex => {
            // Suportar diferentes formatos de cor
            if (typeof hex !== 'string') {
                console.warn('Aurora: Cor inválida:', hex);
                hex = '#3A29FF';
            }

            // Remover espaços
            hex = hex.trim();

            // Strip alpha if present (e.g. #RRGGBBAA -> #RRGGBB)
            if (hex.length === 9 && hex.startsWith('#')) {
                hex = hex.substring(0, 7);
            }

            // Garantir que começa com #
            if (!hex.startsWith('#')) {
                hex = '#' + hex;
            }

            try {
                const c = new Color(hex);
                return [c.r, c.g, c.b];
            } catch (error) {
                console.warn('Aurora: Erro ao parsear cor:', hex, error);
                // Fallback para cor padrão
                const c = new Color('#3A29FF');
                return [c.r, c.g, c.b];
            }
        });
    }

    // Método para atualizar cores dinamicamente
    setColors(colorStops) {
        if (!this.program || this.isDestroyed) return;
        
        this.options.colorStops = colorStops;
        const colorStopsArray = this.parseColorStops(colorStops);
        this.program.uniforms.uColorStops.value = colorStopsArray;
    }

    // Método para atualizar outras opções
    setOptions(options) {
        if (this.isDestroyed) return;
        
        this.options = { ...this.options, ...options };
        
        if (this.program) {
            if (options.amplitude !== undefined) {
                this.program.uniforms.uAmplitude.value = options.amplitude;
            }
            if (options.blend !== undefined) {
                this.program.uniforms.uBlend.value = options.blend;
            }
            if (options.speed !== undefined) {
                // speed é usado no update, não precisa atualizar aqui
            }
            if (options.colorStops !== undefined) {
                this.setColors(options.colorStops);
            }
        }
    }

    resize() {
        if (!this.container || !this.renderer || this.isDestroyed) return;
        
        // Para container fixo, usar viewport dimensions
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        if (width > 0 && height > 0) {
            this.renderer.setSize(width, height);
            if (this.program && this.program.uniforms) {
                const aspectRatio = width / height;
                this.program.uniforms.uResolution.value = [width, height];
                this.program.uniforms.uAspectRatio.value = aspectRatio;
            }
        }
    }

    update(t) {
        if (this.isDestroyed || !this.renderer || !this.mesh || !this.program) {
            return;
        }

        try {
            this.animateId = requestAnimationFrame(this.update);

            const time = (t || performance.now()) * 0.01;
            const speed = this.options.speed || 0.5;

            if (this.program && this.program.uniforms) {
                this.program.uniforms.uTime.value = time * speed * 0.1;
                this.program.uniforms.uAmplitude.value = this.options.amplitude;
                this.program.uniforms.uBlend.value = this.options.blend;
            }

            this.renderer.render({ scene: this.mesh });
        } catch (error) {
            console.error('Aurora: Erro no update:', error);
            this.destroy();
        }
    }

    destroy() {
        this.isDestroyed = true;
        
        if (this.animateId) {
            cancelAnimationFrame(this.animateId);
            this.animateId = null;
        }
        
        window.removeEventListener('resize', this.resize);
        
        if (this.container && this.gl && this.gl.canvas && this.gl.canvas.parentNode === this.container) {
            this.container.removeChild(this.gl.canvas);
        }
        
        if (this.gl) {
            const ext = this.gl.getExtension('WEBGL_lose_context');
            if (ext) {
                ext.loseContext();
            }
        }
        
        this.renderer = null;
        this.gl = null;
        this.program = null;
        this.mesh = null;
    }
}
