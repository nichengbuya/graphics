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
    shader3: `
    varying vec2 vUv;
    void main() {
     vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
    `,
    shader4: `
    varying vec2 vUv;
    void main() {
     vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
    
    `,
    shader5:`
    varying vec2 vUv;
    void main() {
     vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}  
    `,
    heart:`
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
    `,
    test:`
    varying vec2 vUv;
    void main() {
     vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}  
    `
};
export const fragmentShaderMap = {
    shader1: `
    //颜色变化
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
    //气泡
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
    shader3:`
    //细胞分裂
    const int n = 800;
const float rate = 7.;
const float lineThickness = 2.2;
const float colours = 0.05; // proportion of cells to colour in
const bool zoom = true;

const float phi = 1.6180339887498948;
const float tau = 6.2831853071795865;
varying vec2 vUv;
uniform vec3 iResolution;
uniform float iTime;
void main()
{
   vec2 uv = vUv-0.5;
   float penOut = lineThickness/iResolution.y;
   float penIn = (lineThickness-2.8)/iResolution.y;

   float t = iTime*rate;

   gl_FragColor = vec4(0,0,0,1);

   float scale = sqrt(float(n));
   if ( zoom ) scale = min( scale, pow((iTime+7.)*rate*.5,.6) ); // keep the edgemost points in shot as we zoom

   float closest = 1e38;
   float closest2 = 1e38;
   for ( int i=0; i < n; i++ )
   {
       float f = float(i);
       f += fract(t);
       float r = sqrt(f/128.);
       r *= 13./scale;
       float a = fract((f-t)*phi)*tau;
       vec2 pos = r*vec2(sin(a),cos(a));

       vec3 col = sin(vec3(3,1,6)*(float(i)-floor(t)))*.5+.5;
       if ( fract(col.y*64.) > colours ) col = vec3(1);

       float l = length(pos-uv);

       // add a ring to help me track size (so it doesn't look like we're zooming out)
       //col *= smoothstep(penIn,penOut,abs(l/scale-.001)*scale);

       if ( i == 0 ) l += smoothstep(1.,0.,fract(t))*1.2/scale; // grow the new point
       if ( l < closest )
       {
           if ( closest < closest2 ) closest2 = closest;
           closest = l;
           gl_FragColor.rgb = col; // *(1.-l*sqrt(float(n)));
       }
       else if ( l < closest2 )
       {
           closest2 = l;
       }
       gl_FragColor.rgb = mix(gl_FragColor.rgb,vec3(0),smoothstep(penOut,penIn,length(pos-uv)));
   }

   // cell borders
   gl_FragColor.rgb *= smoothstep(penIn,penOut,(closest2-closest));//*scale);
}
    `,
    shader4:`
    //紫色很酷
    varying vec2 vUv;
    uniform vec3 iResolution;
    uniform float iTime;
    vec3 palette(float d){
	return mix(vec3(0.2,0.7,0.9),vec3(1.,0.,1.),d);
}

vec2 rotate(vec2 p,float a){
	float c = cos(a);
    float s = sin(a);
    return p*mat2(c,s,-s,c);
}

float map(vec3 p){
    for( int i = 0; i<8; ++i){
        float t = iTime*0.2;
        p.xz =rotate(p.xz,t);
        p.xy =rotate(p.xy,t*1.89);
        p.xz = abs(p.xz);
        p.xz-=.5;
	}
	return dot(sign(p),p)/5.;
}

vec4 rm (vec3 ro, vec3 rd){
    float t = 0.;
    vec3 col = vec3(0.);
    float d;
    for(float i =0.; i<64.; i++){
		vec3 p = ro + rd*t;
        d = map(p)*.5;
        if(d<0.02){
            break;
        }
        if(d>100.){
        	break;
        }
        //col+=vec3(0.6,0.8,0.8)/(400.*(d));
        col+=palette(length(p)*.1)/(400.*(d));
        t+=d;
    }
    return vec4(col,1./(d*100.));
}
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = (fragCoord-(iResolution.xy/2.))/iResolution.x;
	vec3 ro = vec3(0.,0.,-50.);
    ro.xz = rotate(ro.xz,iTime);
    vec3 cf = normalize(-ro);
    vec3 cs = normalize(cross(cf,vec3(0.,1.,0.)));
    vec3 cu = normalize(cross(cf,cs));    
    vec3 uuv = ro+cf*3. + uv.x*cs + uv.y*cu;  
    vec3 rd = normalize(uuv-ro);   
    vec4 col = rm(ro,rd);    
    fragColor = col;
}
void main() {
    mainImage(gl_FragColor, vUv * iResolution.xy);
  }
    `,
    shader5:`
    //园
    varying vec2 vUv;
    uniform vec3 iResolution;
    uniform float iTime;
    void mainImage( out vec4 fragColor, in vec2 fragCoord ){
        vec2 uv = (2.0 * fragCoord.xy - iResolution.xy) / min(iResolution.y, iResolution.x);
        float len = length(uv) -0.5;
        float t = clamp(len* min(iResolution.y,iResolution.x)*0.25,0.0,1.0);
        vec4 bg = vec4(0.0,0.0,0.0,1.0);
        vec4 layer = vec4(1.0,0.0,0.0,1.0-t);
        fragColor = mix(bg,layer,layer.a);

    }
   void main() {
    mainImage(gl_FragColor, vUv * iResolution.xy);
    }
    `,
    heart:`
    varying vec2 vUv;
    uniform vec3 iResolution;
    uniform float iTime;
    void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 p = (2.0*fragCoord-iResolution.xy)/min(iResolution.y,iResolution.x);
	
    // background color
    vec3 bcol = vec3(1.0,0.8,0.7-0.07*p.y)*(1.0-0.25*length(p));

    // animate
    float tt = mod(iTime,1.5)/1.5;
    float ss = pow(tt,.2)*0.5 + 0.5;
    ss = 1.0 + ss*0.5*sin(tt*6.2831*3.0 + p.y*0.5)*exp(-tt*4.0);
    p *= vec2(0.5,1.5) + ss*vec2(0.5,-0.5);

    // shape
#if 0
    p *= 0.8;
    p.y = -0.1 - p.y*1.2 + abs(p.x)*(1.0-abs(p.x));
    float r = length(p);
	float d = 0.5;
#else
	p.y -= 0.25;
    float a = atan(p.x,p.y)/3.141593;
    float r = length(p);
    float h = abs(a);
    float d = (13.0*h - 22.0*h*h + 10.0*h*h*h)/(6.0-5.0*h);
#endif
    
	// color
	float s = 0.75 + 0.75*p.x;
	s *= 1.0-0.4*r;
	s = 0.3 + 0.7*s;
	s *= 0.5+0.5*pow( 1.0-clamp(r/d, 0.0, 1.0 ), 0.1 );
	vec3 hcol = vec3(1.0,0.5*r,0.3)*s;
	
    vec3 col = mix( bcol, hcol, smoothstep( -0.01, 0.01, d-r) );

    fragColor = vec4(col,1.0);
}
void main() {
    mainImage(gl_FragColor, vUv * iResolution.xy);
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
}`, 
test:`
varying vec2 vUv;
uniform vec3 iResolution;
uniform float iTime;
float Circle(vec2 uv, vec2 p, float r, float blur) {
	float d = length(uv-p);
    float c = smoothstep(r, r-blur, d);
    
    return c;
}

float Smiley(vec2 uv, vec2 p, float size) {
    uv -= p;
    uv /= size;
    
    float mask = Circle(uv, vec2(0.), .4, .05);
    
    mask -= Circle(uv, vec2(-.13, .2), .07, .01);
    mask -= Circle(uv, vec2(.13, .2), .07, .01);
    
    float mouth = Circle(uv, vec2(0., 0.), .3, .02);
    mouth -= Circle(uv, vec2(0., .1), .3, .02);
    
    mask -= mouth;

    return mask;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    // vec2 uv = fragCoord/iResolution.xy;
	
    // uv -=0.5;
    // uv.x *= iResolution.x / iResolution.y;
    
    vec2 uv = (2.0*fragCoord-iResolution.xy)/min(iResolution.y,iResolution.x);
    vec3 col = vec3(0.);
    
    float t = iTime;
    vec2 p = vec2(sin(t)*.7, cos(t)*0.3);
    
    float mask = Smiley(uv, p, .3);
    
    
    col = vec3(1., 1., 0.)*mask;
    
    fragColor = vec4(col,1.0);
}
void main() {
    mainImage(gl_FragColor, vUv * iResolution.xy);
}
`
};