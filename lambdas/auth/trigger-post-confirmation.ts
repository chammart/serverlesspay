/**
 *  Copyright Folksdo.com, Inc. or its affiliates. All Rights Reserved.
 *
 */

// Disable automatic export
export { };

// Handler
exports.handler = async (event: any) => {
  if (event.request.userAttributes.email) {
    `Congratulations ${event.userName}, you have been confirmed.`;
  }
  return event;
};
