import { isHtmlElement } from './utils';

export default class Point {
  constructor (point, $scrollElement, horizontal) {
    this.point = point;
    this.$scrollElement = $scrollElement;
    this.horizontal = horizontal;
  }

  /**
   * Gets the pixels from a given number or dom element
   *
   * @param  {number|HTMLElement} point
   * @returns number
   */
  getPxFromPoint () {
    const { point, $scrollElement, horizontal } = this;
    // let a;
    if (isHtmlElement(point)) {
      if (horizontal) {
        return point.offsetLeft - ($scrollElement.offsetLeft || 0);
      }
      return point.offsetTop - ($scrollElement.offsetTop || 0);
    }
    return point;
  }
}
