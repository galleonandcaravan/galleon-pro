import React, { Component } from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';

import { HEADER_AUTH_LINKS, PAGES } from '../../constants';
import HeaderMobile from '../HeaderMobile';
import logo from './images/logo.svg';

import './styles.css';

class Header extends Component {
  static propTypes = {
    activePage: PropTypes.string,
    popupVisibleBlock: PropTypes.string.isRequired,
    togglePopup: PropTypes.func.isRequired
  };

  static defaultProps = {
    activePage: ''
  };

  handleMenuItem = event => {
    event.preventDefault();
    event.stopPropagation();
    const { popupVisibleBlock, togglePopup } = this.props;

    if (!window.disableLinks && !window.disableMouseWheel) {
      const hash = event.target.href.split('#')[1];
      window.location.hash = hash;
      if (popupVisibleBlock) {
        togglePopup();
      }
    }
  };

  render() {
    const { activePage, popupVisibleBlock, togglePopup } = this.props;

    return (
      <div className="header">
        <div className="header__container">
          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
          <img
            className="header-logo"
            src={logo}
            alt=""
            onClick={() => {
              window.location.hash = '';
              if (popupVisibleBlock) {
                window.skipAnimation = true;
                togglePopup();
              }
            }}
          />
          <img className="header-logo_mobile" src={logo} alt="" />

          <ul className="header-menu">
            <li
              className={cn('header-menu__item', {
                'header-menu__item-active':
                  (activePage === PAGES.ABOUT || !activePage) && !popupVisibleBlock
              })}
            >
              <a href={`#${PAGES.ABOUT}`} onClick={this.handleMenuItem}>
                About
              </a>
            </li>

            <li
              className={cn('header-menu__item', {
                'header-menu__item-active':
                  activePage === PAGES.CONTACT && !popupVisibleBlock
              })}
            >
              <a href={`#${PAGES.CONTACT}`} onClick={this.handleMenuItem}>
                Contact
              </a>
            </li>
          </ul>

          <ul className="header-auth">
            <li className="header-auth__item">
              <a href={HEADER_AUTH_LINKS.REGISTER}>Register</a>
            </li>

            <li className="header-auth__item">
              <a href={HEADER_AUTH_LINKS.LOGIN}>Log In</a>
            </li>
          </ul>
        </div>

        <HeaderMobile
          activePage={activePage}
          popupVisibleBlock={popupVisibleBlock}
          togglePopup={togglePopup}
        />
      </div>
    );
  }
}

export default Header;
