import React from 'react';

function ComponentWithError() {
  // This will intentionally throw an error
  throw new Error('This is an intentional error.');
}

export default ComponentWithError;