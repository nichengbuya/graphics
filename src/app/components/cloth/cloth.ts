import * as THREE from 'three';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';
import { clothFunction, DRAG, GRAVITY, MASS, RESTDISTANCE, TIMESTEP_SQ, XSEGS, YSEGS } from './config';
import World from '../common/world';

interface ClothProp {
    width: number;
    height: number;
}
interface ParticleProp {
    x: number;
    y: number;
    z: number;
    mass: number;
}
interface Params {
    enableWind: boolean;
    showBall: boolean;
}

class Particle {
    position: THREE.Vector3;
    previous: THREE.Vector3;
    original: THREE.Vector3;
    a: THREE.Vector3;
    mass: any;
    invMass: number;
    tmp: THREE.Vector3;
    tmp2: THREE.Vector3;
    constructor(options: ParticleProp) {
        this.position = new THREE.Vector3();
        this.previous = new THREE.Vector3();
        this.original = new THREE.Vector3();
        this.a = new THREE.Vector3(0, 0, 0); // acceleration
        this.mass = 0.1;
        this.invMass = 1 / this.mass;
        this.tmp = new THREE.Vector3();
        this.tmp2 = new THREE.Vector3();
        const { x, y, z } = options;

        clothFunction(x, y, this.position); // position
        clothFunction(x, y, this.previous); // previous
        clothFunction(x, y, this.original);
    }
    // f = ma a = f / m
    addForce(force) {
        this.a.add(
            this.tmp2.copy(force).multiplyScalar(this.invMass)
        );
    }

    // f b→a = −k s ((b-a) / ||b−a||) (||b − a|| − l)
    integrate(timesq) {
        const newPos = this.tmp.subVectors(this.position, this.previous);
        newPos.multiplyScalar(DRAG).add(this.position);
        newPos.add(this.a.multiplyScalar(timesq));
        this.tmp = this.previous;
        this.previous = this.position;
        this.position = newPos;
        this.a.set(0, 0, 0);
    }

}
class Cloth {
    w: number;
    h: number;
    particles: Array<Particle>;
    constraints: Array<any>;
    constructor(options: ClothProp) {
        this.w = options.width;
        this.h = options.height;
        this.init();
    }
    init() {
        this.particles = [];
        this.constraints = [];
        for (let v = 0; v <= this.h; v++) {
            for (let u = 0; u <= this.w; u++) {
                this.particles.push(new Particle({
                    x: u / this.w,
                    y: v / this.h,
                    z: 0,
                    mass: MASS
                }));
            }
        }

        for (let v = 0; v < this.h; v++) {

            for (let u = 0; u < this.w; u++) {
                this.constraints.push([
                    this.particles[this.index(u, v)],
                    this.particles[this.index(u, v + 1)],
                    RESTDISTANCE
                ]);

                this.constraints.push([
                    this.particles[this.index(u, v)],
                    this.particles[this.index(u + 1, v)],
                    RESTDISTANCE
                ]);

            }

        }

        for (let u = this.w, v = 0; v < this.h; v++) {

            this.constraints.push([
                this.particles[this.index(u, v)],
                this.particles[this.index(u, v + 1)],
                RESTDISTANCE

            ]);

        }

        for (let v = this.h, u = 0; u < this.w; u++) {

            this.constraints.push([
                this.particles[this.index(u, v)],
                this.particles[this.index(u + 1, v)],
                RESTDISTANCE
            ]);

        }

    }
    index(u, v) {
        return u + v * (this.w + 1);
    }
}
class AnimateCloth extends World {
    windForce: THREE.Vector3;
    params: Params;
    gui: GUI;
    cloth: Cloth;
    clothGeometry: THREE.ParametricBufferGeometry;
    tmpForce: THREE.Vector3;
    gravity: THREE.Vector3;
    constructor(options) {
        super(options);
        this.params = {
            enableWind: true,
            showBall: false
        };
        this.gui = new GUI();
        this.tmpForce = new THREE.Vector3();
        this.gravity = new THREE.Vector3(0, -GRAVITY, 0).multiplyScalar(MASS);
        this.gui.add(this.params, 'enableWind').name('Enable wind');
        this.gui.add(this.params, 'showBall').name('Show ball');
        // this.gui.add( this.params, 'togglePins' ).name( 'Toggle pins' );
        this.cloth = new Cloth({
            width: XSEGS,
            height: YSEGS
        });
        this.windForce = new THREE.Vector3();
        this.clothGeometry = new THREE.ParametricBufferGeometry(clothFunction, this.cloth.w, this.cloth.h);
        this.initCloth();
    }
    initCloth() {
        this.camera.position.set( 1000, 50, 1500 );
        const clothMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc, side: THREE.DoubleSide });
        const object = new THREE.Mesh(this.clothGeometry, clothMaterial);
        object.position.set(0, 0, 0);
        object.castShadow = true;
        this.scene.add(object);
        const groundMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide });

        const ground = new THREE.Mesh(new THREE.PlaneBufferGeometry(20000, 20000), groundMaterial);
        ground.position.y = - 250.5;
        ground.rotation.x = - Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        const poleGeo = new THREE.BoxBufferGeometry(5, 375, 5);
        const poleMat = new THREE.MeshLambertMaterial();
        let mesh = new THREE.Mesh(poleGeo, poleMat);
        mesh.position.x = - 125;
        mesh.position.y = - 62;
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        this.scene.add(mesh);

        mesh = new THREE.Mesh(poleGeo, poleMat);
        mesh.position.x = 125;
        mesh.position.y = - 62;
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        this.scene.add(mesh);

        mesh = new THREE.Mesh(new THREE.BoxBufferGeometry(255, 5, 5), poleMat);
        mesh.position.y = - 250 + (750 / 2);
        mesh.position.x = 0;
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        this.scene.add(mesh);

        const gg = new THREE.BoxBufferGeometry(10, 10, 10);
        mesh = new THREE.Mesh(gg, poleMat);
        mesh.position.y = - 250;
        mesh.position.x = 125;
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        this.scene.add(mesh);

        mesh = new THREE.Mesh(gg, poleMat);
        mesh.position.y = - 250;
        mesh.position.x = - 125;
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        this.scene.add(mesh);

        const light = new THREE.DirectionalLight( 0xdfebff, 1 );
        light.position.set( 50, 200, 100 );
        light.position.multiplyScalar( 1.3 );

        light.castShadow = true;

        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;

        const d = 300;

        light.shadow.camera.left = - d;
        light.shadow.camera.right = d;
        light.shadow.camera.top = d;
        light.shadow.camera.bottom = - d;

        light.shadow.camera.far = 1000;

        this.scene.add( light );
    }
    simulate() {
        const now = Date.now();
        const windStrength = Math.cos(now / 7000) * 20 + 40;
        const pins = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
        this.windForce.set(Math.sin(now / 2000), Math.cos(now / 3000), Math.sin(now / 1000));
        this.windForce.normalize();
        this.windForce.multiplyScalar(windStrength);
        if (this.params.enableWind) {
            const normal = new THREE.Vector3();
            const indices = this.clothGeometry.index;
            const normals: any = this.clothGeometry.attributes.normal;
            let indx;
            for (let i = 0; i < indices.count; i += 3) {
                for (let j = 0; j < 3; j++) {
                    indx = indices.getX(i + j);
                    normal.fromBufferAttribute(normals, indx);
                    this.tmpForce.copy(normal).normalize().multiplyScalar(normal.dot(this.windForce));
                    this.cloth.particles[indx].addForce(this.tmpForce);
                }
            }
        }
        for (const particle of this.cloth.particles) {
            particle.addForce(this.gravity);
            particle.integrate(TIMESTEP_SQ);
            if (particle.position.y < -250){
                particle.position.y = -250;
            }
        }
        for (const pin of pins ){
            const p = this.cloth.particles[pin];
            p.position.copy(p.original);
            p.position.copy(p.original);
        }
        for (const contraint of this.cloth.constraints) {
            this.satisfyConstraints(contraint[0], contraint[1], contraint[2]);
        }

    }
    satisfyConstraints(p1, p2, distance) {
        const diff = new THREE.Vector3();
        diff.subVectors(p2.position, p1.position);
        const currentDist = diff.length();
        if (currentDist === 0) { return; } // prevents division by 0
        const correction = diff.multiplyScalar(1 - distance / currentDist);
        const correctionHalf = correction.multiplyScalar(0.5);
        p1.position.add(correctionHalf);
        p2.position.sub(correctionHalf);

    }
    update() {
        const p = this.cloth.particles;

        for (let i = 0, il = p.length; i < il; i++) {

            const v = p[i].position;

            this.clothGeometry.attributes.position.setXYZ(i, v.x, v.y, v.z);

        }

        this.clothGeometry.attributes.position.needsUpdate = true;

        this.clothGeometry.computeVertexNormals();

    }
}
export default AnimateCloth;
