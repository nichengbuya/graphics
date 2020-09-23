import * as THREE from 'three';
import { vertexShaderMap, fragmentShaderMap } from './utils';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
interface Data{
    shader: string;
}
class Shader {
    uniforms;
    renderer: THREE.WebGLRenderer;
    camera: THREE.OrthographicCamera;
    scene: THREE.Scene;
    animation: number;
    container: HTMLElement;
    mesh: THREE.Mesh<THREE.PlaneBufferGeometry, THREE.ShaderMaterial>;
    data: Data = {
        shader: 'shader1'
    };
    constructor() {
        this.init();
        this.animate();
    }
    init() {

        const container = this.container = document.getElementById('container');
        const width = container.offsetWidth;
        const height = container.offsetHeight;
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(- 1, 1, 1, - 1, 0, 1);
        const geometry = new THREE.PlaneBufferGeometry(2, 2);

        const uniforms = this.uniforms = {
            time: { value: 1.0 },
            iResolution: { value: new THREE.Vector2(width * 1.0, height * 1.0) },
            iMouse: { value: new THREE.Vector2(0.0, 0.0) }
        };

        const material = new THREE.ShaderMaterial({
            uniforms,
            vertexShader: vertexShaderMap.shader1,
            fragmentShader: fragmentShaderMap.shader1
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(container.offsetWidth, container.offsetHeight);
        container.appendChild(this.renderer.domElement);
        const gui = new GUI();
        const changeShader = () => {
            const shader = this.data.shader;
            console.log(shader);
            if (vertexShaderMap[shader] && fragmentShaderMap[shader]) {
                const newMaterial = new THREE.ShaderMaterial({
                    uniforms,
                    vertexShader: vertexShaderMap[shader],
                    fragmentShader: fragmentShaderMap[shader]
                });
                this.mesh.material = newMaterial;
            }

        };
        gui.add(this.data, 'shader', ['shader1', 'shader2', 'ocean']).name('shader').onChange(changeShader);

        this.onWindowResize = () => {
            this.renderer.setSize(container.offsetWidth, container.offsetHeight);
        };

        window.addEventListener('resize', this.onWindowResize, false);

    }

    onWindowResize = () => {
    }

    //
    destroy() {
        window.removeEventListener('resize', this.onWindowResize, false);
        cancelAnimationFrame(this.animation);
    }

    animate() {
        const { scene, camera, renderer, uniforms } = this;
        this.animation = requestAnimationFrame(this.animate.bind(this));

        uniforms.time.value = performance.now() / 1000;

        renderer.render(scene, camera);

    }
}
export default Shader;
