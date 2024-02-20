import React from 'react';
// import NotFoundImage from '../../public/icons/writer.svg';
import './error_page.css';

const ErrorPage = ({ error , resetErrorBoundary}) => {
  console.log('Error occured', error);
  console.log('Error occured', resetErrorBoundary);
  return (
    <div className='error-page'>
      <img src={process.env.PUBLIC_URL+'/icons/writer.svg'} alt='Page not found' />
      <p className='error-msg'>
        Something went wrong. Try clicking the refresh page button to reload the
        application.{' '}
        <button className='btn'  onClick={resetErrorBoundary}>
          Refresh page
        </button>
      </p>
    </div>
  );
};

export default ErrorPage;