import React from 'react';
import PropTypes from 'prop-types';
import MainContent from '../../components/MainContent';
import ImagesSwitcher from '../../components/ImagesSwitcher';
import { PAGES_IMAGES } from '../../constants';
import './styles.css';

const About = ({ switcherImagesVisible }) => (
  <div className="about" id="page-about">
    <MainContent
      title="We are <br /><b>GC Pro</b>"
      text="GC Pro's FX services are provided by Ebury Partners <br class='desktop' />UK Limited, a member of Santander Group. <br class='desktop' />Utilising their banking pedigree, our Pro clients <br class='desktop' />are able to transact in more complex <br class='desktop' />products as well as a vast array of exotic <br class='desktop' />currencies."
    />
    <ImagesSwitcher
      imageTop={PAGES_IMAGES.ABOUT.TOP}
      imageBottom={PAGES_IMAGES.ABOUT.BOTTOM}
      imageTopClassName="about__image-top"
      imageBottomClassName="about__image-bottom"
      switcherImagesVisible={switcherImagesVisible}
    />
  </div>
);

About.propTypes = {
  switcherImagesVisible: PropTypes.bool,
}

About.defaultProps = {
  switcherImagesVisible: false,
}
export default About;
