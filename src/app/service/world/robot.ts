import Kinematics from 'src/app/common/kinematics';
import { environmentUrl } from 'src/app/config';
import * as THREE from 'three';
import { Mesh, BoxBufferGeometry, MeshBasicMaterial, Object3D } from 'three';
import { Device } from './world.service';

class Robot extends Object3D{
    constructor(robot, device){
        super();
        // super.robot;
        super.name = robot.robotName;
        this.joints = robot.joints;
        this.initRobot(device);
        this.fk();
    }
    joints;
    effector: Object3D;
    ik = () => {};
    fk = () => {};
    initRobot(device: Device) {
            this.userData.type = device.type;
            this.userData.attach = device.attach;
            this.userData.kinematics = new Kinematics(this.name);
            this.userData.joints = Object.values(this.joints).filter((joint: any) => joint.jointType === 'revolute');
            const effector = new Mesh(new BoxBufferGeometry(.01, .01, .01), new MeshBasicMaterial({ transparent: true }));
            this.add(effector);
            this.userData.effector = effector;
            this.fk = () => {
              const theta = this.userData.joints.map((joint: { angle: any; }) => joint.angle);
              const result = this.userData.kinematics.forward(theta);
              effector.position.set(result[0], result[1], result[2]);
              effector.rotation.set(result[3], result[4], result[5]);
            };
            this.ik = () => {
              if (!effector) {
                return;
              }
              effector.updateMatrixWorld();
              const matrix = effector.matrix.elements;
              const cartPos = [
                matrix[0], matrix[4], matrix[8], matrix[12],
                matrix[1], matrix[5], matrix[9], matrix[13],
                matrix[2], matrix[6], matrix[10], matrix[14],
              ];
              const theta = this.userData.kinematics.inverse(cartPos)[2];
              theta.forEach((value: number, index: string | number) => {
                if (Math.abs(value - this.userData.joints[index]) > Math.PI * 2 - Math.PI / 180 * 10) {
                  value > 0 ? value = value - Math.PI * 2 : value = value + Math.PI * 2;
                }
              });
              if (theta.find((item: number) => isNaN(item)) === undefined) {
                if (theta.every((item: number) => item === 0)) {
                } else {
                  // this.changeRobotColor(color.default);
                  theta.forEach((item: any, index: string | number) => {
                    this.userData.joints[index].setAngle(item);
                  });
                }
              }
            };

      }
}
export default Robot;
