import * as THREE from 'three';

class Shader {
    uniforms;
    renderer: THREE.WebGLRenderer;
    camera: THREE.OrthographicCamera;
    scene: THREE.Scene;
    animation: number;
    container: HTMLElement;
    constructor() {
        this.init();
        this.animate();
    }
    init() {

        const container = this.container = document.getElementById('container');
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(- 1, 1, 1, - 1, 0, 1);
        const geometry = new THREE.PlaneBufferGeometry(2, 2);

        const uniforms = this.uniforms = {
            time: { value: 1.0 }
        };
        const material = new THREE.MeshBasicMaterial({color: 0xffff00});
        // const material = new THREE.ShaderMaterial({

        //     uniforms,
        //     vertexShader: document.getElementById('vertexShader').textContent,
        //     fragmentShader: document.getElementById('fragmentShader').textContent

        // });

        const mesh = new THREE.Mesh(geometry, material);
        this.scene.add(mesh);

        this.renderer = new THREE.WebGLRenderer();
        console.log(window.devicePixelRatio)
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(container.offsetWidth, container.offsetHeight);
        container.appendChild(this.renderer.domElement);

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
