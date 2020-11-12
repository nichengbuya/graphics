import * as THREE from 'three';
import {atan2, chain, derivative, e, evaluate, log, pi, pow, round, sqrt, sin, cos, abs} from 'mathjs';

const ZERO_THRESH = 1e-4;
const PI = Math.PI;

class Kinematics {
	inverse;
	forward;
	constructor(robotName) {
	
		switch (robotName) {
			case 'sirobot_ur5':
				this.forward = (a) => {
					return this.ur_forward(a);
				};
				this.inverse = (a) => {
					return this.ur_inverse(a);
				};
				break;
			case 'aubo_i5':
				this.inverse = this.aubo_inverse;
				this.forward = this.aubo_forward;
				break;
		}

	}


	ur_forward (theta) {
		// const theta = this.joints.map(joint => joint.angle);
		const a = [0, -0.42500, -0.39225, 0, 0, 0];
		const d = [0.089159, 0, 0, 0.10915, 0.09465, 0.08230];
		const alpha = [Math.PI / 2, 0, 0, Math.PI / 2, -Math.PI / 2, 0];
		const result = this.createTransformMatrix(theta[0], d[0], a[0], alpha[0]);
		for (let i = 1; i < 6; i++) {
			result.multiply(this.createTransformMatrix(theta[i], d[i], a[i], alpha[i]));
		}
		let euler = new THREE.Euler(0, 0, 0, 'XYZ');
		let vec3 = new THREE.Vector3(0, 0, 0);
		euler = euler.setFromRotationMatrix(result);
		vec3 = vec3.applyMatrix4(result);
		return [vec3.x, vec3.y, vec3.z, euler.x, euler.y, euler.z];
	}
	createTransformMatrix(theta, d, a, alpha) {
		const T = new THREE.Matrix4();
		T.set(
			Math.cos(theta), -Math.sin(theta) * Math.cos(alpha), Math.sin(theta) * Math.sin(alpha), a * Math.cos(theta),
			Math.sin(theta), Math.cos(theta) * Math.cos(alpha), -Math.cos(theta) * Math.sin(alpha), a * Math.sin(theta),
			0, Math.sin(alpha), Math.cos(alpha), d,
			0, 0, 0, 1
		);
		return T;
	}
	// cart_pos = [nx ox ax px; ny oy az py; nz oz az pz]
	ur_inverse(cart_pos) {
		let nx = cart_pos[0]; let ox = cart_pos[1]; let ax = cart_pos[2]; let px = cart_pos[3];
		let ny = cart_pos[4]; let oy = cart_pos[5]; let ay = cart_pos[6]; let py = cart_pos[7];
		let nz = cart_pos[8]; let oz = cart_pos[9]; let az = cart_pos[10]; let pz = cart_pos[11];
		let a = [0, -0.425, -0.39225, 0, 0, 0];
		let d = [0.089159, 0, 0, 0.10915, 0.09465, 0.0823];
		let temp1 = d[5] * ay - py;
		let temp2 = d[5] * ax - px;

		let jnt1_pos0 = Math.atan2(temp1, temp2) - Math.atan2(d[3], Math.sqrt(temp1 * temp1 + temp2 * temp2 - d[3] * d[3]));
		let jnt1_pos1 = Math.atan2(temp1, temp2) - Math.atan2(d[3], -Math.sqrt(temp1 * temp1 + temp2 * temp2 - d[3] * d[3]));

		let jnt5_pos0 = this.SolveTheta5(jnt1_pos0, ax, ay);
		let jnt5_pos1 = -jnt5_pos0;
		let jnt5_pos2 = this.SolveTheta5(jnt1_pos1, ax, ay);
		let jnt5_pos3 = -jnt5_pos2;

		let jnt6_pos0 = this.SolveTheta6(jnt1_pos0, jnt5_pos0, ox, oy, nx, ny);
		let jnt6_pos1 = this.SolveTheta6(jnt1_pos0, jnt5_pos1, ox, oy, nx, ny);
		let jnt6_pos2 = this.SolveTheta6(jnt1_pos1, jnt5_pos2, ox, oy, nx, ny);
		let jnt6_pos3 = this.SolveTheta6(jnt1_pos1, jnt5_pos3, ox, oy, nx, ny);


		let jnt3_jnt2_pos01 = this.SolveTheta3AndTheta2(jnt1_pos0, jnt5_pos0, jnt6_pos0, a[1], a[2], d[0], d[4], d[5], nx, ny, nz, ox, oy, oz, ax, ay, az, px, py, pz);
		let jnt3_jnt2_pos23 = this.SolveTheta3AndTheta2(jnt1_pos0, jnt5_pos1, jnt6_pos1, a[1], a[2], d[0], d[4], d[5], nx, ny, nz, ox, oy, oz, ax, ay, az, px, py, pz);
		let jnt3_jnt2_pos45 = this.SolveTheta3AndTheta2(jnt1_pos1, jnt5_pos2, jnt6_pos2, a[1], a[2], d[0], d[4], d[5], nx, ny, nz, ox, oy, oz, ax, ay, az, px, py, pz);
		let jnt3_jnt2_pos67 = this.SolveTheta3AndTheta2(jnt1_pos1, jnt5_pos3, jnt6_pos3, a[1], a[2], d[0], d[4], d[5], nx, ny, nz, ox, oy, oz, ax, ay, az, px, py, pz);
		let jnt3_pos0 = jnt3_jnt2_pos01[0];
		let jnt3_pos1 = jnt3_jnt2_pos01[2];
		let jnt3_pos2 = jnt3_jnt2_pos23[0];
		let jnt3_pos3 = jnt3_jnt2_pos23[2];
		let jnt3_pos4 = jnt3_jnt2_pos45[0];
		let jnt3_pos5 = jnt3_jnt2_pos45[2];
		let jnt3_pos6 = jnt3_jnt2_pos67[0];
		let jnt3_pos7 = jnt3_jnt2_pos67[2];

		let jnt2_pos0 = jnt3_jnt2_pos01[1];
		let jnt2_pos1 = jnt3_jnt2_pos01[3];
		let jnt2_pos2 = jnt3_jnt2_pos23[1];
		let jnt2_pos3 = jnt3_jnt2_pos23[3];
		let jnt2_pos4 = jnt3_jnt2_pos45[1];
		let jnt2_pos5 = jnt3_jnt2_pos45[3];
		let jnt2_pos6 = jnt3_jnt2_pos67[1];
		let jnt2_pos7 = jnt3_jnt2_pos67[3];

		let jnt4_pos0 = this.SolveTheta4(jnt1_pos0, jnt2_pos0, jnt3_pos0, jnt5_pos0, jnt6_pos0, nx, ny, nz, ox, oy, oz, ax, ay, az);
		let jnt4_pos1 = this.SolveTheta4(jnt1_pos0, jnt2_pos1, jnt3_pos1, jnt5_pos0, jnt6_pos0, nx, ny, nz, ox, oy, oz, ax, ay, az);
		let jnt4_pos2 = this.SolveTheta4(jnt1_pos0, jnt2_pos2, jnt3_pos2, jnt5_pos1, jnt6_pos1, nx, ny, nz, ox, oy, oz, ax, ay, az);
		let jnt4_pos3 = this.SolveTheta4(jnt1_pos0, jnt2_pos3, jnt3_pos3, jnt5_pos1, jnt6_pos1, nx, ny, nz, ox, oy, oz, ax, ay, az);
		let jnt4_pos4 = this.SolveTheta4(jnt1_pos1, jnt2_pos4, jnt3_pos4, jnt5_pos2, jnt6_pos2, nx, ny, nz, ox, oy, oz, ax, ay, az);
		let jnt4_pos5 = this.SolveTheta4(jnt1_pos1, jnt2_pos5, jnt3_pos5, jnt5_pos2, jnt6_pos2, nx, ny, nz, ox, oy, oz, ax, ay, az);
		let jnt4_pos6 = this.SolveTheta4(jnt1_pos1, jnt2_pos6, jnt3_pos6, jnt5_pos3, jnt6_pos3, nx, ny, nz, ox, oy, oz, ax, ay, az);
		let jnt4_pos7 = this.SolveTheta4(jnt1_pos1, jnt2_pos7, jnt3_pos7, jnt5_pos3, jnt6_pos3, nx, ny, nz, ox, oy, oz, ax, ay, az);

		let result = [
			[jnt1_pos0, jnt2_pos0, jnt3_pos0, jnt4_pos0, jnt5_pos0, jnt6_pos0],
			[jnt1_pos0, jnt2_pos1, jnt3_pos1, jnt4_pos1, jnt5_pos0, jnt6_pos0],
			[jnt1_pos0, jnt2_pos2, jnt3_pos2, jnt4_pos2, jnt5_pos1, jnt6_pos1],
			[jnt1_pos0, jnt2_pos3, jnt3_pos3, jnt4_pos3, jnt5_pos1, jnt6_pos1],
			[jnt1_pos1, jnt2_pos4, jnt3_pos4, jnt4_pos4, jnt5_pos2, jnt6_pos2],
			[jnt1_pos1, jnt2_pos5, jnt3_pos5, jnt4_pos5, jnt5_pos2, jnt6_pos2],
			[jnt1_pos1, jnt2_pos6, jnt3_pos6, jnt4_pos6, jnt5_pos3, jnt6_pos3],
			[jnt1_pos1, jnt2_pos7, jnt3_pos7, jnt4_pos7, jnt5_pos3, jnt6_pos3],
		];

		return result;
		// return joints;
	}

	SolveTheta2(theta1, theta3, theta5, theta6, n, m, a1, a2, nz) {
		let s1 = Math.sin(theta1);
		let c1 = Math.cos(theta1);
		let s3 = Math.sin(theta3);
		let c3 = Math.cos(theta3);
		let s5 = Math.sin(theta5);
		let c5 = Math.cos(theta5);
		let s6 = Math.sin(theta6);
		let c6 = Math.cos(theta6);
		let A = (n * (a1 + a2 * c3) - m * a2 * s3) / (a1 * a1 + a2 * a2 + 2 * a1 * a2 * c3);
		let B = (m + a2 * s3 * A) / (a2 * c3 + a1);
		let theta2 = Math.atan2(A, B);
		return theta2;
	}
	SolveTheta3AndTheta2(theta1, theta5, theta6, a1, a2, d0, d4, d5, nx, ny, nz, ox, oy, oz, ax, ay, az, px, py, pz) {
		let s1 = Math.sin(theta1);
		let c1 = Math.cos(theta1);
		let s6 = Math.sin(theta6);
		let c6 = Math.cos(theta6);
		let m = d4 * ((c1 * nx + s1 * ny) * s6 + (c1 * ox + s1 * oy) * c6) - d5 * (c1 * ax + s1 * ay) + c1 * px + s1 * py;
		let n = d4 * (s6 * nz + c6 * oz) - d5 * az + pz - d0;
		// let theta3 = new Array(2);
		// theta3 condition:  m^2+n^2<=(a(2)+a(3))^2

		let theta3_0 = Math.acos((m * m + n * n - a1 * a1 - a2 * a2) / (2 * a1 * a2));
		let theta3_1 = -theta3_0;
		let theta2_0 = this.SolveTheta2(theta1, theta3_0, theta5, theta6, n, m, a1, a2, nz);
		let theta2_1 = this.SolveTheta2(theta1, theta3_1, theta5, theta6, n, m, a1, a2, nz);
		let theta3_theta2 = new Array(4);
		theta3_theta2[0] = theta3_0;
		theta3_theta2[1] = theta2_0;
		theta3_theta2[2] = theta3_1;
		theta3_theta2[3] = theta2_1;
		return theta3_theta2;
	}
	SolveTheta5(theta1, ax, ay) {
		let c1 = Math.cos(theta1);
		let s1 = Math.sin(theta1);
		let theta5_0 = Math.acos(s1 * ax - c1 * ay);
		let thate5_1 = -theta5_0;
		// let theta5 = [theta5_0, theta5_1];
		return theta5_0;
	}

	SolveTheta6(theta1, theta5, ox, oy, nx, ny) {
		let s1 = Math.sin(theta1);
		let c1 = Math.cos(theta1);
		let s5 = Math.sin(theta5);
		// let c5 = Math.cos(theta5);
		let theta6 = Math.atan2((-s1 * ox + c1 * oy) / s5, (-c1 * ny + s1 * nx) / s5);
		return theta6;
	}



	SolveTheta4(theta1, theta2, theta3, theta5, theta6, nx, ny, nz, ox, oy, oz, ax, ay, az) {
		let s1 = Math.sin(theta1);
		let c1 = Math.cos(theta1);
		let s5 = Math.sin(theta5);
		let c5 = Math.cos(theta5);
		let s6 = Math.sin(theta6);
		let c6 = Math.cos(theta6);
		let C = (nz * c6 - oz * s6) * c5 - az * s5;
		let D = ((c1 * nx + s1 * ny) * c6 - (c1 * ox + s1 * oy) * s6) * c5 - (c1 * ax + s1 * ay) * s5;
		let theta4 = Math.atan2(C, D) - theta2 - theta3;
		return theta4;
	}

	aubo_forward(q) {
		const a = [0, 0.408, 0.376, 0, 0, 0];
		const d = [0.122, 0, 0, 0.1215, 0.1025, 0.094];
		const a2 = a[1], a3 = a[2];
		const d1 = d[0], d2 = d[3], d3 = d[2], d4 = d[3], d5 = d[4], d6 = d[5];
		const alpha = [Math.PI / 2, Math.PI, Math.PI, -Math.PI / 2, Math.PI / 2, 0];
		const T = Array.from({ length: 4 }, x => Array.from({ length: 4 }, y => 0));
		const q1 = q[0], q2 = q[1], q3 = q[2], q4 = q[3], q5 = q[4], q6 = q[5];
		const C1 = cos(q1), C2 = cos(q2), C4 = cos(q4), C5 = cos(q5), C6 = cos(q6);
		const C23 = cos(q2 - q3), C234 = cos(q2 - q3 + q4), C2345 = cos(q2 - q3 + q4 - q5), C2345p = cos(q2 - q3 + q4 + q5);
		const S1 = sin(q1), S2 = sin(q2), S4 = sin(q4), S5 = sin(q5), S6 = sin(q6);
		const S23 = sin(q2 - q3), S234 = sin(q2 - q3 + q4);

		T[0][0] = -C6 * S1 * S5 + C1 * (C234 * C5 * C6 - S234 * S6);
		T[0][1] = S1 * S5 * S6 - C1 * (C4 * C6 * S23 + C23 * C6 * S4 + C234 * C5 * S6);
		T[0][2] = C5 * S1 + C1 * C234 * S5;
		T[0][3] = (d2 + C5 * d6) * S1 - C1 * (a2 * S2 + (a3 + C4 * d5) * S23 + C23 * d5 * S4 - C234 * d6 * S5);

		T[1][0] = C234 * C5 * C6 * S1 + C1 * C6 * S5 - S1 * S234 * S6;
		T[1][1] = -C6 * S1 * S234 - (C234 * C5 * S1 + C1 * S5) * S6;
		T[1][2] = -C1 * C5 + C234 * S1 * S5;
		T[1][3] = -C1 * (d2 + C5 * d6) - S1 * (a2 * S2 + (a3 + C4 * d5) * S23 + C23 * d5 * S4 - C234 * d6 * S5);

		T[2][0] = C5 * C6 * S234 + C234 * S6;
		T[2][1] = C234 * C6 - C5 * S234 * S6;
		T[2][2] = S234 * S5;
		T[2][3] = d1 + a2 * C2 + a3 * C23 + d5 * C234 + d6 * C2345 / 2 - d6 * C2345p / 2;
		T[3] = [0, 0, 0, 1];
		const result = new THREE.Matrix4();
		result.set(
			T[0][0], T[0][1], T[0][2], T[0][3],
			T[1][0], T[1][1], T[1][2], T[1][3],
			T[2][0], T[2][1], T[2][2], T[2][3],
			T[3][0], T[3][1], T[3][2], T[3][3],
		);
		let euler = new THREE.Euler(0, 0, 0, 'XYZ');
		let vec3 = new THREE.Vector3(0, 0, 0);
		euler = euler.setFromRotationMatrix(result);
		vec3 = vec3.applyMatrix4(result);
		return [vec3.x, vec3.y, vec3.z, euler.x, euler.y, euler.z];
	}
	aubo_inverse(cart_pos) {
		const a = [0, 0.408, 0.376, 0, 0, 0];
		const d = [0.122, 0, 0, 0.1215, 0.1025, 0.094];
		const a2 = a[1], a3 = a[2];
		const d1 = d[0], d2 = d[3], d3 = d[2], d4 = d[3], d5 = d[4], d6 = d[5];
		const alpha = [Math.PI / 2, Math.PI, Math.PI, -Math.PI / 2, Math.PI / 2, 0];
		let singularity = false;
		let q_sols = Array.from({ length: 6 }, x => Array.from({ length: 8 }, y => 0));
		let num_sols = 0;
		// const nx = T(0, 0); const ox = T(0, 1); const ax = T(0, 2); const px = T(0, 3);
		// const ny = T(1, 0); const oy = T(1, 1); const ay = T(1, 2); const py = T(1, 3);
		// const nz = T(2, 0); const oz = T(2, 1); const az = T(2, 2); const pz = T(2, 3);
		let nx = cart_pos[0]; let ox = cart_pos[1]; let ax = cart_pos[2]; let px = cart_pos[3];
		let ny = cart_pos[4]; let oy = cart_pos[5]; let ay = cart_pos[6]; let py = cart_pos[7];
		let nz = cart_pos[8]; let oz = cart_pos[9]; let az = cart_pos[10]; let pz = cart_pos[11];

		//////////////////////// shoulder rotate jolet (q1) //////////////////////////////
		// VectorXd q1(2);
		let q1 = new Array(2);

		const A1 = d6 * ay - py;
		const B1 = d6 * ax - px;
		const R1 = A1 * A1 + B1 * B1 - d2 * d2;


		if (R1 < 0.0)
			return num_sols;
		else {
			const R12 = sqrt(R1);
			q1[0] = this.antiSinCos(A1, B1) - this.antiSinCos(d2, R12);
			q1[1] = this.antiSinCos(A1, B1) - this.antiSinCos(d2, -R12);
			for (let i = 0; i < 2; i++) {
				while (q1[i] > PI)
					q1[i] -= 2 * PI;
				while (q1[i] < -PI)
					q1[i] += 2 * PI;
			}
		}

		////////////////////////////// wrist 2 jolet (q5) //////////////////////////////
		// MatrixXd q5(2, 2);
		let q5 = Array.from({ length: 2 }, x => Array.from({ length: 2 }, y => 0));

		for (let i = 0; i < 2; i++) {

			const C1 = cos(q1[i]), S1 = sin(q1[i]);
			const B5 = -ay * C1 + ax * S1;
			const M5 = (-ny * C1 + nx * S1);
			const N5 = (-oy * C1 + ox * S1);

			const R5 = sqrt(M5 * M5 + N5 * N5);

			q5[i][0] = this.antiSinCos(R5, B5);
			q5[i][1] = this.antiSinCos(-R5, B5);
		}

		////////////////////////////////////////////////////////////////////////////////

		////////////////////////////// wrist 3 jolet (q6) //////////////////////////////
		let q6;
		// VectorXd q3(2), q2(2), q4(2);
		let q3 = new Array(2);
		let q2 = new Array(2);
		let q4 = new Array(2);

		for (let i = 0; i < 2; i++) {
			for (let j = 0; j < 2; j++) {
				// wrist 3 jolet (q6) //
				const C1 = cos(q1[i]), S1 = sin(q1[i]);
				const S5 = sin(q5[i][j]);

				const A6 = (-oy * C1 + ox * S1);
				const B6 = (ny * C1 - nx * S1);

				if (abs(S5) < ZERO_THRESH) {
					singularity = true;
					break;
				} else
					q6 = this.antiSinCos(A6 * S5, B6 * S5);

				/////// jolets (q3,q2,q4) //////
				const C6 = cos(q6);
				const S6 = sin(q6);

				const pp1 = C1 * (ax * d6 - px + d5 * ox * C6 + d5 * nx * S6) + S1 * (ay * d6 - py + d5 * oy * C6 + d5 * ny * S6);
				const pp2 = -d1 - az * d6 + pz - d5 * oz * C6 - d5 * nz * S6;
				const B3 = (pp1 * pp1 + pp2 * pp2 - a2 * a2 - a3 * a3) / (2 * a2 * a3);


				if ((1 - B3 * B3) < ZERO_THRESH) {
					singularity = true;
					continue;
				} else {
					const Sin3 = sqrt(1 - B3 * B3);
					q3[0] = this.antiSinCos(Sin3, B3);
					q3[1] = this.antiSinCos(-Sin3, B3);
				}

				for (let k = 0; k < 2; k++) {

					const C3 = cos(q3[k]), S3 = sin(q3[k]);
					const A2 = pp1 * (a2 + a3 * C3) + pp2 * (a3 * S3);
					const B2 = pp2 * (a2 + a3 * C3) - pp1 * (a3 * S3);

					q2[k] = this.antiSinCos(A2, B2);

					const C2 = cos(q2[k]), S2 = sin(q2[k]);

					const A4 = -C1 * (ox * C6 + nx * S6) - S1 * (oy * C6 + ny * S6);
					const B4 = oz * C6 + nz * S6;
					const A41 = pp1 - a2 * S2;
					const B41 = pp2 - a2 * C2;

					q4[k] = this.antiSinCos(A4, B4) - this.antiSinCos(A41, B41);
					while (q4[k] > PI)
						q4[k] -= 2 * PI;
					while (q4[k] < -PI)
						q4[k] += 2 * PI;

					q_sols[0][num_sols] = q1[i]; q_sols[1][num_sols] = q2[k];
					q_sols[2][num_sols] = q3[k]; q_sols[3][num_sols] = q4[k];
					q_sols[4][num_sols] = q5[i][j]; q_sols[5][num_sols] = q6;
					num_sols++;
				}
			}
		}
		const result = this.reverseMatrix(q_sols);
		return result;
	}
	antiSinCos(sA, cA) {
		let eps = 1e-8;
		let angle = 0;
		if ((abs(sA) < eps) && (abs(cA) < eps)) {
			return 0;
		}
		if (abs(cA) < eps)
			angle = PI / 2.0 * this.SIGN(sA);
		else if (abs(sA) < eps) {
			if (this.SIGN(cA) == 1)
				angle = 0;
			else
				angle = PI;
		} else {
			angle = atan2(sA, cA);
		}

		return angle;
	}
	SIGN(x) {
		if (x > 0) {
			return 1;
		} else if (x < 0) {
			return -1;
		} else {
			return 0;
		}
		// return (x > 0) - (x < 0);
	}
	reverseMatrix(sourceArr) {

		let reversedArr = [];

		for (let n = 0; n < sourceArr[0].length; n++) {

			reversedArr[n] = [];

			for (let j = 0; j < sourceArr.length; j++) {

				reversedArr[n][j] = sourceArr[j][n];

			}

		}

		return reversedArr;

	}
	calculation(vectorBefore: THREE.Vector3, vectorAfter: THREE.Vector3) {
		let rotationAxis;
		let rotationAngle;
		let rotationMatrix;
		rotationAxis = this.CrossProduct(vectorBefore, vectorAfter);
		rotationAngle = vectorBefore.angleTo(vectorAfter);
		rotationMatrix = this.RotationMatrix(rotationAngle, rotationAxis);
		let quat = new THREE.Quaternion();
		quat.setFromRotationMatrix(rotationMatrix);
		return quat;
	}

	CrossProduct(v1, v2) {
		let c = new THREE.Vector3();

		c.set(v1.y * v2.z - v1.z * v2.y,
		v1.z * v2.x - v1.x * v2.z,
			v1.x * v2.y - v1.y * v2.x
		);
		return c.normalize();
	}


	RotationMatrix(angle, u) {
		// double norm = Normalize(u);
		let rotatinMatrix = new THREE.Matrix4();

		// u.x = u.x / norm;
		// u.y = u.y / norm;
		// u.z = u.z / norm;

		rotatinMatrix.set(
			Math.cos(angle) + u.x * u.x * (1 - Math.cos(angle)),
			u.x * u.y * (1 - Math.cos(angle) - u.z * Math.sin(angle)),
			u.y * Math.sin(angle) + u.x * u.z * (1 - Math.cos(angle)),
			0,

			u.z * Math.sin(angle) + u.x * u.y * (1 - Math.cos(angle)),
			Math.cos(angle) + u.y * u.y * (1 - Math.cos(angle)),
			-u.x * Math.sin(angle) + u.y * u.z * (1 - Math.cos(angle)),
			0,

			-u.y * Math.sin(angle) + u.x * u.z * (1 - Math.cos(angle)),
			u.x * Math.sin(angle) + u.y * u.z * (1 - Math.cos(angle)),
			Math.cos(angle) + u.z * u.z * (1 - Math.cos(angle)),
			0,

			0, 0, 0, 1
		);

		return rotatinMatrix;
	}


}
export default Kinematics;





