import World from '../common/world';
import * as THREE from 'three';
import { XacroLoader } from 'xacro-parser';
import URDFLoader from 'urdf-loader';
import URDFLink from 'urdf-loader';
import Kinematics from '../common/kinematics';
import { BoxBufferGeometry, GridHelper, Mesh, MeshBasicMaterial } from 'three';
const PACKAGE = 'assets/robot';

class Animation extends World {
    effector: THREE.Object3D;
    constructor(option) {
        super(option);
        this.initPlane();
        this.initEndEffector();
    }
    initPlane() {
        const light = new THREE.DirectionalLight( 0xffffff, 1 );
        light.castShadow = true;
        this.camera.add(light);
        const griper = new GridHelper(20, 10);
        griper.rotation.x = -Math.PI / 2;
        this.add(griper);
    }
    initRobot(url): Promise<URDFLink> {
        const manager = new THREE.LoadingManager();

        const loader = new URDFLoader(manager);
        loader.packages = PACKAGE;
        loader.fetchOptions = { mode: 'cors', credentials: 'same-origin' };
        return new Promise((resolve, reject) => {
            loader.load(url, (robot: URDFLink) => {
                robot.userData.kinematics = new Kinematics(robot);
                robot.userData.joints = Object.values(robot.joints).filter((joint: any) => joint.jointType === 'revolute');
                robot.userData.fk = () => {
                    const theta = robot.userData.joints.map(joint => joint.angle);
                    const result = robot.userData.kinematics.forward(theta);
                    this.effector.position.set(result[0], result[1], result[2]);
                    this.effector.rotation.set(result[3], result[4], result[5]);
                };
                robot.userData.ik = () => {
                    this.effector.updateMatrixWorld();
                    const matrix = this.effector.matrix.elements;
                    const cartPos = [
                      matrix[0], matrix[4], matrix[8], matrix[12],
                      matrix[1], matrix[5], matrix[9], matrix[13],
                      matrix[2], matrix[6], matrix[10], matrix[14],
                    ];
                    const theta = robot.userData.kinematics.inverse(cartPos)[2];
                    theta.forEach((value, index) => {
                      if (Math.abs(value - robot.userData.joints[index]) > Math.PI * 2 - Math.PI / 180 * 10) {
                        value > 0 ? value = value - Math.PI * 2 : value = value + Math.PI * 2;
                      }
                    });
                    if (theta.find(item => isNaN(item)) === undefined) {
                        if (theta.every(item => item === 0)) {
                        } else {
                          // this.changeRobotColor(color.default);
                          theta.forEach((item, index) => {
                            robot.userData.joints[index].setAngle(item);
                          });
                        }
                      }
                };
                this.scene.add(robot);
                manager.onLoad = () => {
                    resolve(robot);
                };
            }, () => {}, (error) => {
                reject(error);
            });
        });

    }
    initEndEffector(){
        this.effector = new Mesh(new BoxBufferGeometry(.01, .01, .01), new MeshBasicMaterial({transparent: true}));
        this.scene.add(this.effector);
        this.transformControls.attach(this.effector);
    }

}
export default Animation;
