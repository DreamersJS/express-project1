import React from 'react';

const ScrollButton = ({ show, scrollToBottom }) => (
  show ? (
    <p className='scroll-to-bottom'>
      <button onClick={scrollToBottom}>Scroll to Latest</button>
    </p>
  ) : null
);

export default ScrollButton;
