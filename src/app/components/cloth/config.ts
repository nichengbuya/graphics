
export const MASS = 0.1;
export const RESTDISTANCE = 25;
export const DAMPING = 0.03;
export const DRAG = 1 - DAMPING;
export const XSEGS = 10;
export const YSEGS = 10;
export const GRAVITY = 981 * 1.4;
export const TIMESTEP  = 18 / 1000;
export const TIMESTEP_SQ = TIMESTEP * TIMESTEP;
export const  clothFunction = (u, v, target) => {
    const x = (u - 0.5) * (RESTDISTANCE * XSEGS);
    const y = (v + 0.5) * (RESTDISTANCE * YSEGS);
    // console.log(x,y)
    const z = 0;
    target.set(x, y, z);
};
