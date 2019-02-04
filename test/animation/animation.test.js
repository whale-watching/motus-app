import Animation from '../../src/animation/Animation';
import { NO_UNIT, COLOR_UNIT } from '../../src/enum/specialUnitEnum';
document.body.innerHTML = `<p>test</p>`;
const $element = document.querySelector('p');
const resetStyles = () => {
  $element.style.width = '10px';
  $element.style.height = '10px';
  $element.style.opacity = 1;
  $element.style.color = 'rgb(0,0,0)';
}
resetStyles();
describe('Animation', () => {
  const keyframesArr = [
    {
      width: 100,
      height: {
        to: 20,
      },
    },
    {
      scale: 1.1,
      color: 'red',
      translate: ['30px', '30%'],
      width: 400,
      opacity: 0.2,
      height: {
        from: 100,
        to: 40,
      },
    },
  ];
  const keyframesObj = {
    0: {
      width: {
        from: 10,
        to: 100,
        unit: 'px',
      },
      height: {
        from: 10,
        to: 20,
        unit: 'px',
      },
    },
    100: {
      opacity: {
        from: 1,
        to: 0.2,
        unit: NO_UNIT,
      },
      width: {
        from: 100,
        to: 400,
        unit: 'px',
      },
      height: {
        from: 100,
        to: 40,
        unit: 'px',
      },
      translate: {
        from: [[0, 'px'], [0, 'px']],
        to: [[30, 'px'], [30, '%']],
        unit: undefined,
      },
      scale: {
        from: 1,
        to: 1.1,
        unit: NO_UNIT,
      },
      color: {
        from: 'rgb(0, 0, 0)',
        to: 'rgb(255, 0, 0)',
        unit: COLOR_UNIT,
      },
    },
  };
  const animation = new Animation(0, 200, $element, keyframesArr);
  it('keyframe normalization', () => {
    expect(animation.keyframes).toEqual(keyframesObj);
  });
  it('throws error if the specified element is not a valid html element', () => {
    expect(() => {
      new Animation(0, 200, false, keyframesArr);
    }).toThrow();
  });
  describe('animation hooks', () => {
    afterEach(() => {
      window.scrollY = 0;
      resetStyles();
    });
    const defaultConfig = {
      started: true,
    }

    describe('onScroll()', () => {
      const scrollMock = jest.fn();
      beforeEach(jest.resetAllMocks);
      const newAnimation = new Animation(100, 200, $element, keyframesArr, {
        onScroll: scrollMock,
        ...defaultConfig,
      });
      // by default animation is not started
      newAnimation.started = true;
      it('contains the scroll position', () => {
        window.scrollY = 123;
        newAnimation.__compute();
        expect(scrollMock.mock.calls.length).toEqual(1);
        expect(scrollMock.mock.calls[0][0]).toEqual(123);
      });
      it('triggers if it is inside parameters', () => {
        // self assignment of window scrollY to simulate scroll
        window.scrollY = 123;
        // call the function that handles animation hooks
        newAnimation.__compute();
        expect(scrollMock.mock.calls.length).toEqual(1);
      });
      it('does not trigger if the animation is not started', () => {
        newAnimation.started = false;
        window.scrollY = 321;
        newAnimation.__compute();
        expect(scrollMock.mock.calls.length).toEqual(0);
      });
    });
    
    describe('onScrollBetween()', () => {
      const scrollMock = jest.fn()
      beforeEach(jest.resetAllMocks);
      const newAnimation = new Animation(100, 200, $element, keyframesArr, { onScrollBetween: scrollMock, ...defaultConfig });
      
      it('contains the scroll position and scroll percent as parameters', () => {
        window.scrollY = 190;
        newAnimation.__compute();
        expect(scrollMock.mock.calls[0][0]).toEqual(190);
        expect(scrollMock.mock.calls[0][1]).toEqual(90);
      });

      it('triggers if it is inside parameters', () => {
        window.scrollY = 190;
        newAnimation.__compute();
        expect(scrollMock.mock.calls.length).toEqual(1);
      });

      it('does not trigger if it is outside parameters', () => {
        window.scrollY = 91;
        newAnimation.__compute();
        expect(scrollMock.mock.calls.length).toEqual(0);
      });
    });

    describe('onScrollBefore()', () => {
      const scrollMock = jest.fn();
      beforeEach(jest.resetAllMocks);

      const newAnimation = new Animation(100, 200, $element, keyframesArr, { onScrollBefore: scrollMock, ...defaultConfig });

      it('contains the scroll position as parameter', () => {
        window.scrollY = 90;
        newAnimation.__compute();
        expect(scrollMock.mock.calls[0][0]).toEqual(90);
      });

      it('triggers if it is before start position', () => {
        window.scrollY = 90;
        newAnimation.__compute();
        expect(scrollMock.mock.calls.length).toEqual(1);
      });

      it('does not trigger if it is outside parameters', () => {
        window.scrollY = 100;
        newAnimation.__compute();
        expect(scrollMock.mock.calls.length).toEqual(0);
      });
    });

    describe('onScrollAfter()', () => {
      const scrollMock = jest.fn();
      beforeEach(jest.resetAllMocks);

      const newAnimation = new Animation(100, 200, $element, keyframesArr, { onScrollAfter: scrollMock, ...defaultConfig });

      it('contains the scroll position as parameter', () => {
        window.scrollY = 290;
        newAnimation.__compute();
        expect(scrollMock.mock.calls[0][0]).toEqual(290);
      });

      it('triggers if it is after start position', () => {
        window.scrollY = 290;
        newAnimation.__compute();
        expect(scrollMock.mock.calls.length).toEqual(1);
      });

      it('does not trigger if it is outside parameters', () => {
        window.scrollY = 140;
        newAnimation.__compute();
        expect(scrollMock.mock.calls.length).toEqual(0);
      });
    });
    describe('onHitBottom()', () => {
      const scrollMock = jest.fn();
      const newAnimation = new Animation(100, 200, $element, keyframesArr, { onHitBottom: scrollMock, ...defaultConfig });
      beforeEach(() => {
        jest.resetAllMocks();
        window.scrollY = 150;
        newAnimation.__compute();
      });

      it('triggers once if it hits the start point or over', () => {
        window.scrollY = 201;
        newAnimation.__compute();
        expect(scrollMock.mock.calls.length).toEqual(1);
      });
      
      it('triggers again only if the scroll went under the start point', () => {
        window.scrollY = 210;
        newAnimation.__compute();
        expect(scrollMock.mock.calls.length).toEqual(1);
        window.scrollY = 110;
        newAnimation.__compute();
        window.scrollY = 210;
        newAnimation.__compute();
        expect(scrollMock.mock.calls.length).toEqual(2);
      });
      it('does not trigger if outside parameters', () => {
        window.scrollY = 190;
        newAnimation.__compute();
        expect(scrollMock.mock.calls.length).toEqual(0);
      });
    });
    describe('onHitTop()', () => {
      const scrollMock = jest.fn();
      const newAnimation = new Animation(100, 200, $element, keyframesArr, { onHitTop: scrollMock, ...defaultConfig });
      beforeEach(() => {
        jest.resetAllMocks();
        window.scrollY = 150;
        newAnimation.__compute();
      });

      it('triggers once if it hits the top point or higher', () => {
        window.scrollY = 99;
        newAnimation.__compute();
        expect(scrollMock.mock.calls.length).toEqual(1);
      });
      it('triggers again only if the scroll over under the end point', () => {
        window.scrollY = 99;
        newAnimation.__compute();
        expect(scrollMock.mock.calls.length).toEqual(1);
        window.scrollY = 101;
        newAnimation.__compute();
        window.scrollY = 99;
        newAnimation.__compute();
        expect(scrollMock.mock.calls.length).toEqual(2);
      });
      it('does not trigger if outside parameters', () => {
        window.scrollY = 101;
        newAnimation.__compute();
        expect(scrollMock.mock.calls.length).toEqual(0);
      });
    });
  });
  describe('start()', () => {
    it('sets the started parameter to true', () => {
      expect(animation.started).toEqual(false);
      animation.start();
      expect(animation.started).toEqual(true);
    });
  });
  describe('stop()', () => {
    it('sets the started parameter to false', () => {
      expect(animation.started).toEqual(true);
      animation.stop();
      expect(animation.started).toEqual(false);
    });
  });
  describe('_getScrollPosition()', () => {
    it('returns the top scroll position', () => {
      expect(animation._getScrollPosition()).toEqual(0);
    });
    it('returns the left scroll position', () => {
      animation.options.horizontal = true;
      expect(animation._getScrollPosition()).toEqual(0);
      animation.options.horizontal = false;
    });
  });
  describe('__compute()', () => {
    it('does not work if the animation is not started', () => {
      const style = $element.style._values;
      animation.__compute();
      expect($element.style._values).toEqual(style);
    });
    it('applies the animation that is matched with the scroll', () => {
      animation.start();
      window.scrollY = 100;
      animation.__compute();
      expect($element.style.width).toEqual('250px');
      expect($element.style.height).toEqual('70px');
    });
    it('applies all the keyframes if the scroll is over the last keyframe', () => {
      animation.start();

      window.scrollY = 201;
      animation.__compute();
      expect($element.style.width).toEqual('400px');
      expect($element.style.height).toEqual('40px');
    });
    it('erases all the styles and applies the 0 keyframe if exists if the scroll is before all keyframes', () => {
      animation.start();

      window.scrollY = -1;
      animation.__compute();
      expect($element.style.width).toEqual('100px');
      expect($element.style.height).toEqual('20px');
    });
  });
});
