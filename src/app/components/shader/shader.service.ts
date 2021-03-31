import * as THREE from 'three';
import { vertexShaderMap, fragmentShaderMap } from './utils';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import { Injectable } from '@angular/core';
const matcapTextureUrl = "https://i.loli.net/2021/02/27/7zhBySIYxEqUFW3.png";
interface Data {
    shader: string;
}
interface Prop {
    container: any;
}
@Injectable({
    providedIn: 'root'
})
export class ShaderService {
    uniforms;
    renderer: THREE.WebGLRenderer;
    camera: THREE.OrthographicCamera;
    scene: THREE.Scene;
    animation: number;
    container: HTMLElement;
    mesh: THREE.Mesh<THREE.PlaneBufferGeometry, THREE.ShaderMaterial>;
    data: Data = {
        shader: 'rayMatching'
    };
    gui: any;
    constructor() {
    }
    init(container) {
        this.container = container;
        const width = container.offsetWidth;
        const height = container.offsetHeight;
        this.scene = new THREE.Scene();
        const loader = new THREE.TextureLoader();
        const texture = loader.load(matcapTextureUrl);
        this.camera = new THREE.OrthographicCamera(- 1, 1, 1, - 1, 0, 1);
        const geometry = new THREE.PlaneBufferGeometry(2, 2);

        const uniforms = this.uniforms = {
            iTime: { value: 1.0 },
            iResolution: { value: new THREE.Vector2(width * 1.0, height * 1.0) },
            iMouse: { value: new THREE.Vector2(0.0, 0.0) },
            iTexture: {
                value: texture
            },
            iProgress: {
                value: 1
            },
            iVelocityBox: {
                value: 0.25
            },
            iVelocitySphere: {
                value: 0.5
            },
            iAngle: {
                value: 1.5
            },
            iDistance: {
                value: 1.2
            }
        };

        const material = new THREE.ShaderMaterial({
            uniforms,
            vertexShader: vertexShaderMap[this.data.shader],
            fragmentShader: fragmentShaderMap[this.data.shader]
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(container.offsetWidth, container.offsetHeight);
        container.appendChild(this.renderer.domElement);
        const gui = this.gui = new GUI();
        const changeShader = () => {
            const shader = this.data.shader;
            if (vertexShaderMap[shader] && fragmentShaderMap[shader]) {
                const newMaterial = new THREE.ShaderMaterial({
                    uniforms,
                    vertexShader: vertexShaderMap[shader],
                    fragmentShader: fragmentShaderMap[shader]
                });
                this.mesh.material = newMaterial;
            }

        };
        const list = Object.keys(vertexShaderMap);
        gui.add(this.data, 'shader', list).name('shader').onChange(changeShader);

        this.onWindowResize = () => {
            this.updateSize()
        };

        window.addEventListener('resize', this.onWindowResize, false);
        this.animate();

    }
    updateSize() {
        const { container } = this;
        this.renderer.setSize(container.offsetWidth, container.offsetHeight);
    }
    onWindowResize = () => {
    }

    //
    destroy() {
        window.removeEventListener('resize', this.onWindowResize, false);
        cancelAnimationFrame(this.animation);
        this.gui.destroy();
    }

    animate() {
        const { scene, camera, renderer, uniforms } = this;
        this.animation = requestAnimationFrame(this.animate.bind(this));

        uniforms.iTime.value = performance.now() / 1000;

        renderer.render(scene, camera);

    }
}
