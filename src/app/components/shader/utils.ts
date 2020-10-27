export const vertexShaderMap = {
    shader1: `
    varying vec2 vUv;
    void main()
    {
        vUv = uv;
        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
        gl_Position = projectionMatrix * mvPosition;
    }
    `,
    shader2: `
    precision mediump float;
    varying vec2 vUv;
    void main() {
     vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
    `,
    ocean: `
    void main()
	{
		vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
		gl_Position = projectionMatrix * mvPosition;
	}
    `
};
export const fragmentShaderMap = {
    shader1: `
    uniform float iTime;

    varying vec2 vUv;

    void main( void ) {

        vec2 position = 2.0 * vUv -1.0;

        float red = abs( sin( position.x * position.y + iTime / 5.0 ) );
        float green = abs( sin( position.x * position.y + iTime / 4.0 ) );
        float blue = abs( sin( position.x * position.y + iTime / 3.0 ) );
        gl_FragColor = vec4( red, green, blue, 1.0 );

    }
    `,
    shader2: `
    precision mediump float;
    uniform float iTime ;
    uniform vec2 iResolution;
    varying vec2 vUv;
 
void main() {
    vec2 uv = -1.0 + 2.0 * vUv;
    uv.x *=  iResolution.x / iResolution.y;
    vec3 color = vec3(0.8 + 0.2 * uv.y);
    for( int i = 0; i < 40; i++ ){
 
        // bubble seeds
        float pha =      sin(float(i) * 546.13 + 1.0) * 0.5 + 0.5;
        float siz = pow( sin(float(i) * 651.74 + 5.0) * 0.5 + 0.5, 4.0 );
        float pox =      sin(float(i) * 321.55 + 4.1) * iResolution.x / iResolution.y;
 
        // buble size, position and color
        float rad = 0.1 + 0.5 * siz;
        vec2  pos = vec2( pox, -1.0 - rad + (2.0 + 2.0 * rad) * mod(pha + 0.1 * iTime * (0.2 + 0.8 * siz), 1.0));
        float dis = length( uv - pos );
        vec3  col = mix(vec3(0.94, 0.3, 0.0), vec3(0.1, 0.4, 0.8), 0.5 + 0.5 * sin(float(i) * 1.2 + 1.9));
        //    col += 8.0 * smoothstep( rad * 0.95, rad, dis );
 
        // render
        float f = length(uv-pos)/rad;
        f = sqrt(clamp(1.0 - f * f, 0.0, 1.0));
        color -= col.zyx * (1.0 - smoothstep( rad * 0.95, rad, dis )) * f;
    }
    color *= sqrt(1.5 - 0.5 * length(uv));
    gl_FragColor = vec4(color, 1.0);
}

    `,
    ocean: `
    uniform float iTime;
// 分辨率
uniform vec2 iResolution;
// 鼠标位置
uniform vec2 iMouse;

// vec2 iMouse = vec2(0.0, 0.0);

/*
 * "Seascape" by Alexander Alekseev aka TDM - 2014
 * License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
 * Contact: tdmaav@gmail.com
 */

const int NUM_STEPS = 8;
const float PI	 	= 3.141592;
const float EPSILON	= 1e-3;
#define EPSILON_NRM (0.1 / iResolution.x)

// sea
const int ITER_GEOMETRY = 3;
const int ITER_FRAGMENT = 5;
const float SEA_HEIGHT = 0.6;
const float SEA_CHOPPY = 4.0;
const float SEA_SPEED = 0.8;
const float SEA_FREQ = 0.16;
const vec3 SEA_BASE = vec3(0.1,0.19,0.22);
const vec3 SEA_WATER_COLOR = vec3(0.8,0.9,0.6);
#define SEA_iTime (1.0 + iTime * SEA_SPEED)
const mat2 octave_m = mat2(1.6,1.2,-1.2,1.6);

// math
mat3 fromEuler(vec3 ang) {
	vec2 a1 = vec2(sin(ang.x),cos(ang.x));
    vec2 a2 = vec2(sin(ang.y),cos(ang.y));
    vec2 a3 = vec2(sin(ang.z),cos(ang.z));
    mat3 m;
    m[0] = vec3(a1.y*a3.y+a1.x*a2.x*a3.x,a1.y*a2.x*a3.x+a3.y*a1.x,-a2.y*a3.x);
	m[1] = vec3(-a2.y*a1.x,a1.y*a2.y,a2.x);
	m[2] = vec3(a3.y*a1.x*a2.x+a1.y*a3.x,a1.x*a3.x-a1.y*a3.y*a2.x,a2.y*a3.y);
	return m;
}
float hash( vec2 p ) {
	float h = dot(p,vec2(127.1,311.7));
    return fract(sin(h)*43758.5453123);
}
float noise( in vec2 p ) {
    vec2 i = floor( p );
    vec2 f = fract( p );
	vec2 u = f*f*(3.0-2.0*f);
    return -1.0+2.0*mix( mix( hash( i + vec2(0.0,0.0) ),
                     hash( i + vec2(1.0,0.0) ), u.x),
                mix( hash( i + vec2(0.0,1.0) ),
                     hash( i + vec2(1.0,1.0) ), u.x), u.y);
}

// lighting
float diffuse(vec3 n,vec3 l,float p) {
    return pow(dot(n,l) * 0.4 + 0.6,p);
}
float specular(vec3 n,vec3 l,vec3 e,float s) {
    float nrm = (s + 8.0) / (PI * 8.0);
    return pow(max(dot(reflect(e,n),l),0.0),s) * nrm;
}

// sky
vec3 getSkyColor(vec3 e) {
    e.y = max(e.y,0.0);
    return vec3(pow(1.0-e.y,2.0), 1.0-e.y, 0.6+(1.0-e.y)*0.4);
}

// sea
float sea_octave(vec2 uv, float choppy) {
    uv += noise(uv);
    vec2 wv = 1.0-abs(sin(uv));
    vec2 swv = abs(cos(uv));
    wv = mix(wv,swv,wv);
    return pow(1.0-pow(wv.x * wv.y,0.65),choppy);
}

float map(vec3 p) {
    float freq = SEA_FREQ;
    float amp = SEA_HEIGHT;
    float choppy = SEA_CHOPPY;
    vec2 uv = p.xz; uv.x *= 0.75;

    float d, h = 0.0;
    for(int i = 0; i < ITER_GEOMETRY; i++) {
    	d = sea_octave((uv+SEA_iTime)*freq,choppy);
    	d += sea_octave((uv-SEA_iTime)*freq,choppy);
        h += d * amp;
    	uv *= octave_m; freq *= 1.9; amp *= 0.22;
        choppy = mix(choppy,1.0,0.2);
    }
    return p.y - h;
}

float map_detailed(vec3 p) {
    float freq = SEA_FREQ;
    float amp = SEA_HEIGHT;
    float choppy = SEA_CHOPPY;
    vec2 uv = p.xz; uv.x *= 0.75;

    float d, h = 0.0;
    for(int i = 0; i < ITER_FRAGMENT; i++) {
    	d = sea_octave((uv+SEA_iTime)*freq,choppy);
    	d += sea_octave((uv-SEA_iTime)*freq,choppy);
        h += d * amp;
    	uv *= octave_m; freq *= 1.9; amp *= 0.22;
        choppy = mix(choppy,1.0,0.2);
    }
    return p.y - h;
}

vec3 getSeaColor(vec3 p, vec3 n, vec3 l, vec3 eye, vec3 dist) {
    float fresnel = clamp(1.0 - dot(n,-eye), 0.0, 1.0);
    fresnel = pow(fresnel,3.0) * 0.65;

    vec3 reflected = getSkyColor(reflect(eye,n));
    vec3 refracted = SEA_BASE + diffuse(n,l,80.0) * SEA_WATER_COLOR * 0.12;

    vec3 color = mix(refracted,reflected,fresnel);

    float atten = max(1.0 - dot(dist,dist) * 0.001, 0.0);
    color += SEA_WATER_COLOR * (p.y - SEA_HEIGHT) * 0.18 * atten;

    color += vec3(specular(n,l,eye,60.0));

    return color;
}

// tracing
vec3 getNormal(vec3 p, float eps) {
    vec3 n;
    n.y = map_detailed(p);
    n.x = map_detailed(vec3(p.x+eps,p.y,p.z)) - n.y;
    n.z = map_detailed(vec3(p.x,p.y,p.z+eps)) - n.y;
    n.y = eps;
    return normalize(n);
}

float heightMapTracing(vec3 ori, vec3 dir, out vec3 p) {
    float tm = 0.0;
    float tx = 1000.0;
    float hx = map(ori + dir * tx);
    if(hx > 0.0) return tx;
    float hm = map(ori + dir * tm);
    float tmid = 0.0;
    for(int i = 0; i < NUM_STEPS; i++) {
        tmid = mix(tm,tx, hm/(hm-hx));
        p = ori + dir * tmid;
    	float hmid = map(p);
		if(hmid < 0.0) {
        	tx = tmid;
            hx = hmid;
        } else {
            tm = tmid;
            hm = hmid;
        }
    }
    return tmid;
}

// main
void main() {
	vec2 uv = gl_FragCoord.xy / iResolution.xy;
    uv = uv * 2.0 - 1.0;
    uv.x *= iResolution.x / iResolution.y;
    float iTime = iTime * 0.3 + iMouse.x*0.01;

    // ray
    vec3 ang = vec3(sin(iTime*3.0)*0.1,sin(iTime)*0.2+0.3,iTime);
    vec3 ori = vec3(0.0,3.5,iTime*5.0);
    vec3 dir = normalize(vec3(uv.xy,-2.0)); dir.z += length(uv) * 0.15;
    dir = normalize(dir) * fromEuler(ang);

    // tracing
    vec3 p;
    heightMapTracing(ori,dir,p);
    vec3 dist = p - ori;
    vec3 n = getNormal(p, dot(dist,dist) * EPSILON_NRM);
    vec3 light = normalize(vec3(0.0,1.0,0.8));

    // color
    vec3 color = mix(
        getSkyColor(dir),
        getSeaColor(p,n,light,dir,dist),
    	pow(smoothstep(0.0,-0.05,dir.y),0.3));

    // post
	gl_FragColor = vec4(pow(color,vec3(0.75)), 1.0);
}`


};