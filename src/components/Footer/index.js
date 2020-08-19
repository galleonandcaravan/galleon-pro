import React, { Component } from 'react';
import PropTypes from 'prop-types';
import footerIcon from './images/icon.svg';
import './styles.css';

// eslint-disable-next-line react/prefer-stateless-function
class Footer extends Component {
  static propTypes = {
    togglePopup: PropTypes.func.isRequired
  };

  render() {
    const { togglePopup } = this.props;

    return (
      <div className="footer">
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
        <img
          src={footerIcon}
          className="footer-logo"
          alt=""
          onClick={() => {
            window.location.hash = '';
          }}
        />

        <ul className="footer-menu">
          <li className="footer-menu__item">
            <span onClick={() => togglePopup('security')}>Security</span>
          </li>
        </ul>

        <div className="footer-copyright">
          Galcar Limited (t/a GC Pro) is a company registered in England
          and Wales (registered no. 11656491). GC Pro's Payment and Foreign
          Currency Exchange Services are provided by Ebury Partners UK Limited.
          Ebury Partners UK Limited is Authorised and Regulated by the
          Financial Conduct Authority as an Electronic Money Institution
          (Financial Services Register No. 900797).
        </div>
      </div>
    );
  }
}

export default Footer;
