import THREE from './three';
export class ShaderRepo {
    public static Additive = {
        uniforms: {
            tDiffuse: { type: 't', value: 0, texture: null },
            tAdd: { type: 't', value: 1, texture: null },
            fCoeff: { type: 'f', value: 0.0 },
            vTintColor: { type: 'v', value: new THREE.Vector3() }
        },

        vertexShader: [
            'varying vec2 vUv;',

            'void main() {',
            'vUv = uv;',
            'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
            '}'
        ].join('\n'),

        fragmentShader: [
            'uniform sampler2D tDiffuse;',
            'uniform sampler2D tAdd;',
            'uniform float fCoeff;',
            'uniform vec4 vTintColor;',

            'varying vec2 vUv;',

            'void main() {',
            'vec4 texel = texture2D( tDiffuse, vUv );',
            'vec4 add = texture2D( tAdd, vUv );',
            'vec4 texFinal = texel + add * fCoeff * add.a;',
            'vec4 final = texFinal*vTintColor;',
            'gl_FragColor = final;',

            '}'
        ].join('\n')
    }

    public static LuminosityHighPassShader = {
        shaderID: 'luminosityHighPass',

        uniforms: {

            'tDiffuse': { type: 't', value: null },
            'luminosityThreshold': { type: 'f', value: 1.0 },
            'smoothWidth': { type: 'f', value: 1.0 },
            'defaultColor': { type: 'c', value: new THREE.Color(0x000000) },
            'defaultOpacity': { type: 'f', value: 0.0 }

        },

        vertexShader: [

            'varying vec2 vUv;',

            'void main() {',

            'vUv = uv;',

            'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

            '}'

        ].join('\n'),

        fragmentShader: [

            'uniform sampler2D tDiffuse;',
            'uniform vec3 defaultColor;',
            'uniform float defaultOpacity;',
            'uniform float luminosityThreshold;',
            'uniform float smoothWidth;',

            'varying vec2 vUv;',

            'void main() {',

            'vec4 texel = texture2D( tDiffuse, vUv );',

            'vec3 luma = vec3( 0.299, 0.587, 0.114 );',

            'float v = dot( texel.xyz, luma );',

            'vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );',

            'float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );',

            'gl_FragColor = mix( outputColor, texel, alpha );',

            '}'

        ].join('\n')
    }

    public static FinalPass = {
        uniforms: {
            baseTexture: { value: null },
            bloomTexture: { value: null }
        },
        vertexShader: [
            'varying vec2 vUv;',
            'void main() {',
            '	vUv = uv;',
            '	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
            '}',
        ].join('\n'),

        fragmentShader: [
            'uniform sampler2D baseTexture;',
            'uniform sampler2D bloomTexture;',
            'varying vec2 vUv;',
            'vec4 getTexture( sampler2D texelToLinearTexture ) {',
            '	return mapTexelToLinear( texture2D( texelToLinearTexture , vUv ) );',
            '}',
            'void main() {',
            '	gl_FragColor = ( getTexture( baseTexture ) + vec4( 1.0 ) * getTexture( bloomTexture ) );',
            '}',

        ].join('\n')
    }

    public static FXAAShader = {

        uniforms: {

            'tDiffuse': { type: 't', value: null },
            'resolution': { type: 'v2', value: new THREE.Vector2(1 / 1024, 1 / 512) }

        },

        vertexShader: [

            'varying vec2 vUv;',

            'void main() {',

            'vUv = uv;',
            'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

            '}'

        ].join('\n'),

        fragmentShader: [

            'uniform sampler2D tDiffuse;',
            'uniform vec2 resolution;',

            'varying vec2 vUv;',

            '#define FXAA_REDUCE_MIN   (1.0/128.0)',
            '#define FXAA_REDUCE_MUL   (1.0/8.0)',
            '#define FXAA_SPAN_MAX     8.0',

            'void main() {',

            'vec3 rgbNW = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( -1.0, -1.0 ) ) * resolution ).xyz;',
            'vec3 rgbNE = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( 1.0, -1.0 ) ) * resolution ).xyz;',
            'vec3 rgbSW = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( -1.0, 1.0 ) ) * resolution ).xyz;',
            'vec3 rgbSE = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( 1.0, 1.0 ) ) * resolution ).xyz;',
            'vec4 rgbaM  = texture2D( tDiffuse,  gl_FragCoord.xy  * resolution );',
            'vec3 rgbM  = rgbaM.xyz;',
            'vec3 luma = vec3( 0.299, 0.587, 0.114 );',

            'float lumaNW = dot( rgbNW, luma );',
            'float lumaNE = dot( rgbNE, luma );',
            'float lumaSW = dot( rgbSW, luma );',
            'float lumaSE = dot( rgbSE, luma );',
            'float lumaM  = dot( rgbM,  luma );',
            'float lumaMin = min( lumaM, min( min( lumaNW, lumaNE ), min( lumaSW, lumaSE ) ) );',
            'float lumaMax = max( lumaM, max( max( lumaNW, lumaNE) , max( lumaSW, lumaSE ) ) );',

            'vec2 dir;',
            'dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));',
            'dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));',

            'float dirReduce = max( ( lumaNW + lumaNE + lumaSW + lumaSE ) * ( 0.25 * FXAA_REDUCE_MUL ), FXAA_REDUCE_MIN );',

            'float rcpDirMin = 1.0 / ( min( abs( dir.x ), abs( dir.y ) ) + dirReduce );',
            'dir = min( vec2( FXAA_SPAN_MAX,  FXAA_SPAN_MAX),',
            'max( vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),',
            'dir * rcpDirMin)) * resolution;',
            'vec4 rgbA = (1.0/2.0) * (',
            'texture2D(tDiffuse,  gl_FragCoord.xy  * resolution + dir * (1.0/3.0 - 0.5)) +',
            'texture2D(tDiffuse,  gl_FragCoord.xy  * resolution + dir * (2.0/3.0 - 0.5)));',
            'vec4 rgbB = rgbA * (1.0/2.0) + (1.0/4.0) * (',
            'texture2D(tDiffuse,  gl_FragCoord.xy  * resolution + dir * (0.0/3.0 - 0.5)) +',
            'texture2D(tDiffuse,  gl_FragCoord.xy  * resolution + dir * (3.0/3.0 - 0.5)));',
            'float lumaB = dot(rgbB, vec4(luma, 0.0));',

            'if ( ( lumaB < lumaMin ) || ( lumaB > lumaMax ) ) {',

            'gl_FragColor = rgbA;',

            '} else {',
            'gl_FragColor = rgbB;',

            '}',

            '}'

        ].join('\n')

    };
}
