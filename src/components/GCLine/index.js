/* eslint-disable prefer-const */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { GC_LINE_MARGIN_TOP } from './constants';
import gImage from './images/g.svg';
import cImage from './images/c.svg';
import {isTablet, isMobile, isDesktop, isIOS} from '../../utils/media';
import './styles.css';

const UP_ARROW_KEY_NUM = 38;
const DOWN_ARROW_KEY_NUM = 40;
const ARROW_LINE_MOVE_AMOUNT = 2;
const LINE_MOVE_SPEED = 10;

class GCLine extends Component {
  static propTypes = {
    activePage: PropTypes.string,
    isHidden: PropTypes.bool
  };

  static defaultProps = {
    activePage: '',
    isHidden: false
  };

  state = {
    mountAnimateStarted: false,
    animateTransformStop: false
  };

  constructor(props) {
    super(props);
    this.dragStarted = false;
    this.gcLineCenter = React.createRef();
    this.linePosY = 0;
    window.checkLinePositionPaused = false;
    this.moveLineIntervalUp = false;
    this.moveLineIntervalDown = false;
  }

  componentDidMount() {
    this.currentLinePositionY = this.getCenterLinePosY();
    this.nextLinePosY = this.currentLinePositionY;
    this.clientHeight = document.body.clientHeight;
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('hashchange', this.handleChangePage);

    this.imagesSwitcher = document.querySelector('.js-images-switcher');

    if (isTablet() || isMobile()) {
      if (this.gcLineCenter.current) {
        this.gcLineCenter.current.addEventListener('touchstart', this.mouseDown, false);
        this.gcLineCenter.current.addEventListener('touchend', this.mouseUp, false);
      }
    } else {
      if (this.gcLineCenter.current) {
        this.gcLineCenter.current.addEventListener('mousedown', this.mouseDown, false);
      }
      window.addEventListener('mouseup', this.mouseUp, false);

      document.addEventListener('keydown', this.handleKeyDownNav);
      document.addEventListener('keyup', this.handleKeyUpNav);
    }

    this.handleResize();
    this.getDOMNodes();

    setTimeout(() => {
      this.startMountAnimate();

      setTimeout(() => {
        this.setState({
          animateTransformStop: true,
        });

        if (this.gcLineCenter.current) {
          this.gcLineCenter.current.classList.add('gcLine__center--active');
        }
      }, !isMobile() ? 630 : 0);
    }, !isMobile() ? 1400 : 0);

    this.setLineAndImagesPosition(this.currentLinePositionY, true);
  }

  componentDidUpdate(prevProps) {
    const { activePage } = this.props;

    // Page changed, start pageChanged method in next tick
    if (prevProps.activePage !== activePage && !window.skipAnimation) {
      setTimeout(() => {
        this.pageChanged();
      }, 0);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('hashchange', this.handleChangePage);
    document.removeEventListener('keydown', this.handleKeyDownNav);
    document.removeEventListener('keyup', this.handleKeyUpNav);
    if (this.gcLineCenter.current) {
      this.gcLineCenter.current.removeEventListener('mousedown', this.mouseDown, false);
      this.gcLineCenter.current.removeEventListener('touchstart', this.mouseDown, false);
      this.gcLineCenter.current.removeEventListener('touchend', this.mouseUp, false);
    }
    clearInterval(this.checkLinePositionInterval);
  }

  resetPosition = () => {
    this.nextLinePosY = this.getCenterLinePosY();
  };

  pageChanged = () => {
    // Page changed. Detect position and start smoothly line move
    this.getDOMNodes();
    const { screenLinePaddingBottom } = this.getScreenLinePaddings();

    window.animateStep = 1;
    this.nextLinePosY = this.clientHeight - screenLinePaddingBottom;
    this.startMove = true;
    this.prevImageTopHeight = 0;
  };

  handleResize = () => {
    if (
      this.prevWindowWidth !== window.innerWidth ||
      this.clientHeight !== document.body.clientHeight
    ) {
      this.clientHeight = document.body.clientHeight;
      this.clientWidth = document.body.clientWidth;
      this.isTablet = isTablet();
      this.isMobile = isMobile();
      this.imagesSwitcherHeight = this.imagesSwitcher.offsetHeight;
      this.getDOMNodes();
      this.getGCLineMarginTop();
      this.resetPosition();
      this.setLineAndImagesPosition(this.nextLinePosY, true);
    }
    this.prevWindowWidth = window.innerWidth;
  };

  handleChangePage = () => {
    if (this.checkLinePositionInterval) {
      clearInterval(this.checkLinePositionInterval);
    }

    this.checkLinePositionInterval = setInterval(this.checkLinePosition, 10);
  };

  startMountAnimate = () => {
    this.setState({
      mountAnimateStarted: true
    });
  };

  getMinimumDesktopPaddings = () => {
    const { clientHeight } = this;
    let minimumDesktopPaddingTop = (clientHeight - 650) / 2;
    let minimumDesktopPaddingBottom = (clientHeight - 650) / 2 + 70;

    if (minimumDesktopPaddingTop < 100) {
      minimumDesktopPaddingTop = 100;
    }

    if (minimumDesktopPaddingBottom < 140) {
      minimumDesktopPaddingBottom = 140;
    }
    return {
      minimumDesktopPaddingTop,
      minimumDesktopPaddingBottom
    };
  };

  getMinimumTabletPaddings = () => {
    return {
      minimumTabletPaddingTop:
        (this.clientHeight / 100) * 33 - this.gcLineMarginTop,
      minimumTabletPaddingBottom:
        (this.clientHeight / 100) * 24 + this.gcLineMarginTop
    };
  };

  getMinimumMobilePaddings = () => {
    return {
      minimumMobilePaddingTop:
        (this.clientHeight / 100) * 33,
      minimumMobilePaddingBottom:
        (this.clientHeight / 100) * 35
    };
  };

  getScreenLinePaddings = () => {
    // Get screen paddings for line
    const {
      minimumDesktopPaddingTop,
      minimumDesktopPaddingBottom
    } = this.getMinimumDesktopPaddings();

    const {
      minimumTabletPaddingTop,
      minimumTabletPaddingBottom
    } = this.getMinimumTabletPaddings();

    const {
      minimumMobilePaddingTop,
      minimumMobilePaddingBottom
    } = this.getMinimumMobilePaddings();

    let screenLinePaddingTop = this.isTablet
      ? minimumTabletPaddingTop
      : minimumDesktopPaddingTop;

    let screenLinePaddingBottom = this.isTablet
      ? minimumTabletPaddingBottom
      : minimumDesktopPaddingBottom;

    if (this.isMobile) {
      screenLinePaddingTop = minimumMobilePaddingTop;
      screenLinePaddingBottom = minimumMobilePaddingBottom;
    }

    return {
      screenLinePaddingTop,
      screenLinePaddingBottom
    };
  };

  getGCLineMarginTop = () => {
    let gcLineMarginTop = GC_LINE_MARGIN_TOP.DEFAULT;
    if (isTablet()) {
      gcLineMarginTop = GC_LINE_MARGIN_TOP.TABLET;
    }
    if (isMobile()) {
      gcLineMarginTop = GC_LINE_MARGIN_TOP.MOBILE;
    }
    this.gcLineMarginTop = gcLineMarginTop;
  };

  getCenterLinePosY = () => {
    return document.body.clientHeight / 2;
  };

  getDOMNodes = () => {
    this.imagesTopDOM = [
      ...document.querySelectorAll('.js-image-switcher-top')
    ];
    this.imagesBottomDOM = [
      ...document.querySelectorAll('.js-image-switcher-bottom')
    ];
    this.gcLineDOM = document.querySelector('.js-gcLine');
  };

  checkLinePosition = () => {
    const { screenLinePaddingTop } = this.getScreenLinePaddings();

    if (!window.enableLineAnimation) {
      clearInterval(this.checkLinePositionInterval);
    }

    if (window.checkLinePositionPaused) {
      return;
    }

    if (this.nextLinePosY && this.currentLinePositionY) {
      let lineYChanged = false;

      // To top
      if (window.animateStep === 2) {
        if (this.currentLinePositionY > this.nextLinePosY) {
          // Calc speed
          const speed = this.getMoveSpeed(
            this.currentLinePositionY - this.nextLinePosY
          );

          this.currentLinePositionY += -speed;
          lineYChanged = true;
        } else {
          window.animateStep = 3; // Change step of aniamtion
          this.nextLinePosY = this.getCenterLinePosY();
        }
      }

      // To bottom and to center
      if (window.animateStep === 1 || window.animateStep === 3) {
        if (this.currentLinePositionY < this.nextLinePosY) {
          // Calc speed
          const speed = this.getMoveSpeed(
            this.nextLinePosY - this.currentLinePositionY
          );

          this.currentLinePositionY += speed;
          lineYChanged = true;
        } else {
          window.animateStep =
            window.animateStep === 1 // Change step of aniamtion
              ? 2
              : 4;

          if (window.animateStep === 2) {
            this.nextLinePosY = screenLinePaddingTop;
          }
        }
      }

      if (lineYChanged) {
        // Set position of line and images
        this.setLineAndImagesPosition(this.currentLinePositionY);
      }
    }
  };

  getMoveSpeed = diffY => {
    const speed = Math.ceil(diffY / 30);
    return speed < 2 ? 2 : speed;
  };

  setLineAndImagesPosition = (linePosY, force) => {
    if (!this.imageTopDOM) {
      this.getDOMNodes();
    }
    const { clientHeight } = this;
    const halfScreenHeight = clientHeight / 2;
    const {
      screenLinePaddingTop,
      screenLinePaddingBottom
    } = this.getScreenLinePaddings();
    const clientHeight15Percent = (clientHeight / 100) * 15;
    let posY = linePosY - 12;
    if (posY <= screenLinePaddingTop) {
      posY = screenLinePaddingTop;
    }

    if (posY >= clientHeight - screenLinePaddingBottom) {
      posY = clientHeight - screenLinePaddingBottom;
    }

    // Calc line pos y
    const centerLinePosY = posY - halfScreenHeight;

    // Calc height of images containers
    let imageTopHeight = posY + 12 + this.gcLineMarginTop - clientHeight15Percent + 20;
    let imageBottomHeight = clientHeight - 12 - posY - this.gcLineMarginTop - clientHeight15Percent - 20;

    if (isTablet() || isMobile()) {
      imageTopHeight = posY - (clientHeight - this.imagesSwitcherHeight) / 2 + 15;
      imageBottomHeight = this.imagesSwitcherHeight - imageTopHeight;
    }

    // Set styles
    if (force || this.prevImageTopHeight !== imageTopHeight) {
      this.gcLineDOM.style.transform = `translateY(${centerLinePosY}px)`;
      this.imagesTopDOM.forEach(imageTopDOM => {
        imageTopDOM.style.height = `${imageTopHeight}px`;
      });
      this.imagesBottomDOM.forEach(imageBottomDOM => {
        imageBottomDOM.style.height = `${imageBottomHeight}px`;
      });

      this.linePosY = linePosY;
    }

    this.prevImageTopHeight = imageTopHeight;
  };

  mouseDown = (event) => {
    if (isTablet() || isMobile()) {
      event.preventDefault();
      this.gcLineCenter.current.addEventListener('touchmove', this.lineMove, false);
    } else {
      window.addEventListener('mousemove', this.lineMove, true);
    }
    window.checkLinePositionPaused = true;
  };

  mouseUp = () => {
    if (isTablet() || isMobile()) {
      this.gcLineCenter.current.removeEventListener('touchmove', this.lineMove, false);
    } else {
      this.gcLineCenter.current.classList.remove('gcLine_dragged');
      window.removeEventListener('mousemove', this.lineMove, true);
    }
    window.checkLinePositionPaused = false;
  };

  getTouches = (event) => {
    return event.touches || event.originalEvent.touches;
  };

  lineMove = (event) => {
    const line = this.gcLineCenter.current;
    let movePositionTop = event.clientY + GC_LINE_MARGIN_TOP.DEFAULT;

    if (isTablet() || isMobile()) {
      let touches = this.getTouches(event);

      if (touches.length > 0) {
        movePositionTop = touches[0].clientY + GC_LINE_MARGIN_TOP.MOBILE;
      }
    }

    if(window.scrollY > 0 && isIOS()) {
      movePositionTop += window.scrollY / 3;
    }

    line.classList.add('gcLine_dragged');
    this.setLineAndImagesPosition(movePositionTop, false);
  };

  moveLineUp = () => {
    if (this.moveLineIntervalUp) {
      return;
    }
    this.moveLineIntervalUp = setInterval(() => {
      let linePosition = this.linePosY - ARROW_LINE_MOVE_AMOUNT;
      this.setLineAndImagesPosition(linePosition, false);
    }, LINE_MOVE_SPEED);
  };

  moveLineDown = () => {
    if (this.moveLineIntervalDown) {
      return;
    }

    this.moveLineIntervalDown = setInterval(() => {
      let linePosition = this.linePosY + ARROW_LINE_MOVE_AMOUNT;
      this.setLineAndImagesPosition(linePosition, false);
    }, LINE_MOVE_SPEED);
  };

  handleKeyDownNav = event => {
    const { popupVisibleBlock } = this.state;
    const keyNum = event.keyCode ? event.keyCode : event.which;

    if (
      !window.disableLinks &&
      !window.disableKeyboardNav &&
      !popupVisibleBlock &&
      isDesktop() &&
      ( keyNum === UP_ARROW_KEY_NUM || keyNum === DOWN_ARROW_KEY_NUM )
    ) {
      switch (keyNum) {
        case UP_ARROW_KEY_NUM:
          this.moveLineUp();
          break;
        case DOWN_ARROW_KEY_NUM:
          this.moveLineDown();
          break;
        default:
          return;
      }
    }

    event.preventDefault();
  };

  handleKeyUpNav = event => {
    const keyNum = event.keyCode ? event.keyCode : event.which;

    switch (keyNum) {
      case UP_ARROW_KEY_NUM:
        clearInterval(this.moveLineIntervalUp);
        this.moveLineIntervalUp = false;
        break;
      case DOWN_ARROW_KEY_NUM:
        clearInterval(this.moveLineIntervalDown);
        this.moveLineIntervalDown = false;
        break;
      default:

    }
  };

  render() {
    const { isHidden } = this.props;
    const { mountAnimateStarted, animateTransformStop } = this.state;

    return (
      <Fragment>
        <div
          className={cn(
            'gcLine',
            { gcLine_hidden: isHidden || !mountAnimateStarted },
            { gcLine_animated: mountAnimateStarted }
          )}
        >
          <img src={gImage} className="gcLine__g" alt="" />
          <div
            className="gcLine__center js-gcLine"
            ref={this.gcLineCenter}
          >
            <div className="gcLine__line" />
          </div>

          <img src={cImage} className="gcLine__c" alt="" />
        </div>

        <svg
          className={cn('gcLine__logo', {
            hidden: animateTransformStop
          })}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M24.8649 5.40541L19.4595 0L14.0541 5.40541L18.3784 9.72973V17.9305L8.04996 7.60206C8.43036 6.95828 8.64865 6.20733 8.64865 5.40541C8.64865 3.01715 6.71258 1.08108 4.32432 1.08108C1.93607 1.08108 0 3.01715 0 5.40541C0 7.79366 1.93607 9.72973 4.32432 9.72973C5.12631 9.72973 5.8773 9.51141 6.52111 9.13097L16.8496 19.4595H8.51241C8.03237 17.5943 6.33929 16.2162 4.32432 16.2162C1.93607 16.2162 0 18.1523 0 20.5405C0 22.9288 1.93607 24.8649 4.32432 24.8649C6.33929 24.8649 8.03237 23.4867 8.51241 21.6216H16.8494L6.52098 31.95C5.8772 31.5696 5.12625 31.3514 4.32432 31.3514C1.93607 31.3514 0 33.2874 0 35.6757C0 38.0639 1.93607 40 4.32432 40C6.71258 40 8.64865 38.0639 8.64865 35.6757C8.64865 34.8737 8.43033 34.1227 8.04989 33.4789L18.3784 23.1504V31.4876C16.5133 31.9676 15.1351 33.6607 15.1351 35.6757C15.1351 38.0639 17.0712 40 19.4595 40C21.8477 40 23.7838 38.0639 23.7838 35.6757C23.7838 33.6607 22.4057 31.9676 20.5405 31.4876V23.1504L30.8108 33.4207V39.4595H38.3784V31.8919H32.3398L22.0695 21.6216H30.2703L34.5946 25.9459L40 20.5405L34.5946 15.1351L30.2703 19.4595H22.0693L32.3396 9.18919H38.3784V1.62162H30.8108V7.66021L20.5405 17.9305V9.72973L24.8649 5.40541Z" fill="white"/>
        </svg>

        <div
          className={cn('gcLine__logo-transform', {
            hidden: animateTransformStop
          })}
        />
      </Fragment>
    );
  }
}

export default GCLine;
