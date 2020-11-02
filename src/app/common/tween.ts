import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';

export const tween = (configs: { from: any; to: any; duration: any; easing?: ((k: any) => any) | undefined; autoStart?: boolean; },
                      onUpdate: any, onComplete: () => any) => {
  const {
    from, to, duration,
    easing = (k: any) => k,
    autoStart = true // 为了使用tween的chain
  } = configs;

  const tweenAnimation = new TWEEN.Tween(from)
    .to(to, duration)
    .easing(easing)
    .onUpdate(onUpdate)
    .onComplete(() => {
      // tslint:disable-next-line: no-unused-expression
      onComplete && onComplete();
    });

  if (autoStart) {
    tweenAnimation.start();
  }

  // animateFrame()
  return tweenAnimation;
};

