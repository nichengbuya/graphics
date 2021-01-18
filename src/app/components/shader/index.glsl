    void mainImage( out vec4 fragColor, in vec2 fragCoord ){
        vec2 uv = (2.0 * fragCoord.xy - iResolution.xy) / min(iResolution.y, iResolution.x);
        float len = length(uv) - 0.5;
        float t = clamp(len* min(iResolution.y,iResolution.x)*0.25,0.0,1.0);
        vec4 bg = vec4(0,0,0,0);
        vec4 layer = vec4(1,0,0,1-t);
        fragColor = mix(bg,layer,layer.a);

    }